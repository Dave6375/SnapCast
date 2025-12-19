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

    // Attempt to generate captions for the video (non-blocking)
    generateVideoCaptions(videoDetails.videoId).catch(err => {
        console.log('Caption generation initiated or failed:', err);
    });

    return { videoId: videoDetails.videoId}
});

// Function to generate captions for a video
export const generateVideoCaptions = withErrorHandling(async (videoId: string) => {
    try {
        // Check if video exists and is ready for caption generation
        const videoInfo = await apiFetch<BunnyVideoInfo>(
            `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
            {
                method: 'GET',
                bunnyType: 'stream',
            }
        );

        // Only generate captions if video is processed (status 3 - FINISHED or higher)
        if (videoInfo.status < BUNNY.VIDEO_STATUS.FINISHED) {
            console.log('Video not ready for caption generation yet, status:', videoInfo.status);
            return { success: false, message: 'Video not processed yet' };
        }

        // Check if captions already exist
        if (videoInfo.captions && videoInfo.captions.length > 0) {
            console.log('Captions already exist for video:', videoId);
            return { success: true, message: 'Captions already exist' };
        }

        // Add caption using Bunny Stream API
        // Note: This adds an auto-generated caption track
        await apiFetch(
            `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}/captions/en`,
            {
                method: 'POST',
                bunnyType: 'stream',
                body: {
                    srclang: 'en',
                    label: 'English',
                    captionsFile: '' // Empty for auto-generation
                }
            }
        );

        console.log('Caption generation request sent for video:', videoId);
        return { success: true, message: 'Caption generation initiated' };
    } catch (error) {
        console.error('Error generating captions:', error);
        return { success: false, message: 'Caption generation failed' };
    }
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
        const videoInfoResponse = await apiFetch<BunnyVideoInfo>(
            `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
            {
                method: 'GET',
                bunnyType: 'stream',
            }
        );

        console.log('Video info response:', videoInfoResponse);

        // Check if captions/transcript is available
        if (!videoInfoResponse.captions || videoInfoResponse.captions.length === 0) {
            console.log('No captions available for video:', videoId);
            return null; // No transcript available
        }

        // Get the first available caption (usually 'en' or first language)
        const firstCaption = videoInfoResponse.captions[0];
        const captionLanguage = firstCaption.srclang || 'en';
        
        console.log('Found caption:', captionLanguage, firstCaption);

        // Use the Bunny Stream API to fetch caption content
        // The API endpoint is: GET /library/{libraryId}/videos/{videoId}/captions/{srclang}
        try {
            const captionData = await apiFetch<string>(
                `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}/captions/${captionLanguage}`,
                {
                    method: 'GET',
                    bunnyType: 'stream',
                    expectJson: false,
                }
            );
            
            console.log('Successfully fetched caption data');
            return captionData;
        } catch {
            console.log('API fetch failed, trying direct URL access');
            
            // Fallback: Try to fetch the VTT file directly from CDN if available
            if (firstCaption.label || firstCaption.srclang) {
                // Try the pull zone URL format
                const cdnUrl = `https://vz-${videoInfoResponse.guid?.substring(0, 8) || 'default'}.b-cdn.net/${videoId}/captions/${captionLanguage}.vtt`;
                console.log('Trying CDN URL:', cdnUrl);
                
                const cdnResponse = await fetch(cdnUrl);
                
                if (cdnResponse.ok) {
                    console.log('Successfully fetched from CDN');
                    return await cdnResponse.text();
                }
            }
            
            // Last resort: try the embed URL path
            const embedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}/captions/${captionLanguage}.vtt`;
            console.log('Trying embed URL:', embedUrl);
            
            const embedResponse = await fetch(embedUrl);
            if (embedResponse.ok) {
                console.log('Successfully fetched from embed URL');
                return await embedResponse.text();
            }
            
            console.log('All fetch attempts failed');
            return null;
        }
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return null;
    }
    });