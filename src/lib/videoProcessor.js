import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set FFmpeg and FFprobe paths - try multiple sources
let ffmpegAvailable = false;
let ffmpegBinaryPath = null;
let ffprobeBinaryPath = null;

// Try ffmpeg-static with ffprobe-static first (most reliable)
try {
  if (ffmpegStatic && ffprobeStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
    
    // ffprobe-static returns an object with path property
    const ffprobePath = typeof ffprobeStatic === 'string' ? ffprobeStatic : ffprobeStatic.path;
    ffmpeg.setFfprobePath(ffprobePath);
    
    ffmpegBinaryPath = ffmpegStatic;
    ffprobeBinaryPath = ffprobePath;
    ffmpegAvailable = true;
    
    console.log('Using ffmpeg-static at:', ffmpegStatic);
    console.log('Using ffprobe-static at:', ffprobePath);
  } else {
    throw new Error('ffmpeg-static or ffprobe-static not available');
  }
} catch (staticError) {
  console.error('ffmpeg-static failed:', staticError);
  
  // Fallback to @ffmpeg-installer
  try {
    if (ffmpegPath && ffmpegPath.path && fs.existsSync(ffmpegPath.path)) {
      ffmpeg.setFfmpegPath(ffmpegPath.path);
      
      // Set ffprobe path from @ffmpeg-installer
      const ffprobeInstallerPath = ffmpegPath.path.replace(/ffmpeg(\.exe)?$/, 'ffprobe$1');
      if (fs.existsSync(ffprobeInstallerPath)) {
        ffmpeg.setFfprobePath(ffprobeInstallerPath);
        ffprobeBinaryPath = ffprobeInstallerPath;
        console.log('Using @ffmpeg-installer at:', ffmpegPath.path);
        console.log('Using @ffprobe-installer at:', ffprobeInstallerPath);
      } else {
        throw new Error('FFprobe not found with @ffmpeg-installer');
      }
      
      ffmpegBinaryPath = ffmpegPath.path;
      ffmpegAvailable = true;
    } else {
      throw new Error('FFmpeg installer path not found');
    }
  } catch (installerError) {
    console.error('FFmpeg installer failed:', installerError);
    
    // Final fallback to system FFmpeg
    try {
      ffmpeg.setFfmpegPath('ffmpeg');
      ffmpeg.setFfprobePath('ffprobe');
      console.log('Using system FFmpeg and FFprobe');
      ffmpegBinaryPath = 'ffmpeg';
      ffprobeBinaryPath = 'ffprobe';
      ffmpegAvailable = true;
    } catch (systemError) {
      console.error('All FFmpeg sources failed:', systemError);
      ffmpegAvailable = false;
    }
  }
}

/**
 * Creates a video from an array of images and audio
 * @param {Object} options - Video creation options
 * @param {Array} options.images - Array of image file paths
 * @param {string} options.audioPath - Path to audio file
 * @param {string} options.outputPath - Path for output video
 * @param {Object} options.settings - Video settings
 * @returns {Promise} - Resolves when video is created
 */
export async function createVideoFromImages(options) {
  const {
    images,
    audioPath,
    outputPath,
    settings = {}
  } = options;

  const {
    duration = 30, // Video duration in seconds
    fps = 24,      // Frames per second
    resolution = '1920x1080', // Output resolution
    transition = 'fade', // Transition effect
    imageDisplayTime = 3 // Time each image is displayed
  } = settings;

  return new Promise((resolve, reject) => {
    try {
      // Calculate how long each image should be displayed
      const totalImages = images.length;
      const timePerImage = duration / totalImages;

      let command = ffmpeg();

      // Create a filter complex for slideshow effect
      const filterComplex = [];
      const overlayInputs = [];

      // Add images as inputs
      images.forEach((imagePath, index) => {
        command = command.input(imagePath);
        
        // Simple scale and pad to fit resolution with black bars
        filterComplex.push({
          filter: 'scale',
          options: `${resolution}:force_original_aspect_ratio=decrease:eval=init`,
          inputs: `${index}:v`,
          outputs: `scaled${index}`
        });

        filterComplex.push({
          filter: 'pad',
          options: `${resolution}:(ow-iw)/2:(oh-ih)/2:color=black`,
          inputs: `scaled${index}`,
          outputs: `padded${index}`
        });

        // Set duration for each image
        filterComplex.push({
          filter: 'setpts',
          options: `PTS-STARTPTS`,
          inputs: `padded${index}`,
          outputs: `timed${index}`
        });
      });

      // Create concat filter for slideshow
      const concatInputs = images.map((_, index) => `timed${index}`).join('');
      filterComplex.push({
        filter: 'concat',
        options: `n=${totalImages}:v=1:a=0`,
        inputs: images.map((_, index) => `timed${index}`),
        outputs: 'slideshow'
      });

      // Add audio input
      command = command.input(audioPath);

      // Apply complex filters
      command = command.complexFilter(filterComplex, ['slideshow']);

      // Set video codec and quality settings
      command = command
        .videoCodec('libx264')
        .audioBitrate('128k')
        .audioCodec('aac')
        .fps(fps)
        .duration(duration)
        .size(resolution)
        .format('mp4');

      // Add error handling
      command.on('error', (err) => {
        console.error('FFmpeg error details:', {
          message: err.message,
          stack: err.stack,
          code: err.code
        });
        reject(new Error(`Video processing failed: ${err.message}`));
      });

      // Add progress tracking
      command.on('progress', (progress) => {
        console.log(`Processing: ${Math.round(progress.percent || 0)}% done`);
      });

      // Handle completion
      command.on('end', () => {
        console.log('Video creation completed successfully');
        resolve(outputPath);
      });

      // Start processing
      command.save(outputPath);

    } catch (error) {
      console.error('Error setting up video processing:', error);
      reject(error);
    }
  });
}

/**
 * Creates a simple slideshow video with proper web-compatible format
 * @param {Object} options - Slideshow options
 */
/**
 * Creates a reliable slideshow using a two-step process
 * @param {Object} options - Slideshow options
 */
export async function createReliableSlideshow(options) {
  const {
    images,
    audioPath,
    outputPath,
    settings = {},
    onProgress = () => {}
  } = options;

  const {
    fps = 25
  } = settings;

  const resolution = '1080x1920'; // Mobile portrait format

  // Calculate minimum required duration: 10 seconds per image, minimum 30 seconds total
  const minDurationForImages = images.length * 10;
  const finalDuration = Math.max(30, minDurationForImages, settings.duration || 30);

  // For multiple images, use two-step process for reliability
  if (images.length > 1) {
    console.log(`Creating slideshow with ${images.length} images using two-step process`);
    console.log(`Total duration: ${finalDuration} seconds (${10} seconds per image)`);
    const timePerImage = Math.max(10, Math.floor(finalDuration / images.length));
    
    return new Promise(async (resolve, reject) => {
      const tempDir = path.join(path.dirname(outputPath), 'temp_videos');
      const tempVideoFiles = [];
      
      try {
        // Create temp directory
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        console.log(`Step 1: Creating ${images.length} individual video clips...`);
        
        // Step 1: Create individual video clips from each image
        for (let i = 0; i < images.length; i++) {
          const imagePath = images[i];
          const tempVideoPath = path.join(tempDir, `clip_${i}.mp4`);
          tempVideoFiles.push(tempVideoPath);
          
          console.log(`Creating clip ${i + 1}/${images.length} from ${path.basename(imagePath)}`);
          
          // Report progress for clip creation (0-50% of total progress)
          const clipProgress = Math.round((i / images.length) * 50);
          onProgress({ percent: clipProgress });
          
          await new Promise((resolveClip, rejectClip) => {
            // Check if this is a video file
            const isVideo = isVideoFile(imagePath);

            // Use simplified FFmpeg command for better compatibility
            let ffmpegCommand = ffmpeg(imagePath);

            if (isVideo) {
              // For video files, don't use loop, just trim to desired duration
              ffmpegCommand = ffmpegCommand.duration(timePerImage);
            } else {
              // For image files, use loop
              ffmpegCommand = ffmpegCommand.loop(timePerImage);
            }

            ffmpegCommand = ffmpegCommand
              .videoFilter('scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black')
              .outputOptions([
                '-c:v', 'libx264',
                '-preset', 'fast', // Faster preset for reliability
                '-crf', '23', // Good quality, more compatible
                '-pix_fmt', 'yuv420p'
              ])
              .format('mp4')
              .on('start', (commandLine) => {
                console.log('📹 FFmpeg command for clip ' + (i + 1) + ':', commandLine);
              })
              .on('error', (err) => {
                console.error(`❌ Error creating clip ${i + 1}:`, err.message);
                console.error('Full error:', err);
                rejectClip(new Error(`Failed to create clip ${i + 1}: ${err.message}`));
              })
              .on('progress', (progress) => {
                // Each clip represents a portion of the first 50% of total progress
                const baseProgress = Math.round((i / images.length) * 50);
                const clipContribution = Math.round((progress.percent || 0) * (50 / images.length) / 100);
                onProgress({ percent: Math.min(50, baseProgress + clipContribution) });
              })
              .on('end', () => {
                console.log(`Clip ${i + 1} created successfully`);
                // Report completion of this clip
                const clipProgress = Math.round(((i + 1) / images.length) * 50);
                onProgress({ percent: Math.min(50, clipProgress) });
                resolveClip();
              })
              .save(tempVideoPath);
          });
        }
        
        console.log('Step 2: Concatenating video clips and adding audio...');
        
        // Report 50% progress before starting final concatenation
        onProgress({ percent: 50 });
        
        // Step 2: Create concat list file and combine with audio
        const listFile = path.join(tempDir, 'list.txt');
        const listContent = tempVideoFiles.map(file => `file '${file.replace(/\\/g, '/')}'`).join('\n');
        fs.writeFileSync(listFile, listContent);
        
        // Concatenate videos and add audio
        ffmpeg()
          .input(listFile)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .input(audioPath)
          .outputOptions([
            '-c:v', 'copy', // Copy video without re-encoding
            '-c:a', 'aac',
            '-b:a', '192k', // Higher audio quality for mobile
            '-movflags', '+faststart',
            '-t', finalDuration.toString()
          ])
          .format('mp4')
          .on('start', (commandLine) => {
            console.log('Final concat command:', commandLine);
          })
          .on('progress', (progress) => {
            // Final concatenation represents 50-100% of total progress
            const finalProgress = Math.round(50 + (progress.percent || 0) * 0.5);
            onProgress({ percent: Math.min(100, finalProgress) });
          })
          .on('error', (err) => {
            console.error('Final concatenation failed:', err);
            // Clean up temp files
            try {
              tempVideoFiles.forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
              });
              if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
              if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
            } catch (cleanupErr) {
              console.error('Cleanup error:', cleanupErr);
            }
            reject(new Error(`Final concatenation failed: ${err.message}`));
          })
          .on('end', () => {
            console.log('Slideshow created successfully');
            // Report 100% completion
            onProgress({ percent: 100 });
            // Clean up temp files
            try {
              tempVideoFiles.forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
              });
              if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
              if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
            } catch (cleanupErr) {
              console.error('Cleanup error:', cleanupErr);
            }
            resolve(outputPath);
          })
          .save(outputPath);
          
      } catch (error) {
        console.error('Error in two-step slideshow creation:', error);
        // Clean up temp files
        try {
          tempVideoFiles.forEach(file => {
            if (fs.existsSync(file)) fs.unlinkSync(file);
          });
          if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
        reject(error);
      }
    });
  }
  
  // Single image - use the simple method with updated duration
  return createSimpleSlideshow({
    ...options,
    settings: {
      ...settings,
      duration: finalDuration
    },
    onProgress: onProgress
  });
}

/**
 * Check if a file path is a video file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if the file is a video
 */
function isVideoFile(filePath) {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
  const ext = path.extname(filePath).toLowerCase();
  return videoExtensions.includes(ext);
}

/**
 * Create video from input video with audio replacement and smart music handling
 * @param {Object} options - Video creation options
 */
export async function createVideoWithAudio(options) {
  const {
    videoPath,
    audioPath,
    outputPath,
    settings = {},
    onProgress = () => {}
  } = options;

  const normalizedVideoPath = path.resolve(videoPath);
  const normalizedAudioPath = path.resolve(audioPath);
  const normalizedOutputPath = path.resolve(outputPath);

  return new Promise(async (resolve, reject) => {
    try {
      const ffmpegBinary = ffmpegStatic || ffmpegPath.path || 'ffmpeg';
      console.log('Creating video with audio replacement:', { videoPath: normalizedVideoPath, audioPath: normalizedAudioPath });

      // Get durations of video and audio
      const videoDuration = await getVideoDuration(normalizedVideoPath);
      const audioDuration = await getAudioDuration(normalizedAudioPath);
      
      console.log(`🎬 Video file: ${path.basename(normalizedVideoPath)} (${formatDuration(videoDuration)})`);
      console.log(`🎵 Audio file: ${path.basename(normalizedAudioPath)} (${formatDuration(audioDuration)})`);
      console.log(`⚙️  Settings duration: ${settings.duration ? formatDuration(settings.duration) : 'undefined (will use video duration)'}`);
      console.log(`📊 Final logic: Video ${formatDuration(videoDuration)} vs Audio ${formatDuration(audioDuration)}`);

      let args;
      
      if (audioDuration > videoDuration) {
        // Long music and short video: cut the music when video ends
        console.log(`Audio is longer than video (${formatDuration(audioDuration)} > ${formatDuration(videoDuration)}) - cutting audio to match video length`);
        args = [
          '-i', normalizedVideoPath,
          '-i', normalizedAudioPath,
          '-c:v', 'copy', // Copy video stream without re-encoding for speed
          '-c:a', 'aac',
          '-b:a', '192k',
          '-map', '0:v:0', // Map video from first input
          '-map', '1:a:0', // Map audio from second input  
          '-t', videoDuration.toString(), // Explicitly limit to video duration
          '-movflags', '+faststart',
          '-y',
          normalizedOutputPath
        ];
      } else if (audioDuration < videoDuration) {
        // Short music and long video: repeat the music until video ends
        console.log(`Audio is shorter than video (${formatDuration(audioDuration)} < ${formatDuration(videoDuration)}) - looping audio to match video length`);
        args = [
          '-i', normalizedVideoPath,
          '-stream_loop', '-1', // Loop audio indefinitely
          '-i', normalizedAudioPath,
          '-c:v', 'copy', // Copy video stream without re-encoding for speed
          '-c:a', 'aac',
          '-b:a', '192k',
          '-t', videoDuration.toString(), // Explicitly limit to video duration
          '-map', '0:v:0', // Map video from first input
          '-map', '1:a:0', // Map audio from second input (will be looped)
          '-movflags', '+faststart',
          '-y',
          normalizedOutputPath
        ];
      } else {
        // Equal duration: just replace audio
        console.log(`Audio and video have equal duration (${formatDuration(audioDuration)}) - direct replacement`);
        args = [
          '-i', normalizedVideoPath,
          '-i', normalizedAudioPath,
          '-c:v', 'copy', // Copy video stream without re-encoding for speed
          '-c:a', 'aac',
          '-b:a', '192k',
          '-map', '0:v:0', // Map video from first input
          '-map', '1:a:0', // Map audio from second input
          '-movflags', '+faststart',
          '-y',
          normalizedOutputPath
        ];
      }

      console.log('FFmpeg command:', ffmpegBinary, args.join(' '));

      const process = spawn(ffmpegBinary, args);
      let stderr = '';
      let stdout = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        
        // Parse progress from stderr
        const progressMatch = chunk.match(/time=(\d{2}):(\d{2}):(\d{2})\.?(\d*)/);
        if (progressMatch) {
          const hours = parseInt(progressMatch[1] || 0);
          const minutes = parseInt(progressMatch[2] || 0);
          const seconds = parseInt(progressMatch[3] || 0);
          const currentTime = hours * 3600 + minutes * 60 + seconds;
          const progress = Math.min(100, Math.max(0, Math.round((currentTime / videoDuration) * 100)));
          
          if (progress > 0) {
            onProgress({ percent: progress });
          }
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('Video with audio replacement created successfully');
          onProgress({ percent: 100 });
          resolve(normalizedOutputPath);
        } else {
          console.error('FFmpeg failed with code:', code);
          console.error('FFmpeg stderr:', stderr.slice(-500));
          reject(new Error(`FFmpeg exited with code ${code}. Error: ${stderr.slice(-200)}`));
        }
      });

      process.on('error', (error) => {
        console.error('Failed to start FFmpeg process:', error);
        reject(new Error(`Failed to start FFmpeg: ${error.message}`));
      });

    } catch (error) {
      console.error('Error setting up video audio replacement:', error);
      reject(error);
    }
  });
}

/**
 * Create proper slideshow using two-step process
 */
export async function createSlideshowDirectly(options) {
  const {
    images,
    audioPath,
    outputPath,
    settings = {},
    onProgress = () => {}
  } = options;

  const duration = Math.max(10, settings.duration || 30);
  const normalizedImages = images.map(img => path.resolve(img));
  const normalizedAudioPath = path.resolve(audioPath);
  const normalizedOutputPath = path.resolve(outputPath);

  // Check if we have a single video file
  if (normalizedImages.length === 1 && isVideoFile(normalizedImages[0])) {
    // Single video file - replace audio (ignore settings.duration, use actual video duration)
    console.log('🎬 Single video file detected - using actual video duration, ignoring settings.duration');
    return createVideoWithAudio({
      videoPath: normalizedImages[0],
      audioPath: normalizedAudioPath,
      outputPath: normalizedOutputPath,
      settings: {
        ...settings,
        duration: undefined // Remove duration override to use actual video duration
      },
      onProgress
    });
  }

  if (normalizedImages.length === 1) {
    // Single image - use direct video creation with autopad
    return createVideoDirectly(options);
  }

  // Multiple files - create slideshow using concat method (supports mixed images/videos)
  return new Promise(async (resolve, reject) => {
    try {
      const ffmpegBinary = ffmpegStatic || ffmpegPath.path || 'ffmpeg';
      const tempDir = path.join(path.dirname(normalizedOutputPath), 'temp_clips');

      // Create temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Calculate actual duration for mixed content
      let actualTotalDuration = 0;
      const itemDurations = [];

      for (let i = 0; i < normalizedImages.length; i++) {
        if (isVideoFile(normalizedImages[i])) {
          // For video files, get actual duration
          const videoDuration = await getVideoDuration(normalizedImages[i]);
          itemDurations.push(videoDuration);
          actualTotalDuration += videoDuration;
          console.log(`📹 Video ${i + 1}: ${path.basename(normalizedImages[i])} - ${videoDuration.toFixed(1)}s`);
        } else {
          // For images, use default duration per item
          const imageTime = duration / normalizedImages.length;
          itemDurations.push(imageTime);
          actualTotalDuration += imageTime;
          console.log(`🖼️ Image ${i + 1}: ${path.basename(normalizedImages[i])} - ${imageTime.toFixed(1)}s`);
        }
      }

      console.log(`🎬 Creating slideshow: ${normalizedImages.length} items, total duration: ${actualTotalDuration.toFixed(1)}s`);
      console.log(`🎯 Video resolution: 1080x1920 (Mobile Portrait) with letterboxing`);

      // Step 1: Create individual video clips (from original images or trim existing videos)
      console.log('🎬 Step 1: Creating individual video clips...');
      const clipPaths = [];
      for (let i = 0; i < normalizedImages.length; i++) {
        const clipPath = path.join(tempDir, `clip_${i}.mp4`);
        clipPaths.push(clipPath);
        
        await new Promise((resolveClip, rejectClip) => {
          let command = ffmpeg();
          
          if (isVideoFile(normalizedImages[i])) {
            // For video files, use full video duration (no trimming)
            command = command
              .input(normalizedImages[i])
              .videoFilters([
                'scale=1080:1920:force_original_aspect_ratio=decrease',
                'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black',
                'setsar=1'
              ])
              .noAudio()
              .outputOptions([
                '-c:v', 'libx264',
                '-preset', 'medium', // Better quality than ultrafast
                '-crf', '18', // High quality (lower = better quality)
                '-pix_fmt', 'yuv420p',
                '-profile:v', 'high', // High profile for better compression
                '-level', '4.0' // Supports up to 1080p
              ]);
          } else {
            // For image files, create video clip with exact size
            command = command
              .input(normalizedImages[i])
              .inputOptions(['-loop', '1'])
              .duration(itemDurations[i])
              .videoFilters([
                'scale=1080:1920:force_original_aspect_ratio=decrease',
                'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black',
                'setsar=1'
              ])
              .outputOptions([
                '-c:v', 'libx264',
                '-preset', 'medium', // Better quality than ultrafast
                '-crf', '18', // High quality (lower = better quality)
                '-pix_fmt', 'yuv420p',
                '-profile:v', 'high', // High profile for better compression
                '-level', '4.0' // Supports up to 1080p
              ]);
          }

          command
            .on('start', (commandLine) => {
              const itemType = isVideoFile(normalizedImages[i]) ? 'video' : 'image';
              console.log(`Creating clip ${i + 1} from ${itemType}: ${path.basename(normalizedImages[i])}`);
            })
            .on('error', (err) => {
              const itemType = isVideoFile(normalizedImages[i]) ? 'video' : 'image';
              console.error(`✗ Failed to create clip ${i + 1} from ${itemType}:`, err);
              rejectClip(new Error(`Failed to create clip ${i + 1}: ${err.message}`));
            })
            .on('end', () => {
              const itemType = isVideoFile(normalizedImages[i]) ? 'video' : 'image';
              console.log(`✓ Clip ${i + 1} created successfully from ${itemType}`);
              // Clip creation takes 0-70% of total progress
              const clipProgress = Math.round(((i + 1) / normalizedImages.length) * 70);
              onProgress({ percent: clipProgress, stage: 'creating_clips' });
              resolveClip();
            })
            .save(clipPath);
        });
      }

      // Step 2: Create concat file and combine with audio
      console.log('🎵 Step 2: Concatenating clips and adding audio...');
      const concatFile = path.join(tempDir, 'list.txt');
      const concatContent = clipPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
      fs.writeFileSync(concatFile, concatContent);

      // Get audio duration to determine if we need to loop it
      const audioDuration = await getAudioDuration(normalizedAudioPath);
      const totalVideoDuration = actualTotalDuration; // Use the calculated actual duration from all clips

      console.log(`Total video duration: ${formatDuration(totalVideoDuration)}, Audio duration: ${formatDuration(audioDuration)}`);
      
      let finalArgs;
      
      if (audioDuration > totalVideoDuration) {
        // Long music: cut the music when video ends
        console.log(`Audio is longer than video (${formatDuration(audioDuration)} > ${formatDuration(totalVideoDuration)}) - cutting audio to match video length`);
        finalArgs = [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatFile,
          '-i', normalizedAudioPath,
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-t', totalVideoDuration.toString(), // Explicitly limit to video duration
          '-y',
          normalizedOutputPath
        ];
      } else if (audioDuration < totalVideoDuration) {
        // Short music: repeat the music until video ends
        console.log(`Audio is shorter than video (${formatDuration(audioDuration)} < ${formatDuration(totalVideoDuration)}) - looping audio to match video length`);
        finalArgs = [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatFile,
          '-stream_loop', '-1', // Loop audio indefinitely
          '-i', normalizedAudioPath,
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-t', totalVideoDuration.toString(), // Explicitly limit to video duration
          '-y',
          normalizedOutputPath
        ];
      } else {
        // Equal duration: direct combination
        console.log(`Audio and video have equal duration (${formatDuration(audioDuration)}) - direct combination`);
        finalArgs = [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatFile,
          '-i', normalizedAudioPath,
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-y',
          normalizedOutputPath
        ];
      }

      const finalProcess = spawn(ffmpegBinary, finalArgs);
      
      let finalStderr = '';
      let finalStdout = '';
      
      finalProcess.stdout.on('data', (data) => {
        finalStdout += data.toString();
      });
      
      finalProcess.stderr.on('data', (data) => {
        finalStderr += data.toString();
      });
      
      finalProcess.on('close', (code) => {
        // Cleanup temp files
        try {
          // Clean up individual clip files first
          clipPaths.forEach(clip => {
            try {
              fs.existsSync(clip) && fs.unlinkSync(clip);
            } catch (e) {
              console.warn(`Could not delete clip ${clip}:`, e.message);
            }
          });
          
          // Clean up concat file
          try {
            fs.existsSync(concatFile) && fs.unlinkSync(concatFile);
          } catch (e) {
            console.warn(`Could not delete concat file:`, e.message);
          }
          
          // Clean up temp directory (only if empty)
          try {
            if (fs.existsSync(tempDir)) {
              const remainingFiles = fs.readdirSync(tempDir);
              if (remainingFiles.length === 0) {
                fs.rmdirSync(tempDir);
                console.log('✅ Temp directory cleaned up successfully');
              } else {
                console.log('⚠️  Temp directory not empty, skipping cleanup (files will be cleaned by scheduled cleanup)');
              }
            }
          } catch (e) {
            console.log('⚠️  Temp directory cleanup skipped (will be cleaned by scheduled cleanup)');
          }
        } catch (cleanupError) {
          console.log('⚠️  Some cleanup operations skipped (files will be cleaned by scheduled cleanup)');
        }

        if (code === 0) {
          console.log('Slideshow created successfully');
          onProgress({ percent: 100 });
          resolve(normalizedOutputPath);
        } else {
          console.error('✗ Final concatenation failed:');
          console.error('Exit code:', code);
          console.error('FFmpeg stderr:', finalStderr);
          console.error('FFmpeg stdout:', finalStdout);
          console.error('Command:', ffmpegBinary, finalArgs.join(' '));
          reject(new Error(`Final concatenation failed with code ${code}. Error: ${finalStderr.slice(-200)}`));
        }
      });

      finalProcess.on('error', (error) => {
        console.error('✗ Final process error:', error);
        reject(new Error(`Final process error: ${error.message}`));
      });

      finalProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        
        // Parse progress from stderr - try multiple patterns
        let progressMatch = chunk.match(/time=(\d{2}):(\d{2}):(\d{2})\.?(\d*)/);
        if (!progressMatch) {
          progressMatch = chunk.match(/time=(\d{1,2}):(\d{2}):(\d{2})\.?(\d*)/);
        }
        if (!progressMatch) {
          progressMatch = chunk.match(/time=(\d+):(\d{2}):(\d{2})\.?(\d*)/);
        }
        
        if (progressMatch) {
          const hours = parseInt(progressMatch[1] || 0);
          const minutes = parseInt(progressMatch[2] || 0);
          const seconds = parseInt(progressMatch[3] || 0);
          const milliseconds = parseInt((progressMatch[4] || '0').padEnd(3, '0').substring(0, 3));
          const currentTime = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
          // Final concatenation takes 70-100% of total progress
          const progress = Math.min(100, Math.max(70, Math.round(70 + (currentTime / duration) * 30)));
          onProgress({ percent: progress, stage: 'finalizing' });
        }
        
        // Alternative progress parsing - look for frame count
        const frameMatch = chunk.match(/frame=\s*(\d+)/);
        if (frameMatch && !progressMatch) {
          const currentFrame = parseInt(frameMatch[1]);
          const expectedFrames = duration * 25; // Assuming 25fps
          // Final concatenation takes 70-100% of total progress
          const progress = Math.min(100, Math.max(70, Math.round(70 + (currentFrame / expectedFrames) * 30)));
          onProgress({ percent: progress, stage: 'finalizing' });
        }
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create video using direct FFmpeg process (bypass fluent-ffmpeg)
 */
export async function createVideoDirectly(options) {
  const {
    images,
    audioPath,
    outputPath,
    settings = {},
    onProgress = () => {}
  } = options;

  const duration = Math.max(10, settings.duration || 30);

  return new Promise(async (resolve, reject) => {
    try {
      // Use ffmpeg-static binary directly
      const ffmpegBinary = ffmpegStatic || ffmpegPath.path || 'ffmpeg';
      console.log('Using FFmpeg binary:', ffmpegBinary);
      console.log(`🎯 Video resolution: 1080x1920 (Mobile Portrait) with letterboxing`);
      
      // Normalize paths and validate they exist
      const normalizedImages = images.map(img => {
        const normalized = path.resolve(img);
        console.log('Image path check:', { original: img, normalized, exists: fs.existsSync(normalized) });
        if (!fs.existsSync(normalized)) {
          throw new Error(`Image file not found: ${normalized}`);
        }
        return normalized;
      });
      
      const normalizedAudioPath = path.resolve(audioPath);
      console.log('Audio path check:', { original: audioPath, normalized: normalizedAudioPath, exists: fs.existsSync(normalizedAudioPath) });
      if (!fs.existsSync(normalizedAudioPath)) {
        throw new Error(`Audio file not found: ${normalizedAudioPath}`);
      }
      
      const normalizedOutputPath = path.resolve(outputPath);
      console.log('Output path check:', { original: outputPath, normalized: normalizedOutputPath, dirExists: fs.existsSync(path.dirname(normalizedOutputPath)) });
      
      // Ensure output directory exists
      const outputDir = path.dirname(normalizedOutputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log('Created output directory:', outputDir);
      }

      // Build FFmpeg command arguments
      let args;
      
      // Use fluent-ffmpeg with proper size and autopad methods
      console.log('Creating video with letterboxing to preserve full images');
      
      ffmpeg()
        .input(normalizedImages[0])
        .inputOptions(['-loop', '1'])
        .input(normalizedAudioPath)
        .duration(duration)
        .videoFilters([
          'scale=1080:1920:force_original_aspect_ratio=decrease',
          'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black',
          'setsar=1'
        ])
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'medium', // Better quality for mobile
          '-crf', '18', // High quality (lower = better quality)
          '-pix_fmt', 'yuv420p',
          '-profile:v', 'high', // High profile for better compression
          '-level', '4.0', // Supports up to 1080p
          '-c:a', 'aac',
          '-b:a', '192k', // Higher audio quality for mobile
          '-movflags', '+faststart',
          '-shortest'
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0);
          if (percent > 0) {
            onProgress({ percent: percent });
          }
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error(`Video creation failed: ${err.message}`));
        })
        .on('end', () => {
          console.log('Video created successfully');
          onProgress({ percent: 100 });
          resolve(normalizedOutputPath);
        })
        .save(normalizedOutputPath);

    } catch (error) {
      console.error('Error setting up direct FFmpeg call:', error);
      reject(error);
    }
  });
}

export async function createSimpleSlideshow(options) {
  const {
    images,
    audioPath,
    outputPath,
    settings = {},
    onProgress = () => {}
  } = options;

  const {
    fps = 25
  } = settings;

  const resolution = '1080x1920'; // Mobile portrait format

  // Calculate minimum required duration: 3 seconds per image, minimum 10 seconds total
  const minDurationForImages = images.length * 3;
  const duration = Math.max(10, minDurationForImages, settings.duration || 30);

  return new Promise((resolve, reject) => {
    try {
      if (!ffmpegAvailable) {
        throw new Error('FFmpeg is not available. Please ensure FFmpeg is installed.');
      }
      
      console.log(`Starting simple slideshow creation with ${images.length} images`);
      console.log('Audio path:', audioPath);
      console.log('Output path:', outputPath);

      // Test that all files exist before processing and normalize paths
      const normalizedImages = [];
      for (const imagePath of images) {
        const normalizedPath = path.resolve(imagePath);
        if (!fs.existsSync(normalizedPath)) {
          throw new Error(`Image file does not exist: ${normalizedPath}`);
        }
        normalizedImages.push(normalizedPath);
        console.log('Image path:', normalizedPath);
      }
      
      const normalizedAudioPath = path.resolve(audioPath);
      if (!fs.existsSync(normalizedAudioPath)) {
        throw new Error(`Audio file does not exist: ${normalizedAudioPath}`);
      }
      console.log('Audio path:', normalizedAudioPath);
      
      const normalizedOutputPath = path.resolve(outputPath);
      console.log('Output path:', normalizedOutputPath);

      console.log(`Total video duration: ${duration} seconds`);
      
      let command = ffmpeg();

      // Use the simplest possible FFmpeg command to avoid crashes
      console.log('Using letterboxing to preserve full images at consistent size');
      
      command
        .input(normalizedImages[0])
        .inputOptions(['-loop', '1'])
        .input(normalizedAudioPath)
        .videoFilters([
          'scale=1080:1920:force_original_aspect_ratio=decrease',
          'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black',
          'setsar=1'
        ])
        .outputOptions([
          '-t', duration.toString(),
          '-c:v', 'libx264',
          '-preset', 'medium', // Better quality for mobile
          '-crf', '18', // High quality 
          '-profile:v', 'high', // High profile for better compression
          '-level', '4.0', // Supports up to 1080p
          '-c:a', 'aac',
          '-b:a', '192k', // Higher audio quality for mobile
          '-movflags', '+faststart',
          '-shortest',
          '-y' // Overwrite output file
        ]);

      command.on('start', (commandLine) => {
        console.log('=== FFmpeg Command ===');
        console.log(commandLine);
        console.log('=== Input Files ===');
        console.log('Image:', normalizedImages[0]);
        console.log('Audio:', normalizedAudioPath);
        console.log('Output:', normalizedOutputPath);
        console.log('===================');
      });

      command.on('error', (err) => {
        console.error('FFmpeg error details:', {
          message: err.message,
          code: err.code,
          signal: err.signal
        });
        
        // Provide more specific error messages based on common issues
        let errorMessage = 'Video processing failed';
        if (err.message.includes('Invalid data found')) {
          errorMessage = 'Invalid image or audio file format';
        } else if (err.message.includes('No such file')) {
          errorMessage = 'File not found during processing';
        } else if (err.message.includes('Permission denied')) {
          errorMessage = 'Permission denied - check file access rights';
        }
        
        reject(new Error(`${errorMessage}: ${err.message}`));
      });

      command.on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0);
        if (percent > 0) {
          console.log(`Processing: ${percent}% done`);
          onProgress({ percent: percent });
        }
      });

      command.on('end', () => {
        console.log('Video creation completed successfully');
        onProgress({ percent: 100 });
        resolve(normalizedOutputPath);
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('FFmpeg process timeout');
        command.kill('SIGKILL');
        reject(new Error('Video processing timed out'));
      }, 120000); // 2 minutes timeout

      command.on('end', () => {
        clearTimeout(timeout);
      });

      command.on('error', () => {
        clearTimeout(timeout);
      });

      command.save(normalizedOutputPath);

    } catch (error) {
      console.error('Error setting up slideshow creation:', error);
      reject(error);
    }
  });
}

/**
 * Get video information using ffprobe
 * @param {string} filePath - Path to video file
 * @returns {Promise} - Video metadata
 */
export async function getVideoInfo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get video info: ${err.message}`));
        return;
      }
      resolve(metadata);
    });
  });
}

/**
 * Get video duration in seconds
 * @param {string} filePath - Path to video file
 * @returns {Promise<number>} - Duration in seconds
 */
export async function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get video duration: ${err.message}`));
        return;
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }
      
      const duration = parseFloat(videoStream.duration || metadata.format.duration || 0);
      resolve(duration);
    });
  });
}

/**
 * Get audio duration in seconds
 * @param {string} filePath - Path to audio file
 * @returns {Promise<number>} - Duration in seconds
 */
export async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get audio duration: ${err.message}`));
        return;
      }
      
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
      if (!audioStream) {
        reject(new Error('No audio stream found'));
        return;
      }
      
      const duration = parseFloat(audioStream.duration || metadata.format.duration || 0);
      resolve(duration);
    });
  });
}

/**
 * Validate video files duration (max 3 minutes)
 * @param {Array} videoPaths - Array of video file paths
 * @returns {Promise<Object>} - Validation result
 */
export async function validateVideosDuration(videoPaths) {
  const MAX_DURATION = 180; // 3 minutes in seconds
  const results = {
    valid: true,
    invalidFiles: [],
    totalDuration: 0
  };
  
  // Check if ffprobe is available before validating
  if (!ffmpegAvailable || !ffprobeBinaryPath) {
    console.warn('FFprobe not available, skipping video duration validation');
    // If ffprobe is not available, assume all videos are valid to avoid blocking uploads
    // This is a graceful degradation - the system will still work but without duration validation
    return results;
  }
  
  for (const videoPath of videoPaths) {
    if (isVideoFile(videoPath)) {
      try {
        const duration = await getVideoDuration(videoPath);
        results.totalDuration += duration;
        
        if (duration > MAX_DURATION) {
          results.valid = false;
          results.invalidFiles.push({
            path: videoPath,
            duration: duration,
            durationFormatted: formatDuration(duration)
          });
        }
      } catch (error) {
        console.error(`Error getting duration for ${videoPath}:`, error);
        
        // If ffprobe fails specifically, treat as warning but allow upload
        if (error.message.includes('Cannot find ffprobe') || error.message.includes('ffprobe')) {
          console.warn(`FFprobe error for ${videoPath}, allowing upload without duration check:`, error.message);
          // Don't mark as invalid, just log the warning
          continue;
        }
        
        // For other errors, mark as invalid for safety
        results.valid = false;
        results.invalidFiles.push({
          path: videoPath,
          duration: null,
          error: error.message
        });
      }
    }
  }
  
  return results;
}

/**
 * Format duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Generate thumbnail from video
 * @param {string} videoPath - Path to video file
 * @param {string} outputDir - Output directory for thumbnail
 * @param {Object} options - Thumbnail options
 */
export async function generateThumbnail(videoPath, outputDir, options = {}) {
  const {
    timestamp = '00:00:01',
    size = '320x240',
    filename = 'thumbnail.png'
  } = options;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename: filename,
        folder: outputDir,
        size: size
      })
      .on('error', (err) => {
        reject(new Error(`Thumbnail generation failed: ${err.message}`));
      })
      .on('filenames', (filenames) => {
        console.log('Generated thumbnail:', filenames[0]);
        resolve(path.join(outputDir, filenames[0]));
      });
  });
}


/**
 * Get image dimensions using ffprobe
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} - Object with width and height
 */
export async function getImageDimensions(imagePath) {
  return new Promise((resolve, reject) => {
    // ffprobe path should already be set during initialization
    // No need to set it again here since it's done globally
    
    ffmpeg.ffprobe(imagePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get image dimensions: ${err.message}`));
        return;
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found in image'));
        return;
      }
      
      resolve({
        width: videoStream.width,
        height: videoStream.height
      });
    });
  });
}

/**
 * Determine optimal video dimensions based on photos
 * @param {Array} imagePaths - Array of image file paths
 * @returns {Promise<Object>} - Object with width and height
 */
export async function determineOptimalVideoDimensions(imagePaths) {
  console.log('📏 Analyzing photo dimensions to determine video size...');
  
  const dimensions = [];
  
  for (const imagePath of imagePaths) {
    try {
      const dim = await getImageDimensions(imagePath);
      dimensions.push(dim);
      console.log(`📷 ${path.basename(imagePath)}: ${dim.width}x${dim.height}`);
    } catch (error) {
      console.warn(`⚠️ Could not get dimensions for ${path.basename(imagePath)}: ${error.message}`);
    }
  }
  
  if (dimensions.length === 0) {
    console.log('⚠️ No image dimensions found, using default 1280x720');
    return { width: 1280, height: 720 };
  }
  
  // Find the most common aspect ratio
  const aspectRatios = dimensions.map(d => d.width / d.height);
  const avgAspectRatio = aspectRatios.reduce((a, b) => a + b, 0) / aspectRatios.length;
  
  // Find the largest resolution that maintains reasonable quality
  const maxWidth = Math.max(...dimensions.map(d => d.width));
  const maxHeight = Math.max(...dimensions.map(d => d.height));
  
  // Use the largest dimensions but ensure they're reasonable (not too huge)
  const optimalWidth = Math.min(maxWidth, 1920); // Cap at 1920 for performance
  const optimalHeight = Math.min(maxHeight, 1080); // Cap at 1080 for performance
  
  // Ensure dimensions are even (required by many codecs)
  const finalWidth = Math.round(optimalWidth / 2) * 2;
  const finalHeight = Math.round(optimalHeight / 2) * 2;
  
  console.log(`🎯 Optimal video dimensions: ${finalWidth}x${finalHeight}`);
  console.log(`📊 Average aspect ratio: ${avgAspectRatio.toFixed(2)}`);
  
  return { width: finalWidth, height: finalHeight };
}

/**
 * Check if FFmpeg is available
 * @returns {Promise<boolean>} - True if FFmpeg is available
 */
export async function checkFFmpegAvailability() {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        console.error('FFmpeg not available:', err.message);
        resolve(false);
      } else {
        console.log('FFmpeg is available');
        resolve(true);
      }
    });
  });
}

/**
 * Get FFmpeg binary path without using fluent-ffmpeg
 */
function getFFmpegBinaryPath() {
  // Try ffmpeg-static first (most reliable)
  if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }
  
  // Try @ffmpeg-installer as fallback
  if (ffmpegPath && ffmpegPath.path && fs.existsSync(ffmpegPath.path)) {
    return ffmpegPath.path;
  }
  
  // Try system FFmpeg as last resort
  return 'ffmpeg';
}

/**
 * Simple video creation using pure FFmpeg spawn (Windows compatible)
 * @param {Object} options - Video creation options
 */
export async function createSimpleVideo(options) {
  const { images, audioPath, outputPath, settings = {}, onProgress = () => {} } = options;

  // Calculate actual duration based on content type
  let actualTotalDuration = 0;

  for (let i = 0; i < images.length; i++) {
    if (isVideoFile(images[i])) {
      // For video files, get actual duration
      const videoDuration = await getVideoDuration(images[i]);
      actualTotalDuration += videoDuration;
      console.log(`📹 Video ${i + 1}: ${path.basename(images[i])} - ${videoDuration.toFixed(1)}s`);
    } else {
      // For images, use 3 seconds per image (or from settings)
      const imageTime = 3;
      actualTotalDuration += imageTime;
      console.log(`🖼️ Image ${i + 1}: ${path.basename(images[i])} - ${imageTime}s`);
    }
  }

  const duration = Math.max(10, actualTotalDuration); // Use actual duration, minimum 10 seconds

  console.log(`🎬 Creating simple video with ${images.length} files, total duration: ${duration.toFixed(1)}s`);
  
  return new Promise((resolve, reject) => {
    // Get FFmpeg binary without fluent-ffmpeg dependency
    const ffmpegBinary = getFFmpegBinaryPath();
    console.log('🔧 Using FFmpeg binary:', ffmpegBinary);
    
    // Validate inputs
    if (!fs.existsSync(images[0])) {
      return reject(new Error(`File not found: ${images[0]}`));
    }
    if (!fs.existsSync(audioPath)) {
      return reject(new Error(`Audio file not found: ${audioPath}`));
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Check if input is a video file or image
    const isVideo = isVideoFile(images[0]);
    console.log(`📁 Input type: ${isVideo ? 'video' : 'image'} file`);
    
    let args;
    
    if (isVideo) {
      // For video files: use video duration but extend/loop audio to match
      const videoDuration = actualTotalDuration;
      args = [
        '-y', // Overwrite output
        '-stream_loop', '-1', // Loop audio stream indefinitely
        '-i', audioPath, // Audio input (put first to loop it)
        '-i', images[0], // Video file as input
        '-t', videoDuration.toString(), // Use calculated video duration
        '-c:v', 'libx264', // Video codec
        '-c:a', 'aac', // Audio codec
        '-pix_fmt', 'yuv420p', // Pixel format for compatibility
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black', // Scale and pad
        '-preset', 'fast', // Fast encoding for reliability
        '-crf', '23', // Good quality, compatible
        '-movflags', '+faststart', // Web optimization
        '-t', duration.toString(), // Duration for final output (trim audio to match video)
        outputPath
      ];
    } else {
      // For image files: use -loop to create video from static image, trim audio to match video duration
      args = [
        '-y', // Overwrite output
        '-loop', '1', // Loop input (only for images)
        '-t', duration.toString(), // Duration for video
        '-i', images[0], // Image file as input
        '-i', audioPath, // Audio input
        '-t', duration.toString(), // Duration for final output (trim audio to match video)
        '-c:v', 'libx264', // Video codec
        '-c:a', 'aac', // Audio codec
        '-pix_fmt', 'yuv420p', // Pixel format for compatibility
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black', // Scale and pad
        '-preset', 'fast', // Fast encoding for reliability
        '-crf', '23', // Good quality, compatible
        '-movflags', '+faststart', // Web optimization
        outputPath
      ];
    }

    console.log('🔧 FFmpeg command:', ffmpegBinary, args.join(' '));
    
    // Spawn FFmpeg process directly
    const ffmpegProcess = spawn(ffmpegBinary, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false, // Don't use shell to avoid Windows issues
    });

    let stderr = '';
    let stdout = '';

    ffmpegProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffmpegProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      
      // Parse progress from FFmpeg output
      const timeMatch = chunk.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseFloat(timeMatch[3]);
        const currentTime = hours * 3600 + minutes * 60 + seconds;
        const progress = Math.min(100, Math.round((currentTime / duration) * 100));
        if (progress > 0) {
          onProgress({ percent: progress });
        }
      }
    });

    ffmpegProcess.on('error', (error) => {
      console.error('❌ FFmpeg process error:', error);
      reject(new Error(`FFmpeg process failed: ${error.message}`));
    });

    ffmpegProcess.on('close', (code) => {
      console.log(`🏁 FFmpeg process exited with code: ${code}`);
      
      if (code === 0) {
        console.log('✅ Video created successfully');
        onProgress({ percent: 100 });
        resolve({ success: true, outputPath });
      } else {
        console.error(`❌ FFmpeg failed with exit code: ${code}`);
        console.error('stderr output:', stderr.slice(-500));
        console.error('stdout output:', stdout.slice(-500));
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error('⏰ FFmpeg process timeout');
      ffmpegProcess.kill('SIGTERM');
      reject(new Error('FFmpeg process timed out'));
    }, 120000); // 2 minutes

    ffmpegProcess.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

export default {
  createVideoFromImages,
  createSimpleSlideshow,
  createReliableSlideshow,
  createSlideshowDirectly,
  createVideoWithAudio,
  createSimpleVideo,
  getVideoInfo,
  getVideoDuration,
  getAudioDuration,
  validateVideosDuration,
  generateThumbnail,
  checkFFmpegAvailability,
  getImageDimensions,
  determineOptimalVideoDimensions
};