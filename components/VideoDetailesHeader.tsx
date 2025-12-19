'use client'
import React, {useEffect, useState} from 'react'
import Image from "next/image";
import {useRouter} from "next/navigation";
import {daysAgo} from "@/lib/utils";

const VideoDetailesHeader = ({ title, createdAt, userImg, username, videoId, ownerId, visibility, thumbnailUrl, id }: VideoDetailHeaderProps) => {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);
    const [currentVisibility, setCurrentVisibility] = useState(visibility || 'public');

    const handleCopyLink=() => {
        navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);
        setCopied(true);
    }

    const handlePrivacyChange = (newVisibility: string) => {
        setCurrentVisibility(newVisibility);
        setIsPrivacyDropdownOpen(false);
        // TODO: Add API call to update video visibility
    };

    useEffect(() => {
        const changeChecked = setTimeout(() => {
            if (copied) setCopied(false);
        }, 2000);

        return () => {
            clearTimeout(changeChecked);
        };
    }, [copied]);

    return (
        <header className='detail-header'>
            <aside className='user-info'>
                <h1>{title}</h1>
                <figure>
                    <button 
                        onClick={() => router.push(`/profile/${ownerId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        <Image src={userImg || ''} alt='User' width={28} height={28} className='rounded-full'/>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                            <span style={{ fontWeight: 500 }}>{username ?? 'Guest'}</span>
                            <span style={{ fontSize: '0.9em', color: '#666' }}>{daysAgo(createdAt)}</span>
                        </div>
                    </button>
                </figure>
            </aside>
            <aside className='cta'>
                {/* Privacy Dropdown */}
                <div className='relative'>
                    <button 
                        onClick={() => setIsPrivacyDropdownOpen(!isPrivacyDropdownOpen)}
                        className='privacy-btn flex items-center gap-2 bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors'
                    >
                        <span className={`w-2 h-2 rounded-full ${currentVisibility === 'public' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {currentVisibility === 'public' ? 'Public' : 'Private'}
                        <Image 
                            src='/assets/icons/arrow-down.svg' 
                            alt='dropdown' 
                            width={12} 
                            height={12} 
                            className={`transition-transform ${isPrivacyDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    
                    {isPrivacyDropdownOpen && (
                        <div className='absolute top-12 right-0 bg-white shadow-lg rounded-lg py-2 min-w-[120px] z-10 border border-gray-200'>
                            <button
                                onClick={() => handlePrivacyChange('public')}
                                className='w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2'
                            >
                                <span className='w-2 h-2 rounded-full bg-green-500'></span>
                                Public
                                {currentVisibility === 'public' && (
                                    <Image src='/assets/icons/check.svg' alt='selected' width={16} height={16} className='ml-auto' />
                                )}
                            </button>
                            <button
                                onClick={() => handlePrivacyChange('private')}
                                className='w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2'
                            >
                                <span className='w-2 h-2 rounded-full bg-red-500'></span>
                                Private
                                {currentVisibility === 'private' && (
                                    <Image src='/assets/icons/check.svg' alt='selected' width={16} height={16} className='ml-auto' />
                                )}
                            </button>
                        </div>
                    )}
                </div>
                
                <button onClick={handleCopyLink} className='copy-btn'>
                    <Image src={copied ? '/assets/images/checked.png' : '/assets/icons/link.svg'} alt='copy link' width={24} height={24} />
                </button>
            </aside>
        </header>
    )
}
export default VideoDetailesHeader