'use client'
import React from 'react'

interface TranscriptProps {
  transcript?: string;
  transcriptData?: TranscriptEntry[];
}

const Transcript = ({ transcriptData }: TranscriptProps) => {
  // Use actual transcript data if available
  const hasTranscriptData = transcriptData && transcriptData.length > 0;
  const displayTranscript = hasTranscriptData ? transcriptData : null;

  const formatTimestamp = (time: string) => {
    return `[${time}]`;
  };

  const handleTimestampClick = (time: string) => {
    // TODO: Implement video seeking functionality
    console.log(`Seeking to timestamp: ${time}`);
  };

  return (
    <div className='transcript-container'>
      {displayTranscript ? (
        <div className='transcript-content'>
          {displayTranscript.map((item, index) => (
            <div key={index} className='transcript-item'>
              <button 
                className='timestamp-button'
                onClick={() => handleTimestampClick(item.time)}
                title={`Jump to ${item.time}`}
              >
                <span className='timestamp'>{formatTimestamp(item.time)}</span>
              </button>
              <span className='transcript-text'>{item.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className='transcript-placeholder'>
          <p className='text-gray-500 mb-2'>Transcript is not available for this video.</p>
          <p className='text-sm text-gray-400'>
            Transcripts are automatically generated when you upload a video. 
            This process may take a few minutes after the video finishes processing.
          </p>
          <p className='text-sm text-gray-400 mt-2'>
            If your video has been processed but still doesn&apos;t have a transcript, 
            captions may need to be enabled in your Bunny.net Stream library settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default Transcript;