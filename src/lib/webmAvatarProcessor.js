import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

/**
 * WebM Avatar Processor for TKVGen
 *
 * Processes WebM avatar videos with beat synchronization and overlay functionality.
 * This provides a simpler, more reliable avatar system using WebM video files
 * approach using pre-rendered WebM animations.
 */

// Set FFmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * Detect BPM from audio file using FFmpeg
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<number>} - Detected BPM or default 120
 */
export const detectAudioBPM = async (audioPath) => {
  return new Promise((resolve) => {
    const DEFAULT_BPM = 120;

    try {
      // Use FFprobe to analyze audio metadata
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          console.warn('BPM detection failed, using default:', DEFAULT_BPM);
          resolve(DEFAULT_BPM);
          return;
        }

        // Check for BPM in metadata tags
        const format = metadata.format;
        const tags = format.tags || {};

        const bpmValue = tags.BPM || tags.bpm || tags.TBPM || tags.tbpm;

        if (bpmValue && !isNaN(parseFloat(bpmValue))) {
          const detectedBPM = Math.round(parseFloat(bpmValue));
          resolve(detectedBPM);
        } else {
          resolve(DEFAULT_BPM);
        }
      });
    } catch (error) {
      console.warn('BPM detection error:', error);
      resolve(DEFAULT_BPM);
    }
  });
};

/**
 * Calculate tempo adjustment factor for WebM playback
 * @param {number} musicBPM - Detected music BPM
 * @param {number} baselineBPM - WebM baseline BPM (from metadata)
 * @returns {number} - Speed multiplier for tempo matching
 */
export const calculateTempoAdjustment = (musicBPM, baselineBPM = 120) => {
  const speedFactor = musicBPM / baselineBPM;

  // Clamp speed factor to reasonable bounds (0.5x to 2.0x)
  const clampedFactor = Math.max(0.5, Math.min(2.0, speedFactor));


  return clampedFactor;
};



/**
 * Detect WebM codec (VP8 or VP9) using ffprobe
 * @param {string} webmPath - Path to WebM file
 * @returns {Promise<string>} - Codec name ('vp8' or 'vp9')
 */
const detectWebMCodec = async (webmPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(webmPath, (err, metadata) => {
      if (err) {
        console.error('❌ FFprobe error:', err);
        reject(err);
        return;
      }

      try {
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found in WebM file'));
          return;
        }

        const codecName = videoStream.codec_name; // 'vp8' or 'vp9'
        console.log(`🔍 Detected WebM codec: ${codecName}`);
        resolve(codecName);
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * Apply WebM avatar overlay to main video
 * @param {Object} options - Overlay options
 * @returns {Promise<string>} - Path to final video with avatar
 */
const applyWebMAvatarToVideo = async ({
  mainVideoPath,
  webmPath,
  musicPath,
  avatarPosition,
  avatarSettings,
  videoDuration,
  outputPath,
  slideTimeRange = null, // Optional: { start: number, end: number } for per-slide timing
  overlayOnly = false, // If true, don't re-process music, just add avatar overlay
  onProgress = null,
  photoMetadata = null, // Optional: original photo dimensions for letterboxing calculation
  slideNumber = null // Optional: slide number for logging
}) => {
  return new Promise(async (resolve, reject) => {

    // Safety checks
    if (!fs.existsSync(mainVideoPath)) {
      const error = `Main video file not found: ${mainVideoPath}`;
      console.error('❌', error);
      reject(new Error(error));
      return;
    }

    if (!fs.existsSync(webmPath)) {
      const error = `WebM avatar file not found: ${webmPath}`;
      console.error('❌', error);
      reject(new Error(error));
      return;
    }

    // Detect WebM codec automatically
    let codecName;
    try {
      codecName = await detectWebMCodec(webmPath);
    } catch (error) {
      console.error('❌ Failed to detect WebM codec:', error);
      reject(new Error(`Codec detection failed: ${error.message}`));
      return;
    }

    // Map codec name to FFmpeg decoder
    const decoderMap = {
      'vp8': 'libvpx',
      'vp9': 'libvpx-vp9'
    };
    const decoder = decoderMap[codecName] || 'libvpx-vp9'; // Default to VP9 if unknown
    console.log(`🎬 Using decoder: ${decoder} for codec: ${codecName}`);

    // Match AvatarPreview sizing calculation EXACTLY
    const frameWidth = 1080; // Video frame width
    const frameHeight = 1920; // Video frame height
    const baseAvatarSize = 160; // Same as AvatarPreview for WebM
    const avatarSize = Math.round(baseAvatarSize * avatarSettings.scale);

    // Avatar position is stored as FRAME-RELATIVE percentages (simplified!)
    // Convert percentage directly to pixel coordinates and ROUND FIRST
    const centerX = Math.round((avatarPosition.x / 100) * frameWidth);
    const centerY = Math.round((avatarPosition.y / 100) * frameHeight);

    // Convert center to top-left corner for FFmpeg overlay (centerX/Y are already integers)
    const x = centerX - Math.round(avatarSize / 2);
    const y = centerY - Math.round(avatarSize / 2);



    // Calculate enable time range for avatar overlay
    const enableTimeRange = slideTimeRange
      ? `between(t,${slideTimeRange.start},${slideTimeRange.end})`
      : `between(t,0,${videoDuration})`;


    let command;

    if (overlayOnly) {
      // Overlay-only mode: Don't re-process music, preserve existing audio
      const overlayFilter = `[1:v]format=yuva420p,scale=${avatarSize}:${avatarSize}[ovr];[0:v][ovr]overlay=${x}:${y}:enable='${enableTimeRange}'[v]`;

      command = ffmpeg()
        .input(mainVideoPath)
        .inputOptions([])
        .input(webmPath)
        .inputOptions(['-stream_loop', '-1', '-c:v', decoder])
        .outputOptions([
          '-filter_complex', overlayFilter,
          '-map', '[v]',
          '-map', '0:a?', // Use audio from main video (if exists)
          '-c:v', 'libx264',
          '-crf', '23',
          '-preset', 'fast',
          '-c:a', 'copy', // Copy existing audio without re-encoding
          '-movflags', '+faststart',
          '-t', videoDuration.toString()
        ])
        .output(outputPath);
    } else {
      // Normal mode: Process with music
      const normalFilter = `[1:v]format=yuva420p,scale=${avatarSize}:${avatarSize}[ovr];[0:v][ovr]overlay=${x}:${y}:enable='${enableTimeRange}'[v]`;

      command = ffmpeg()
        .input(mainVideoPath)
        .inputOptions([])
        .input(webmPath)
        .inputOptions(['-stream_loop', '-1', '-c:v', decoder])
        .input(musicPath)
        .inputOptions(['-stream_loop', '-1'])
        .outputOptions([
          '-filter_complex', normalFilter,
          '-map', '[v]',
          '-map', '2:a',
          '-c:v', 'libx264',
          '-crf', '23',
          '-preset', 'fast',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-movflags', '+faststart',
          '-t', videoDuration.toString()
        ])
        .output(outputPath);
    }
;

    // Progress tracking
    command.on('progress', (progress) => {
      if (onProgress) {
        // Ensure valid progress values (FFmpeg sometimes reports invalid percentages)
        const percent = Math.min(100, Math.max(0, Math.round(progress.percent || 0)));
        onProgress({ percent: percent });
      }
    });

    // Success handler
    command.on('end', () => {
      if (onProgress) onProgress(100);
      resolve(outputPath);
    });

    // Error handler
    command.on('error', (error) => {
      console.error('❌ WebM avatar application failed:', error);
      reject(new Error(`Avatar application failed: ${error.message}`));
    });

    // Start processing
    command.run();
  });
};

/**
 * Process video with WebM avatar - Main function
 * @param {Object} options - Processing options
 * @returns {Promise<string>} - Path to final video
 */
export const processVideoWithWebMAvatar = async ({
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
  overlayOnly = false, // If true, don't re-process music, just add avatar overlay
  onProgress = null
}) => {
  try {

    // Validate WebM avatar
    if (avatarData.type !== 'webm') {
      throw new Error(`Unsupported avatar type: ${avatarData.type}. Expected 'webm'.`);
    }

    const webmPath = path.join(process.cwd(), 'public', avatarData.source);

    // Check if WebM file exists
    if (!fs.existsSync(webmPath)) {
      throw new Error(`WebM avatar file not found: ${webmPath}`);
    }


    // Create temporary file for final output
    const tempOutputPath = path.join(tempDir, `temp-with-webm-avatar-${Date.now()}.mp4`);

    // Progress tracking
    const updateProgress = (stage, stageProgress) => {
      if (onProgress) {
        let totalProgress = 0;
        switch (stage) {
          case 'bpm':
            totalProgress = Math.round(stageProgress * 0.2); // 20% for BPM detection
            break;
          case 'apply':
            totalProgress = 20 + Math.round(stageProgress * 0.8); // 80% for direct application
            break;
        }
        onProgress(Math.min(100, totalProgress));
      }
    };

    // Step 1: Detect music BPM
    updateProgress('bpm', 0);
    const musicBPM = await detectAudioBPM(musicPath);
    updateProgress('bpm', 100);

    // Step 2: Apply avatar directly to main video (single-step process)
    await applyWebMAvatarToVideo({
      mainVideoPath,
      webmPath,
      musicPath,
      avatarPosition,
      avatarSettings,
      videoDuration,
      outputPath: tempOutputPath,
      slideTimeRange,
      photoMetadata,
      slideNumber,
      overlayOnly,
      onProgress: (progress) => updateProgress('apply', progress)
    });

    // Move temp file to final output (use copy + delete for cross-filesystem compatibility)
    if (fs.existsSync(tempOutputPath)) {
      fs.copyFileSync(tempOutputPath, outputPath);
      fs.unlinkSync(tempOutputPath);
    }

    // No temporary files to cleanup since we're using direct overlay

    return outputPath;

  } catch (error) {
    console.error('❌ Video processing with WebM avatar failed:', error);
    throw error;
  }
};


/**
 * Check if WebM avatar processing is supported
 * @returns {boolean} - True if WebM processing is available
 */
export const isWebMAvatarProcessingSupported = () => {
  try {
    return !!ffmpegStatic;
  } catch (error) {
    console.warn('WebM avatar processing support check failed:', error);
    return false;
  }
};

export default {
  detectAudioBPM,
  calculateTempoAdjustment,
  processVideoWithWebMAvatar,
  isWebMAvatarProcessingSupported
};