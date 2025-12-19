'use client'
import React from 'react'

interface TranscriptProps {
  transcript?: string;
  transcriptData?: TranscriptEntry[];
}

const Transcript = ({ transcript, transcriptData }: TranscriptProps) => {
  // Sample transcript data for demonstration - you can replace this with actual data
  const sampleTranscript: TranscriptEntry[] = [
    {
      time: '00:00',
      text: 'Hey team, quick update from today\'s sprint planning meeting.'
    },
    {
      time: '00:12', 
      text: 'We\'ve finalized the top priorities for this sprint, which mainly include the dashboard redesign, several backend performance improvements, and a better mobile app experience.'
    },
    {
      time: '00:20',
      text: 'There were a few blockers raised during the discussion, particularly related to slow API response times.'
    },
    {
      time: '00:38',
      text: 'The development team will be focusing first on resolving those issues before moving forward with any additional feature development.'
    },
    {
      time: '00:50',
      text: 'All action items and estimated timelines have been assigned'
    },
    {
      time: '01:00',
      text: 'If anything is unclear or if you run into any blockers yourselves, feel free to message me directly or drop a note in the project channel. Thanks again everyone for the great work!'
    }
  ];

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
            If your video has been processed but still doesn't have a transcript, 
            captions may need to be enabled in your Bunny.net Stream library settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default Transcript;