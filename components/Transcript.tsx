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

  // Use actual transcript data if available, otherwise fall back to sample data
  const displayTranscript = transcriptData && transcriptData.length > 0 ? transcriptData : sampleTranscript;

  const formatTimestamp = (time: string) => {
    return `[${time}]`;
  };

  const handleTimestampClick = (time: string) => {
    // TODO: Implement video seeking functionality
    console.log(`Seeking to timestamp: ${time}`);
  };

  return (
    <div className='transcript-container'>
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
      
      {(!transcriptData || transcriptData.length === 0) && !transcript && (
        <div className='transcript-placeholder'>
          <p className='text-gray-500'>Transcript will be available once the video is processed.</p>
        </div>
      )}
    </div>
  );
};

export default Transcript;