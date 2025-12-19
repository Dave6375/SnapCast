declare interface SearchResult {
    id: string;
    title: string;
    thumbnail: string;
    userImg: string;
    username: string;
    createdAt: Date;
    views: number;
    visibility: string;
    duration: number | null;
}
import {ImageProps} from "next/image";

export const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
export const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;

export const BUNNY = {
    STREAM_BASE_URL: "https://video.bunnycdn.com/library",
    STORAGE_BASE_URL: "https://storage.bunnycdn.com/snapcast-",
    CDN_URL: "https://snapcast-pull.b-cdn.net",
    EMBED_URL: "https://iframe.mediadelivery.net/embed",
    TRANSCRIPT_URL: "https://vz-f83a8252-f39.b-cdn.net",
};

export const emojis = ["😂", "😍", "👍"];

export const filterOptions = [
    "Most Viewed",
    "Most Recent",
    "Oldest First",
    "Least Viewed",
];

export const ICONS = {
    record: "/assets/icons/record.svg",
    close: "/assets/icons/close.svg",
    upload: "/assets/icons/upload.svg",
};

export const initialVideoState = {
    isLoaded: false,
    hasIncrementedView: false,
    isProcessing: true,
    processingProgress: 0,
};

export const infos = ["transcript", "metadata"];

export const DEFAULT_VIDEO_CONFIG = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
};

export const DEFAULT_RECORDING_CONFIG = {
    mimeType: "video/webm;codecs=vp9,opus",
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
};

type Reaction = { userId: string; emoji: string };

declare interface ImageWithFallbackProps extends Omit<ImageProps,  'src'> {
    fallback?: string;
    alt: string;
    src: string | null;
}

declare interface VideoDetails {
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    tags: string | string[];
    visibility: string;
}

export interface VideoCardProps {
    id: string;
    title: string;
    thumbnail: string;
    userImg: string;
    username: string;
    createdAt: Date;
    views: number;
    visibility: string;
    duration: number | null;
}

export const dummyCards = [
    {
        id: '1',
        title: "SnapChat Message",
        thumbnail: '/assets/samples/thumbnail (1).png',
        createdAt: new Date('2025-05-01'),
        userImg: '/assets/images/jason.png',
        username: "Jason",
        views: 10,
        visibility: 'public',
        duration: 156
    },
    {
        id: '2',
        title: "Morning Vlog",
        thumbnail: '/assets/samples/thumbnail (2).png',
        createdAt: new Date('2025-04-15'),
        userImg: '/assets/images/emily.png',
        username: "Emily",
        views: 25,
        visibility: 'private',
        duration: 210
    },
    {
        id: '3',
        title: "Tech Review",
        thumbnail: '/assets/samples/thumbnail (3).png',
        createdAt: new Date('2025-03-10'),
        userImg: '/assets/images/michael.png',
        username: "Michael",
        views: 40,
        visibility: 'public',
        duration: 320
    },
    {
        id: '4',
        title: "Cooking Tips",
        thumbnail: '/assets/samples/thumbnail (4).png',
        createdAt: new Date('2025-02-20'),
        userImg: '/assets/images/lisa.png',
        username: "Lisa",
        views: 18,
        visibility: 'private',
        duration: 185
    },
    {
        id: '5',
        title: "Travel Diary",
        thumbnail: '/assets/samples/thumbnail (5).png',
        createdAt: new Date('2025-01-05'),
        userImg: '/assets/images/sarah.png',
        username: "Sarah",
        views: 55,
        visibility: 'public',
        duration: 400
    },
    {
        id: '6',
        title: "Gaming Highlights",
        thumbnail: '/assets/samples/thumbnail (6).png',
        createdAt: new Date('2025-06-12'),
        userImg: '/assets/images/david.png',
        username: "David",
        views: 33,
        visibility: 'public',
        duration: 275
    },
    {
        id: '7',
        title: "Fitness Routine",
        thumbnail: '/assets/samples/thumbnail (7).png',
        createdAt: new Date('2025-07-08'),
        userImg: '/assets/images/jessica.png',
        username: "Jessica",
        views: 22,
        visibility: 'private',
        duration: 195
    },
    {
        id: '8',
        title: "Art Showcase",
        thumbnail: '/assets/samples/thumbnail (8).png',
        createdAt: new Date('2025-08-01'),
        userImg: '/assets/images/alex.png',
        username: "Alex",
        views: 60,
        visibility: 'public',
        duration: 360
    }
];