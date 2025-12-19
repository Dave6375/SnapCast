'use client'
import React, { useState } from 'react'
import Transcript from './Transcript'

interface VideoTabsProps {
  videoId: string;
  title: string;
  createdAt: string;
  username: string;
  transcript?: string;
  transcriptData?: TranscriptEntry[];
}

const VideoTabs = ({ videoId, title, createdAt, username, transcript, transcriptData }: VideoTabsProps) => {
  const [activeTab, setActiveTab] = useState('transcript');

  const tabs = [
    { id: 'transcript', label: 'Transcript', active: true },
    { id: 'metadata', label: 'Meta data', active: false },
    { id: 'viewers', label: 'Viewers', active: false },
    { id: 'chapters', label: 'Chapters', active: false },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'transcript':
        return <Transcript transcript={transcript} transcriptData={transcriptData} />;
      case 'metadata':
        return (
          <div className='metadata-content'>
            <div className='metadata-item'>
              <span className='label'>Title:</span>
              <span className='value'>{title}</span>
            </div>
            <div className='metadata-item'>
              <span className='label'>Created by:</span>
              <span className='value'>{username}</span>
            </div>
            <div className='metadata-item'>
              <span className='label'>Created at:</span>
              <span className='value'>{createdAt}</span>
            </div>
            <div className='metadata-item'>
              <span className='label'>Video ID:</span>
              <span className='value'>{videoId}</span>
            </div>
          </div>
        );
      case 'viewers':
        return (
          <div className='viewers-content'>
            <p className='text-gray-500'>Viewer analytics will be available soon.</p>
          </div>
        );
      case 'chapters':
        return (
          <div className='chapters-content'>
            <p className='text-gray-500'>Video chapters will be automatically generated.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='video-tabs'>
      <nav className='tab-navigation'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className='tab-content'>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default VideoTabs;