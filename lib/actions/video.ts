'use server';

import {apiFetch, doesTitleMatch, getEnv, withErrorHandling, getOrderByClause} from "@/lib/utils";
import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { BUNNY } from '@/constants';
import {db} from "@/drizzle/db";
import {session, user, videos} from "@/drizzle/schema";
import {revalidatePath} from "next/cache";
import aj from "@/lib/arcjet";
import {fixedWindow} from "arcjet";
import {request} from "@arcjet/next";
import {eq, or, and, sql} from "drizzle-orm";

const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const BUNNY_LIBRARY_ID = getEnv("BUNNY_LIBRARY_ID");
const ACCESS_KEYS = {
    streamAccessKey: getEnv('BUNNY_STREAM_ACCESS_KEY'),
    storageAccessKey: getEnv('BUNNY_STORAGE_ACCESS_KEY'),
};

// Helper function; so you know which user sent the video
const getSessionUserId = async (): Promise<string> => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) throw new Error('Unauthenticated');

    return session.user.id;
};

const revalidateUserId = (paths: string[]) => {
    paths.forEach((path) => revalidatePath(path));
}

const buildVideoWithUserQuery = () => {
    return db
        .select({
            video: videos,
            user: { id: user.id, name: user.name, image: user.image }
        })
        .from(videos)
        .leftJoin(user, eq(videos.userId, user.id))
}

// To know who is the actor of that request: Who is trying to makeing request happen
// This prevent spamming of vids, Ex: 2 Uploads per min, So we don't get spammed with 18+ Things
const validateWithArcjet = async (fingerprint: string ) => {
    const rateLimit = aj.withRule(
        fixedWindow({
            mode: 'LIVE',
            window: '1m',
            max: 2,
            characteristics: ['fingerprint']
        })
    )

    const req = await request();

    const decision = await rateLimit.protect(req, {fingerprint});

    if (decision.isDenied()) {
        throw new Error('Rate Limit Exceeded');
    }
}

//Server Actions
export const getVideoUploadUrl = withErrorHandling(async () => {
    await getSessionUserId();

    // api call to bunny
    const videoResponse = await apiFetch<BunnyVideoResponse>(
        `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
        {
            method: 'POST',
            bunnyType: 'stream',
            body: { title: 'Temporary Title', collectionId: '' }
        }
    );

    const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`;

    return {
        videoID: videoResponse.guid,
        uploadUrl,
        accessKey: ACCESS_KEYS.streamAccessKey,
    };
});

export const getThumbnailUrl = withErrorHandling(async (videoId: string) => {
    const fileName = `${Date.now()}-${videoId}-thumbnail`;
    const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${fileName}`;
    const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${fileName}`;

    return {
        uploadUrl,
        cdnUrl,
        accessKey: ACCESS_KEYS.storageAccessKey
    };
});

export const saveVideoDetails = withErrorHandling(async (videoDetails: VideoDetails) => {
    const userId = await getSessionUserId();
    await validateWithArcjet(userId) // The magic that makes the rate limit now implemented

    await apiFetch(
        `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
        {
            method: 'POST',
            bunnyType: 'stream',
            body: {
                title: videoDetails.title,
                description: videoDetails.description
            }
        }
    );

    await db.insert(videos).values({
        title: videoDetails.title,
        description: videoDetails.description,
        videoUrl: `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
        videoId: videoDetails.videoId,
        thumbnailUrl: videoDetails.thumbnailUrl,
        visibility: (videoDetails.visibility === 'public' || videoDetails.visibility === 'private') ? videoDetails.visibility : 'public',
        userId,
        duration: videoDetails.duration ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    revalidatePath('/')

    return { videoId: videoDetails.videoId}
});

// /?SearchQuery=test&pageNumber=2
export const getAllVideos = withErrorHandling(async (
    searchQuery: string = '',
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8,
) => {
    const User = await auth.api.getSession({ headers: await headers() })
    const currentUserId = User?.user.id

    // Only show public videos if not logged in
    const canSeeTheVideos = currentUserId
      ? or(eq(videos.visibility, 'public'), eq(videos.userId, currentUserId))
      : eq(videos.visibility, 'public');

    const whereCondition = searchQuery.trim()
        ? and(
            canSeeTheVideos,
            doesTitleMatch(videos, searchQuery),
        )
        : canSeeTheVideos

    const [{ totalCount }] = await db
        .select({totalCount: sql<number> `count(*)` })
        .from (videos)
        .where(whereCondition)

    const totalVideo = Number(totalCount || 0);
    const totalPages = Math.ceil(totalVideo / pageSize);

    const videoRecords = await buildVideoWithUserQuery()
        .where(whereCondition)
        .orderBy(
            sortFilter
                ? getOrderByClause(sortFilter)
                : sql`${videos.createdAt} DESC`
        ).limit(pageSize)
        .offset((pageNumber -1) * pageSize);

    // Filter out invalid items
    const validVideoRecords = videoRecords.filter(item => item && item.video);

    return {
        videos: validVideoRecords,
        pagination: {
            currentPage: pageNumber,
            totalPages,
            totalVideo,
            pageSize
        }
    }
     
})

export const getVideoById = withErrorHandling(async (videoId: string) => {
    const [videoRecord] = await buildVideoWithUserQuery()
        .where(eq(videos.videoId, videoId)); // Search by videoId field

    return videoRecord;
});

export const getVideoTranscript = withErrorHandling(async (videoId: string) => {
    try {
        // First, get video info from Bunny to check if transcript is available
        const videoInfoResponse = await apiFetch<any>(
            `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
            {
                method: 'GET',
                bunnyType: 'stream',
            }
        );

        // Check if captions/transcript is available
        if (!videoInfoResponse.captions || videoInfoResponse.captions.length === 0) {
            return null; // No transcript available
        }

        // Get the transcript URL - Bunny usually provides VTT format
        const transcriptUrl = `${BUNNY.TRANSCRIPT_URL}/${BUNNY_LIBRARY_ID}/${videoId}/captions/en.vtt`;
        
        // Fetch the transcript file
        const transcriptResponse = await fetch(transcriptUrl, {
            headers: {
                'AccessKey': ACCESS_KEYS.streamAccessKey,
            }
        });

        if (!transcriptResponse.ok) {
            // Try alternative URL format if the first one fails
            const alternativeUrl = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/captions/en.vtt`;
            const altResponse = await fetch(alternativeUrl, {
                headers: {
                    'AccessKey': ACCESS_KEYS.streamAccessKey,
                }
            });
            
            if (!altResponse.ok) {
                return null;
            }
            
            return await altResponse.text();
        }

        return await transcriptResponse.text();
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return null;
    }

    });