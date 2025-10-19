import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { processVideoWithWebMAvatar } from './webmAvatarProcessor.js';

// Avatar processing utilities for video generation with music synchronization
// Now supports WebM avatars instead of VRM 3D models


/**
 * Create avatar video overlay with music synchronization
 * Simplified for WebM avatars instead of complex VRM processing
 * @param {Object} options - Avatar processing options
 * @returns {Promise<string>} - Path to generated avatar overlay video
 */
export const createAvatarOverlay = async ({
  avatarData,
  avatarPosition,
  avatarSettings,
  musicPath,
  videoDuration,
  outputPath,
  onProgress
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('🎭 Starting simplified avatar overlay creation...');

      // Check avatar type
      if (avatarData.type === 'webm') {
        console.log('📹 Processing WebM avatar...');

        // Import WebM processor functions
        const { processVideoWithWebMAvatar } = await import('./webmAvatarProcessor.js');

        // Use WebM avatar processing (this handles BPM detection internally)
        // Create a dummy main video for overlay creation
        const tempMainVideo = path.join(path.dirname(outputPath), `temp-main-${Date.now()}.mp4`);

        // Create a transparent video as base
        await createTransparentBase(tempMainVideo, videoDuration);

        // Process with WebM avatar
        await processVideoWithWebMAvatar({
          mainVideoPath: tempMainVideo,
          musicPath,
          avatarData,
          avatarPosition,
          avatarSettings,
          videoDuration,
          outputPath,
          tempDir: path.dirname(outputPath),
          onProgress
        });

        // Cleanup temp file
        if (fs.existsSync(tempMainVideo)) {
          fs.unlinkSync(tempMainVideo);
        }

      } else {
        // Fallback for non-WebM avatars (existing static approach)
        console.log('🎨 Processing static avatar...');

        await createStaticAvatarOverlay({
          avatarData,
          avatarSettings,
          animParams: { animationSpeed: 1.0 },
          videoDuration,
          avatarSize: Math.round(80 * (avatarSettings.scale || 1)),
          outputPath,
          onProgress
        });
      }

      resolve(outputPath);

    } catch (error) {
      console.error('❌ Avatar overlay creation failed:', error);
      reject(error);
    }
  });
};

/**
 * Create transparent base video for overlay processing
 * @param {string} outputPath - Path for output video
 * @param {number} duration - Video duration in seconds
 * @returns {Promise<void>}
 */
const createTransparentBase = async (outputPath, duration) => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Creating transparent base video...');

    const command = ffmpeg()
      .input(`color=c=black@0:s=1080x1920:d=${duration}`)
      .inputOptions(['-f', 'lavfi'])
      .outputOptions([
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '18'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('✅ Transparent base video created');
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Transparent base creation failed:', error);
        reject(error);
      })
      .run();
  });
};



/**
 * Create static avatar overlay for non-VRM avatars - SIMPLIFIED
 */
const createStaticAvatarOverlay = async ({
  avatarData,
  avatarSettings,
  animParams,
  videoDuration,
  avatarSize,
  outputPath,
  onProgress
}) => {
  return new Promise((resolve, reject) => {
    console.log(`🖼️ Creating simplified static avatar overlay...`);

    // Create avatar overlay - using correct avatar color and thumbnail if available
    const color = avatarData.color || '#6366f1';
    console.log(`🎨 Using avatar color: ${color} for ${avatarData.name || 'avatar'}`);

    // Remove the # from color hex
    const colorHex = color.startsWith('#') ? color.substring(1) : color;

    let command;

    // Check if avatar has thumbnail image (non-SVG)
    if (avatarData.thumbnail && !avatarData.thumbnail.includes('.svg')) {
      // Use actual avatar thumbnail image
      console.log(`🖼️ Using avatar thumbnail: ${avatarData.thumbnail}`);
      const thumbnailPath = path.join(process.cwd(), 'public', avatarData.thumbnail);

      command = ffmpeg()
        .input(thumbnailPath)
        .inputOptions(['-loop', '1'])
        .videoCodec('libx264')
        .outputOptions([
          '-t', videoDuration.toString(),
          '-vf', `scale=${avatarSize}:${avatarSize}:force_original_aspect_ratio=decrease,pad=${avatarSize}:${avatarSize}:(ow-iw)/2:(oh-ih)/2:color=black@0`,
          '-pix_fmt', 'yuva420p',
          '-crf', '18'
        ])
        .output(outputPath);
    } else {
      // Create enhanced colored avatar with avatar icon
      console.log(`🎨 Creating enhanced colored avatar for ${avatarData.name}`);
      command = ffmpeg()
        .input(`color=c=${colorHex}:s=${avatarSize}x${avatarSize}:d=${videoDuration}`)
        .inputOptions(['-f', 'lavfi'])
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt', 'yuva420p',
          '-vf', `drawtext=text='👤':fontsize=${Math.round(avatarSize*0.6)}:fontcolor=white@0.8:x=(w-text_w)/2:y=(h-text_h)/2`,
          '-crf', '18'
        ])
        .output(outputPath);
    }

    command
      .on('start', (commandLine) => {
        console.log('🚀 Simple avatar overlay command:', commandLine);
      })
      .on('progress', (progress) => {
        if (onProgress) {
          onProgress({ percent: Math.round(progress.percent || 0) });
        }
      })
      .on('end', () => {
        console.log('✅ Simple avatar overlay created successfully');
        resolve(outputPath);
      })
      .on('error', (error) => {
        console.error('❌ Simple avatar overlay error:', error);
        reject(error);
      })
      .run();
  });
};

/**
 * Apply avatar overlay to main video - SIMPLIFIED
 * @param {Object} options - Overlay options
 * @returns {Promise<string>} - Path to final video with avatar
 */
export const applyAvatarToVideo = async ({
  mainVideoPath,
  avatarOverlayPath,
  avatarPosition,
  avatarSettings,
  outputPath,
  onProgress,
  photoMetadata = null // Optional: original photo dimensions for letterboxing calculation
}) => {
  return new Promise((resolve, reject) => {
    console.log('🎬 Applying avatar overlay to main video...');

    const avatarSize = Math.round(80 * avatarSettings.scale);

    let x, y;

    if (photoMetadata && photoMetadata.originalWidth && photoMetadata.originalHeight) {
      // Calculate letterboxing offsets based on original photo dimensions
      const originalAspect = photoMetadata.originalWidth / photoMetadata.originalHeight;
      const targetAspect = 1080 / 1920; // 0.5625

      let scaledWidth, scaledHeight, padX, padY;

      if (originalAspect > targetAspect) {
        // Photo is wider than target - will have padding on top/bottom
        scaledWidth = 1080;
        scaledHeight = Math.round(1080 / originalAspect);
        padX = 0;
        padY = (1920 - scaledHeight) / 2;
      } else {
        // Photo is taller than target - will have padding on left/right
        scaledWidth = Math.round(1920 * originalAspect);
        scaledHeight = 1920;
        padX = (1080 - scaledWidth) / 2;
        padY = 0;
      }

      // Calculate position relative to actual photo content, then add padding offset
      x = Math.round((avatarPosition.x / 100) * scaledWidth) - (avatarSize / 2) + padX;
      y = Math.round((avatarPosition.y / 100) * scaledHeight) - (avatarSize / 2) + padY;

      console.log(`📐 Letterboxing calculation:`, {
        original: { width: photoMetadata.originalWidth, height: photoMetadata.originalHeight, aspect: originalAspect.toFixed(3) },
        scaled: { width: scaledWidth, height: scaledHeight },
        padding: { x: padX, y: padY },
        position: { x, y }
      });
    } else {
      // Fallback to old calculation if no photo metadata available
      x = Math.round((avatarPosition.x / 100) * 1080) - (avatarSize / 2);
      y = Math.round((avatarPosition.y / 100) * 1920) - (avatarSize / 2);
      console.log(`📍 Using fallback positioning (no photo metadata)`);
    }

    console.log(`📍 Avatar overlay position: ${x}x${y}, size: ${avatarSize}px`);

    const command = ffmpeg()
      .input(mainVideoPath)
      .input(avatarOverlayPath)
      .outputOptions([
        '-filter_complex', `[1:v]format=yuva420p,scale=${avatarSize}:${avatarSize}[ovrl];[0:v][ovrl]overlay=${x}:${y}[out]`,
        '-map', '[out]',
        '-map', '0:a?',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-pix_fmt', 'yuv420p',
        '-crf', '18',
        '-preset', 'fast',
        '-movflags', '+faststart'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('🚀 Simplified avatar overlay command:', commandLine);
      })
      .on('progress', (progress) => {
        if (onProgress) {
          onProgress({ percent: Math.round(progress.percent || 0) });
        }
      })
      .on('end', () => {
        console.log('✅ Avatar applied to video successfully');
        resolve(outputPath);
      })
      .on('error', (error) => {
        console.error('❌ Avatar application error:', error);
        reject(error);
      })
      .run();
  });
};

/**
 * Main function to process video with avatar
 * Simplified for WebM avatar support
 * @param {Object} options - Processing options
 * @returns {Promise<string>} - Path to final video
 */
export const processVideoWithAvatar = async ({
  mainVideoPath,
  musicPath,
  avatarData,
  avatarPosition,
  avatarSettings,
  videoDuration,
  outputPath,
  tempDir,
  slideTimeRange = null, // Optional: { start: number, end: number } for per-slide timing
  photoMetadata = null, // Optional: original photo dimensions for avatar positioning
  slideNumber = null, // Optional: slide number for logging
  onProgress
}) => {
  try {
    console.log('🎭 Starting video processing with avatar...');

    // Check avatar type and use appropriate processing
    if (avatarData.type === 'webm') {
      console.log('📹 Using WebM avatar processing...');

      // Use the dedicated WebM avatar processor
      const { processVideoWithWebMAvatar } = await import('./webmAvatarProcessor.js');

      const result = await processVideoWithWebMAvatar({
        mainVideoPath,
        musicPath,
        avatarData,
        avatarPosition,
        avatarSettings,
        videoDuration,
        outputPath,
        tempDir,
        slideTimeRange,
        photoMetadata,
        slideNumber,
        onProgress
      });

      console.log('✅ WebM avatar processing completed');
      return result;

    } else {
      console.log('🎨 Using static avatar processing...');

      // Fallback for static avatars (existing approach)
      const avatarOverlayPath = path.join(tempDir, `avatar-overlay-${Date.now()}.mp4`);
      const tempOutputPath = path.join(tempDir, `temp-with-avatar-${Date.now()}.mp4`);

      // Progress tracking
      const updateProgress = (stage, stageProgress) => {
        if (onProgress) {
          let totalProgress = 0;
          switch (stage) {
            case 'overlay':
              totalProgress = Math.round(stageProgress * 0.4);
              break;
            case 'apply':
              totalProgress = 40 + Math.round(stageProgress * 0.6);
              break;
          }
          onProgress(Math.min(100, totalProgress));
        }
      };

      // Create static avatar overlay
      await createAvatarOverlay({
        avatarData,
        avatarPosition,
        avatarSettings,
        musicPath,
        videoDuration,
        outputPath: avatarOverlayPath,
        onProgress: (progress) => updateProgress('overlay', progress)
      });

      // Apply avatar to main video
      await applyAvatarToVideo({
        mainVideoPath,
        avatarOverlayPath,
        avatarPosition,
        avatarSettings,
        outputPath: tempOutputPath,
        onProgress: (progress) => updateProgress('apply', progress)
      });

      // Move temp file to final output (use copy + delete for cross-filesystem compatibility)
      if (fs.existsSync(tempOutputPath)) {
        fs.copyFileSync(tempOutputPath, outputPath);
        fs.unlinkSync(tempOutputPath);
      }

      // Cleanup temporary files
      try {
        if (fs.existsSync(avatarOverlayPath)) {
          fs.unlinkSync(avatarOverlayPath);
        }
      } catch (cleanupError) {
        console.warn('Avatar overlay cleanup failed:', cleanupError);
      }

      console.log('✅ Static avatar processing completed');
      return outputPath;
    }

  } catch (error) {
    console.error('❌ Video processing with avatar failed:', error);
    throw error;
  }
};

/**
 * Utility function to convert hex color to RGB
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 99, g: 102, b: 241 }; // Default indigo color
};

/**
 * Check if avatar processing is supported
 * @returns {boolean} - True if avatar processing is available
 */
export const isAvatarProcessingSupported = () => {
  try {
    // Check if FFmpeg is available
    return !!(ffmpegStatic || (ffmpegPath && ffmpegPath.path));
  } catch (error) {
    console.warn('Avatar processing support check failed:', error);
    return false;
  }
};

export default {
  createAvatarOverlay,
  applyAvatarToVideo,
  processVideoWithAvatar,
  isAvatarProcessingSupported
};