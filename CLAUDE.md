# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TKVGen is a web-based video editing tool that allows users to upload multiple photos/videos, add their own music, and create slideshow videos. The application uses React frontend with a Node.js/Express backend and leverages FFmpeg for video processing. The system is designed for mobile-first experience with QR code sharing.

## Development Commands

- `npm run dev` - Start both server and client in development mode (uses concurrently)
- `npm run server` - Start only the Express server on port 5003 (uses nodemon)
- `npm run client` - Start only the Vite development server on port 3002
- `npm run build` - Build the React application for production
- `npm start` - Start the production server
- `npm test` - Run tests using Vitest

## Architecture

### Frontend (React + Vite)
- **App.jsx**: Main router with Home and Generator routes wrapped in context providers
- **Context System**:
  - `AppContext.jsx`: Global state for photos, music, videos, and upload mode
  - `LanguageContext.jsx`: Internationalization support
- **Key Components**:
  - `Home`: Landing page with animated elements
  - `Generator`: Main 3-step wizard (Upload → Music → Export)
  - `UploadPhotos`: Drag & drop upload with duplicate detection
  - `MusicSelector`: Local music library + upload functionality
  - `VideoExport`: Video generation with progress tracking and QR sharing

### Backend (Node.js + Express)
- **server.js**: Comprehensive server with mobile optimization and QR code sharing
- **Core API Endpoints**:
  - `POST /api/upload-photos` - Multi-file photo/video upload (max 10 files, 10MB each)
  - `POST /api/upload-music` - Music file upload with validation
  - `POST /api/generate-video` - Asynchronous video generation with job tracking
  - `GET /api/video-progress/:jobId` - Real-time progress monitoring
  - `GET /api/qr-code/:tempUrlId` - QR code generation for mobile sharing
  - `GET /api/local-music` - Pre-loaded music library with metadata
  - `POST /api/cleanup` - File cleanup management

### Video Processing Engine
- **src/lib/videoProcessor.js**: Advanced FFmpeg wrapper with multiple creation strategies
- **Key Features**:
  - Multiple fallback methods for video creation
  - Mobile-optimized 1080x1920 portrait format with letterboxing
  - Two-step process for multiple images (individual clips → concatenation)
  - Direct video creation for single images
  - Video file support with audio replacement
  - Smart duration calculation and progress tracking

## Critical Architecture Details

### Mobile-First Design
- **Resolution**: 1080x1920 (portrait) with black letterboxing to preserve image aspect ratios
- **Mobile Optimization**: Comprehensive headers and bypass mechanisms for mobile browser compatibility
- **QR Code Sharing**: Temporary URLs with 5-minute expiration for mobile downloads
- **Progressive Enhancement**: Multi-device download pages with device-specific optimizations

### Enhanced File Management System
- **Temporary Video Storage**: `/public/temp-videos/` with automatic expiration
- **Upload Storage**: `/public/uploads/` for user-uploaded content
- **Local Music Library**: `/public/local-music/` with pre-loaded tracks and hotness tracking
- **Enhanced Session-Based Cleanup**: 
  - Session tracking with heartbeat mechanism (2-minute intervals)
  - Abandoned session cleanup (5-minute timeout)
  - Comprehensive file coverage (uploads, videos, temp files, processing clips)
  - Multi-tier cleanup strategy (session-based + age-based fallback)
  - Cleanup intervals: Every 2 minutes for abandoned sessions, 30-minute fallback for age-based cleanup

### Video Generation Workflow
1. **Job Creation**: Unique job ID with progress tracking
2. **Duration Validation**: Videos limited to 3 minutes maximum (180 seconds)
3. **File Validation**: Existence checks for all input files
4. **Music-Video Duration Logic**:
   - **Short music + Long video**: Loop music until video ends (`-stream_loop -1` + `-shortest`)
   - **Long music + Long video**: Cut music when video ends (`-t videoDuration`)
   - **Long music + Short video**: Cut music when video ends (`-t videoDuration`)  
   - **Equal duration**: Direct audio replacement (no looping/cutting needed)
5. **Processing Strategy Selection**:
   - Single image → Direct video creation with letterboxing
   - Single video → Audio replacement using actual video duration (ignores frontend duration calculation)
   - Multiple files → Two-step slideshow creation with music looping/cutting
6. **Progress Reporting**: Real-time percent completion via polling
7. **Temporary URL Generation**: Secure, expiring download links

### Context Management
- **Upload Mode**: Supports both 'photos' and 'videos' with unified handling
- **State Persistence**: Maintains user selections across navigation
- **Cleanup Integration**: Automatic file cleanup on state reset

## Environment Variables

- `PORT`: Server port (default: 5003)
- `NODE_ENV`: Environment setting
- `BASE_URL`: Base URL for QR code generation (production domain)

## Vite Configuration

- **Dev Server**: Port 3002 with mobile compatibility headers
- **Proxy Setup**: `/api` and `/public` routes proxied to backend (port 5003)
- **Build Output**: `dist/` directory with sourcemaps enabled

## FFmpeg Integration

- **Binary Sources**: ffmpeg-static (primary), @ffmpeg-installer/ffmpeg (fallback), system FFmpeg
- **Video Quality**: High-quality encoding (CRF 18, High profile, Level 4.0)
- **Audio Quality**: 192k AAC for mobile compatibility
- **Optimization**: `+faststart` movflag for web streaming

## Development Patterns

### Error Handling
- **Video Duration Errors**: Non-intrusive fade-out text messages (3-second auto-hide)
- **FFmpeg Errors**: Comprehensive error parsing and user-friendly messages
- **File Validation**: Pre-processing validation with detailed feedback
- **Graceful Fallbacks**: Missing dependencies handled gracefully
- **UI Pattern**: Replace alert() dialogs with animated error messages using framer-motion

### Progress Tracking
- Job-based asynchronous processing
- Real-time progress updates via polling
- Multi-stage progress reporting (clip creation → concatenation)

### Mobile Compatibility
- Device detection and browser-specific handling
- Mobile browser compatibility mechanisms
- Responsive design with touch-friendly interfaces

### Avatar Positioning System (CRITICAL - DO NOT MODIFY WITHOUT UNDERSTANDING)

**Problem Solved**: Avatar positions were shifting left/up after video generation due to coordinate system mismatches and sub-pixel rendering issues.

**Root Causes Identified**:
1. **Frame dimension mismatch**: Preview container (336×608px from 21rem×38rem) didn't match AvatarPreview frame (360×640px)
2. **Non-integer scale factors**: 336→1080 = 3.214× and 608→1920 = 3.157× caused cumulative rounding errors
3. **Sub-pixel positioning**: Framer Motion's drag system allowed fractional pixel positions (e.g., 123.4px)
4. **Decimal frame heights**: Using 682.67px caused browser sub-pixel rendering inconsistencies
5. **Rounding order**: Math.round(centerX - avatarSize/2) vs Math.round(centerX) - avatarSize/2 produced different results

**Final Solution Architecture**:

1. **Integer Frame Dimensions**:
   - Preview container: **360×640px** (changed from 21rem×38rem)
   - AvatarPreview frame: **360×640px**
   - Video output: **1080×1920px**
   - Scale factor: **exactly 3.0** (clean integer scaling)

2. **Shared Letterbox Utility** (`src/lib/letterboxUtils.js`):
   - Single source of truth for FFmpeg letterbox calculations
   - Used by PreviewFrame, AvatarPreview (if needed), and backend
   - Exact algorithm: `scale=W:H:force_original_aspect_ratio=decrease,pad=W:H:(ow-iw)/2:(oh-ih)/2:black`

3. **Simplified Coordinate System**:
   - **Frame-relative percentages only** (not photo-relative)
   - Preview saves: `(pixelX / frameWidth) × 100`
   - Backend receives: `(percentage / 100) × frameWidth`
   - No intermediate coordinate transformations

4. **Pixel-Perfect Positioning**:
   - **Round to integer pixels** before converting to percentage in preview
   - **Round center position first** in backend: `Math.round((percentage/100) × 1080)`
   - Then subtract half avatar size: `roundedCenter - Math.round(avatarSize/2)`

5. **Code Structure**:
   ```
   Preview (AvatarPreview.jsx):
   - User drops at 123.7px → rounds to 124px
   - Percentage: (124 / 360) × 100 = 34.444444%
   - Saves to context

   Backend (webmAvatarProcessor.js):
   - Receives: 34.444444%
   - Center: Math.round(34.444444% × 1080) = Math.round(372) = 372px
   - Top-left: 372 - Math.round(320/2) = 372 - 160 = 212px
   - Verification: 124 × 3.0 = 372px ✅ Perfect!
   ```

**Key Files Modified**:
- `src/lib/letterboxUtils.js` - NEW: Shared letterbox calculation
- `src/components/AvatarPreview.jsx` - Simplified to 337 lines (from 515), frame-relative coordinates
- `src/lib/webmAvatarProcessor.js` - Simplified position calculation, removed photo-relative logic
- `src/components/PreviewFrame.jsx` - Updated to 360×640px containers, uses shared utility

**CRITICAL RULES**:
- ✅ **NEVER** change preview frame dimensions from 360×640px
- ✅ **ALWAYS** maintain 3.0 scale factor to video (1080×1920)
- ✅ **ALWAYS** round pixel positions to integers before percentage conversion
- ✅ **NEVER** use photo-relative coordinates (use frame-relative only)
- ✅ **ALWAYS** use shared letterbox utility from `letterboxUtils.js`
- ✅ **NEVER** introduce fractional frame dimensions (e.g., 682.67px)

**Testing Avatar Positioning**:
1. Upload photos with different aspect ratios (portrait 1280×2276, square 554×554)
2. Position avatar on each slide
3. Generate video
4. Verify avatar appears in EXACT same position in generated video
5. Check logs: Preview pixel × 3.0 should equal backend pixel

## File Structure Notes

- **ES Modules**: Both frontend and backend use `"type": "module"`
- **Static Serving**: Express serves `/public` with mobile optimization headers
- **Path Resolution**: Comprehensive path normalization for cross-platform compatibility
- **Temporary File Management**: Structured cleanup with expiration tracking

## Production Deployment

For production deployment with QR code functionality:
1. Set `BASE_URL` environment variable to your production domain (e.g., `https://your-domain.com`)
2. Deploy using Docker with the provided production configuration
3. QR codes will automatically use your production domain for mobile downloads
4. Mobile users can scan QR codes to download videos directly from your server

## Node.js Requirements

- **Node.js**: >=18.0.0
- **npm**: >=9.0.0
- ES Modules support required throughout the application