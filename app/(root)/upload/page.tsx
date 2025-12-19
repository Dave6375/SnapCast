'use client'

import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import {useState, ChangeEvent, FormEvent, useEffect} from "react";
import {useFileInput} from "@/lib/hooks/useFileInput";
import {MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE} from "@/constants";
import {getThumbnailUrl, getVideoUploadUrl, saveVideoDetails} from "@/lib/actions/video";
import {useRouter} from "next/navigation";

const uploadFileToBunny = (file: File, uploadUrl: string, accessKey: string): Promise<void> => {
    return fetch(uploadUrl, {
        method: "PUT",
        headers: {
            'AccessKey': accessKey,
            'accept': 'application/json',
        },
        body: file,
    }).then((response: Response) => {
        if(!response.ok) throw new Error('Upload failed.');
    })
}

const Page = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public',
    });

    const video = useFileInput(MAX_VIDEO_SIZE);
    const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

    useEffect(() => {
        if (video.duration) {
            setVideoDuration(video.duration);
        }
    }, [video.duration]);

    //This one handles the process where you upload your already screen recorded video
    // SO you don't have to manually upload them from files or somewhere else
    useEffect(() => {
        const checkForRecordedVideo = async () => {
            try {
                const stored = sessionStorage.getItem("recordedVideo");

                if(!stored) return;

                const { url, name, type, duration } = JSON.parse(stored);
                const blob = await fetch(url).then((res) => res.blob());
                const file = new File([blob], name, {type, lastModified: Date.now() })

                if(video.inputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    video.inputRef.current.files = dataTransfer.files;

                    const event = new Event('change', {bubbles: true}); // simulate a user doing a file input change
                    video.inputRef.current.dispatchEvent(event);

                    video.handleFileChange({
                        target: { files: dataTransfer.files }
                    } as ChangeEvent<HTMLInputElement>)
                }

                if(duration) setVideoDuration(duration);

                sessionStorage.removeItem("recordedVideo");
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error(e, 'Error loading recorded video')
            }
        }

        checkForRecordedVideo();
    }, [video])

    // ...existing code...

    const [error, setError] = useState('');

        const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent)=> {
        e.preventDefault();

        setIsSubmitting(true);

        try {
            if(!video.file || !thumbnail.file) {
                setError('Please upload video and thumbnail');
                return;
            }
            if(!formData.title || !formData.description) {
                setError('Please upload title and description');
                return;
            }

            // 0 get Upload the video to Bunny
            const {
                videoID,
                uploadUrl: videoUploadUrl,
                accessKey: videoAccessKey,
            } = await getVideoUploadUrl();

            if(!videoUploadUrl || !videoAccessKey) throw new Error('failed to get video upload credentials')

            // 1. Upload the thumbnail to Bunny
            await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

            // Upload the thumbnail to DB
            const {
                uploadUrl: thumbnailUploadUrl,
                accessKey: thumbnailAccessKey,
                cdnUrl: thumbnailCdnUrl,
            } = await getThumbnailUrl(videoID);

            if(!thumbnailUploadUrl || !thumbnailCdnUrl || !thumbnailAccessKey) throw new Error('failed to get thumbnail upload credentials')

            // Attach thumbnail
            await uploadFileToBunny(thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey);

            // Create a new DB entry for the video details (url, data)
            await saveVideoDetails({
                videoId: videoID,
                thumbnailUrl: thumbnailCdnUrl,
                ...formData,
                duration: videoDuration,
            })

            router.push(`/`)
        }catch(error) {
            console.log('Error submitting form: ', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='wrapper-md upload-page'>
            <h1>Upload a video</h1>
            {error && <div className='error-field'>{error}</div>}

            <form className='rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5' onSubmit={handleSubmit}>
                <FormField
                    id='title'
                    label="Title"
                    placeholder="Enter a clear and concise video title"
                    value={formData.title}
                    onChange={handleInputChange}
                />
                <FormField
                    id='description'
                    label="Description"
                    placeholder="Describe what this video is about"
                    value={formData.description}
                    as="textarea"
                    onChange={handleInputChange}
                />

                <FileInput
                    id='video'
                    label='Video'
                    accept="video/*"
                    file={video.file}
                    previewUrl={video.previewUrl}
                    inputRef={video.inputRef}
                    onChange={video.handleFileChange}
                    onReset={video.resetFile}
                    type='video'
                />




                <FileInput
                    id='thumbnail'
                    label='Thumbnail'
                    accept='image/*'
                    file={thumbnail.file}
                    previewUrl={thumbnail.previewUrl}
                    inputRef={thumbnail.inputRef}
                    onChange={thumbnail.handleFileChange}
                    onReset={thumbnail.resetFile}
                    type='image'
                />

                <FormField
                    id='visibility'
                    label="visibility"
                    value={formData.visibility}
                    as="select"
                    options={[
                        { value: 'public', label: 'Public' },
                        { value: 'private', label: 'Private' },
                    ]}
                    onChange={handleInputChange}
                />

                <button type='submit' disabled={isSubmitting} className='submit-button'>
                    {isSubmitting ? 'Uploading...' : 'Upload video'}
                </button>
            </form>
        </div>
    );
};

export default Page;