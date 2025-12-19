import VideoPlayer from '@/components/VideoPlayer';
import {getVideoById, getVideoTranscript} from "@/lib/actions/video";
import {redirect} from "next/navigation";
import VideoDetailesHeader from "@/components/VideoDetailesHeader";
import VideoTabs from "@/components/VideoTabs";
import {parseTranscript} from "@/lib/utils";

const Page = async ({ params }: Params) => {
    const { videoId } = await params;

    const videoData = await getVideoById(videoId);
    if (!videoData || !videoData.video) {
        redirect('/404');
    }
    
    const { user, video } = videoData;
    
    // Fetch transcript from Bunny
    const transcriptData = await getVideoTranscript(video.videoId);
    const parsedTranscript = transcriptData ? parseTranscript(transcriptData) : null;
    return (
        <main className='wrapper page'>
            <VideoDetailesHeader { ...video } userImg={user?.image} username={user?.name} ownerId={video.userId} />
            <section className='video-details'>
                <div className='content'>
                    <VideoPlayer videoId={video.videoId}/>
                </div>
                <div className='sidebar'>
                    <VideoTabs 
                        videoId={video.videoId}
                        title={video.title}
                        createdAt={video.createdAt.toISOString()}
                        username={user?.name || 'Unknown'}
                        transcriptData={parsedTranscript || undefined}
                    />
                </div>
            </section>
        </main>
    );
}
export default Page;