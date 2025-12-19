import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import {dummyCards} from "@/constants";
import {getAllVideos} from "@/lib/actions/video";
import EmptyState from "@/components/EmptyState";

const Page = async ({ searchParams }: SearchParams) => {
    const { query, filter, page } = await searchParams;
    const result = await getAllVideos(query, filter, Number(page) || 1);
    console.log('getAllVideos result:', result);
    const { videos, pagination } = result;

    return (
        <main className='wrapper page'>
            <Header title='All Videos' subHeader='Public Library' />
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
                    title='No Videos Found Yet!'
                    description='Try adjusting your search' 
                />
            )}
        </main>
    )
}
export default Page;