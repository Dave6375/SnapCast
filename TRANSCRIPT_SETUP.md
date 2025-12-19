# Bunny.net Transcript Setup Guide

## Overview
This guide explains how to enable automatic transcripts for your videos in SnapCast using Bunny.net Stream.

## Prerequisites
- Active Bunny.net Stream account
- A Stream library configured in your account
- Videos uploaded to your Stream library

## Enabling Automatic Captions/Transcripts

### Option 1: Enable at Library Level (Recommended)

1. **Log into Bunny.net Dashboard**
   - Go to https://dash.bunny.net/

2. **Navigate to Stream Libraries**
   - Click on "Stream" in the left sidebar
   - Select your library (the one with ID: `BUNNY_LIBRARY_ID` from your .env file)

3. **Enable Automatic Captions**
   - Click on "Settings" for your library
   - Look for "Captions" or "AI Captions" section
   - Enable "Automatic Caption Generation"
   - Select language: English (or your preferred language)
   - Save settings

4. **Configure Caption Settings (Optional)**
   - Set caption format: WebVTT (recommended)
   - Enable "Auto-generate for new videos"

### Option 2: Enable Per Video via API

The application now automatically attempts to generate captions when you upload a video. The `generateVideoCaptions` function is called after saving video details.

If captions don't appear immediately:
- Wait for the video to finish encoding (status 4 or higher)
- Captions may take additional 5-10 minutes to generate after encoding completes
- Check the browser console for any error messages

## How Transcripts Work in SnapCast

1. **Video Upload**: When you upload a video, it's sent to Bunny.net Stream
2. **Video Processing**: Bunny.net encodes the video
3. **Caption Generation**: After encoding, captions are automatically generated (if enabled)
4. **Transcript Fetching**: When you view a video, SnapCast fetches the captions via Bunny API
5. **Display**: The transcript is parsed from VTT format and displayed in the Transcript tab

## Troubleshooting

### Transcripts Not Showing Up

1. **Check Video Status**
   - Ensure video has finished processing (not encoding)
   - Status should be 4 (finished) or 5 (resolution finished)

2. **Verify Caption Settings**
   - Log into Bunny.net dashboard
   - Check if captions are enabled for your library
   - Verify the video has captions by clicking on the video in the dashboard

3. **Check API Response**
   - Open browser developer console (F12)
   - Look for console logs when viewing a video
   - Check for "Video info response" logs that show caption data

4. **Manual Caption Upload**
   If automatic generation doesn't work, you can manually upload VTT caption files:
   - Go to your video in Bunny.net dashboard
   - Click "Captions" tab
   - Upload a `.vtt` file with your transcript

### Common Issues

**Issue**: "Transcript is not available for this video"
- **Solution**: Wait 5-10 minutes after video finishes encoding for captions to generate

**Issue**: Console shows "No captions available for video"
- **Solution**: Enable automatic captions in library settings or manually upload captions

**Issue**: API returns 404 when fetching captions
- **Solution**: Verify the video GUID is correct and captions exist in Bunny.net dashboard

## API Endpoints Used

The application uses the following Bunny.net Stream API endpoints:

1. **Get Video Info**: `GET /library/{libraryId}/videos/{videoId}`
   - Returns video metadata including available captions

2. **Add/Generate Captions**: `POST /library/{libraryId}/videos/{videoId}/captions/{language}`
   - Triggers caption generation for a video

3. **Get Caption Content**: `GET /library/{libraryId}/videos/{videoId}/captions/{language}`
   - Fetches the VTT caption file content

## VTT Format Example

WebVTT (Web Video Text Tracks) is the standard format for captions:

```
WEBVTT

00:00:00.000 --> 00:00:05.000
Hey team, quick update from today's sprint planning meeting.

00:00:05.000 --> 00:00:12.000
We've finalized the top priorities for this sprint.

00:00:12.000 --> 00:00:20.000
Including dashboard redesign and backend improvements.
```

SnapCast automatically parses this format and displays it in a user-friendly way.

## Support

If you continue to have issues with transcripts:

1. Check Bunny.net status page: https://status.bunny.net/
2. Review Bunny.net Stream API documentation: https://docs.bunny.net/reference/video_getvideo
3. Check SnapCast repository issues: https://github.com/Dave6375/SnapCast/issues

## Environment Variables

Ensure these are set in your `.env` file:

```env
BUNNY_LIBRARY_ID=your_library_id
BUNNY_STREAM_ACCESS_KEY=your_stream_api_key
```

These are required for the transcript fetching to work properly.
