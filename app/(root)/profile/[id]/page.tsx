import Header from "@/components/Header";
import {dummyCards} from "@/constants";
import VideoCard from "@/components/VideoCard";
import {getAllVideos} from "@/lib/actions/video";
import {user, videos} from "@/drizzle/schema";
import {filter} from "arcjet";
import {redirect} from "next/navigation";
import EmptyState from "@/components/EmptyState";
//
// const Page = ({ searchParams }: SearchParams) => {
//     const {query, filter, page } = await searchParams;
//
//     const { videos, pagination} getAllVideos(query, filter, Number(page) || 1);

const Page = async ({ params, searchParams }: ParamsWithSearch) => {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { query, filters } = await searchParams;

    // Only get videos from getAllVideos
    const { videos } = await getAllVideos(query, filters);

    // Get user info from the first video (if available)
    const user = videos && videos.length > 0 ? videos[0].user : null;
    if (!user) redirect('/404');

    return (
        <main className='wrapper page'>
            <Header
                title={user?.name}
                userImg={user?.image ?? ''}
            />

            {videos?.length > 0 ? (
                <section className='video-grid'>
                    {videos.map((item, idx) => {
                        if (!item || !item.video) {
                            console.warn(`Skipping invalid video at index ${idx}:`, item);
                            return null;
                        }
                        return (
                            <VideoCard
                                key={item.video.id}
                                id={item.video.id}
                                videoId={item.video.videoId}
                                title={item.video.title}
                                thumbnail={item.video.thumbnailUrl}
                                userImg={item.user?.image || ''}
                                username={item.user?.name || 'Guest'}
                                createdAt={item.video.createdAt}
                                views={item.video.views}
                                visibility={item.video.visibility}
                                duration={item.video.duration}
                            />
                        );
                    })}
                </section>
            ) : (
                <EmptyState
                    icon='/assets/icons/video.svg'
                    title='No Videos Available Yet!'
                    description='Videos will show up once you upload them!'
                />
            )}
        </main>
    );
};

export default Page;