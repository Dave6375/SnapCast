'use client'
import Link from "next/link";
import Image from "next/image";
import { VideoCardProps } from "@/constants";

const VideoCard = ({
    id,
    videoId,
    title,
    thumbnail,
    userImg,
    username,
    createdAt,
    views,
    visibility,
    duration
}: VideoCardProps & { videoId: string }) => {
    const safeThumbnail = thumbnail && typeof thumbnail === 'string' && thumbnail.trim() !== ''
  ? thumbnail
  : '/assets/images/default-thumbnail.png';

    return (
        <Link href={`/video/${videoId}`} className='video-card'>
            <Image
                src={safeThumbnail}
                alt='thumbnail'
                width={290}
                height={160}
                className='thumbnail'
                priority
            />
            <article>
                <div>
                    <figure>
                        <Image src={userImg || ''} alt='avatar' width={34} height={34} className='rounded-full aspect-square'/>
                        <figcaption>
                            <h3>{username}</h3>
                            <p>{visibility}</p>
                        </figcaption>

                        <aside>
                            <Image src='/assets/icons/eye.svg' alt='views' width={16} height={16} className='rounded-full aspect-square'/>
                            <span>{views}</span>
                        </aside>
                        <h2>{title} - {' '} {createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}</h2>
                    </figure>
                </div>
            </article>
            <button onClick={() => {}} className='copy-btn'>
                <Image src='/assets/icons/link.svg' alt='copy' width={18} height={18} />
            </button>
            {duration && (
                <div className='duration'>
                    {Math.ceil(duration / 60)}min
                </div>
            )}

        </Link>
    )
}
export default VideoCard;