import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import QRCode from 'qrcode';
import { 
  validateUploadedFile, 
  postUploadValidation, 
  generateSecureFilename,
  FILE_SIZE_LIMITS 
} from './src/lib/fileValidator.js';
import { 
  // initRedis,
  rateLimiter,
  combinedRateLimit,
  recordGenerationAttempt,
  getClientIP
} from './src/lib/redisRateLimit.js';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Redis disabled - using in-memory rate limiting only
console.log('🔄 Redis disabled, using in-memory rate limiting');

// Get base URL for QR codes and API calls
const getBaseUrl = (req) => {
  // Use environment variable for base URL (production domain or localhost)
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // Fallback to request host
  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || (req.connection.encrypted ? 'https' : 'http');
  return `${protocol}://${host}`;
};

const app = express();
const PORT = process.env.PORT || 5003;

// Security middleware with comprehensive CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline event handlers in mobile optimization
        "'unsafe-eval'" // Required for video generation progress tracking
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and Tailwind
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://purecatamphetamine.github.io", // Flag icons primary source
        "https://cdn.jsdelivr.net", // Flag icons fallback
        "https:"
      ],
      mediaSrc: [
        "'self'",
        "blob:",
        "data:"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:*", // Development server connections
        "ws://localhost:*" // WebSocket connections for dev
      ],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [], // Enable HTTPS upgrades
      reportUri: "/api/csp-violation" // CSP violation reporting
    },
    reportOnly: false // Set to true for testing, false for enforcement
  },
  crossOriginEmbedderPolicy: false, // Allow video playback
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Add CORS and security headers
app.use((req, res, next) => {
  // CORS headers
  const allowedOrigins = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
  res.setHeader('Access-Control-Allow-Headers', 'Range, X-Requested-With, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Log mobile requests for debugging
  const userAgent = req.get('User-Agent') || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;
  
  if (isMobile && (req.query.ios === 'true' || req.query.android === 'true' || req.query.mobile === 'true')) {
    const deviceType = isAndroid ? 'Android' : 'iOS';
    console.log(`📱 ${deviceType} request detected: ${req.method} ${req.originalUrl}`);
    console.log(`🤖 User-Agent: ${userAgent.substring(0, 100)}...`);
  }
  
  next();
});

// IMPORTANT: Mobile video download page MUST come before static file serving
// Mobile video download page (intercept temp-videos requests)
app.get('/public/temp-videos/:filename', (req, res) => {
  const { filename } = req.params;
  
  console.log(`📱 Mobile download page requested: ${filename}`);
  console.log(`🔍 Query params: ${JSON.stringify(req.query)}`);
  
  const videoPath = path.join(__dirname, 'public', 'temp-videos', filename);
  
  // Check if video exists
  if (!fs.existsSync(videoPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Video Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h1>Video Not Found</h1>
        <p>The video you're looking for has expired or doesn't exist.</p>
      </body>
      </html>
    `);
  }

  // Check if this is a direct download request (from download button click)
  const requestUserAgent = req.get('User-Agent') || '';
  const acceptHeader = req.get('Accept') || '';
  
  console.log(`👤 User-Agent: ${requestUserAgent.substring(0, 100)}...`);
  
  const shouldServeDirectly = req.query.download === 'true' || 
                          requestUserAgent.includes('TKVGen-Mobile-Downloader') ||
                          acceptHeader.includes('application/octet-stream') ||
                          req.headers['sec-fetch-dest'] === 'document' ||
                          req.query.android === 'true' ||
                          req.query.ios === 'true' ||
                          req.query.mobile === 'true';
  
  console.log(`📥 Direct download: ${shouldServeDirectly}`);

  // If it's a direct download request, serve the video file directly
  if (shouldServeDirectly) {
    console.log(`🔄 Serving video file directly: ${filename}`);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Set headers for video download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="tkvgen-video.mp4"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    
    // Handle range requests
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize,
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
      });
      
      const stream = fs.createReadStream(videoPath, { start, end });
      stream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      const stream = fs.createReadStream(videoPath);
      stream.pipe(res);
    }
    return;
  }
  
  // Otherwise, serve the download page
  const stat = fs.statSync(videoPath);
  const fileSize = (stat.size / (1024 * 1024)).toFixed(2); // Size in MB
  
  console.log(`📄 Serving download page for ${filename} (${fileSize} MB)`);
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  
  // Mobile-optimized HTML page for video download
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="format-detection" content="telephone=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#667eea">
  <meta name="msapplication-navbutton-color" content="#667eea">
  <meta name="application-name" content="TKVGen">
  <title>TKVGen Video Download</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 20px;
      background: #667eea;
      color: white;
      text-align: center;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      color: #333;
      border-radius: 20px;
      padding: 30px;
      max-width: 350px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .logo { font-size: 48px; margin-bottom: 15px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 25px; font-size: 16px; }
    .download-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 25px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin: 15px 0;
      width: 80%;
      transition: background 0.3s;
    }
    .download-btn:hover { background: #45a049; }
    .info { color: #888; font-size: 14px; margin-top: 20px; line-height: 1.5; }
    .debug { font-size: 12px; color: #999; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎬</div>
    <div class="title">TKVGen</div>
    <div class="subtitle">Your video is ready!</div>
    
    <a href="/public/temp-videos/${filename}?download=true" class="download-btn" download="tkvgen-video.mp4">
      📱 Download Video (${fileSize} MB)
    </a>
    
    <div class="info">
      <strong>📱 Mobile Users:</strong><br>
      <strong>iOS:</strong> Tap button → Long press video → "Save to Photos"<br>
      <strong>Android:</strong> Tap button → Downloads folder or "Save video"<br>
      <strong>Chrome:</strong> Tap button → Check Downloads notification<br>
    </div>
    
    <div class="debug">
      Filename: ${filename}<br>
      <span id="ua">Loading...</span>
    </div>
  </div>
  
  <script>
    // Mobile download optimization script
    try {
      // Set debug info
      document.getElementById('ua').textContent = 'UA: ' + navigator.userAgent.substring(0, 40) + '...';
      console.log('Page loaded successfully for: ${filename}');
      
      // Mobile device detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isMobile = isIOS || isAndroid;
      const isInStandaloneMode = window.navigator.standalone === true;
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isFirefox = /Firefox/.test(navigator.userAgent);
      const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
      
      if (isMobile) {
        console.log(\`Mobile device detected: \${isIOS ? 'iOS' : 'Android'}\`);
        
        // Enhanced mobile download handling
        setTimeout(() => {
          const downloadBtn = document.querySelector('.download-btn');
          if (downloadBtn && !isInStandaloneMode) {
            const deviceType = isAndroid ? 'Android' : 'iOS';
            console.log(\`\${deviceType} detected, optimizing download\`);
            
            // Add click handler for better mobile download experience
            downloadBtn.addEventListener('click', function(e) {
              const deviceParam = isAndroid ? 'android=true' : 'ios=true';
              const downloadUrl = this.href + 
                (this.href.includes('?') ? '&' : '?') + 
                \`\${deviceParam}&mobile=true\`;
              
              console.log(\`\${deviceType} download URL:\`, downloadUrl);
              
              // Device-specific handling for better compatibility
              if (isAndroid) {
                if (isChrome || isSamsung) {
                  window.location.href = downloadUrl;
                } else if (isFirefox) {
                  window.open(downloadUrl, '_self');
                } else {
                  window.open(downloadUrl, '_blank');
                }
              } else {
                // iOS handling
                window.open(downloadUrl, '_blank');
              }
            });
          }
        }, 500);
        
        // Mobile viewport optimization
        if (isAndroid) {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover');
          }
          
          // Samsung Browser specific handling
          if (isSamsung) {
            console.log('Samsung Browser detected');
            document.body.style.webkitUserSelect = 'none';
            document.body.style.webkitTouchCallout = 'none';
          }
        }
      }
      
    } catch(e) {
      console.error('Script error:', e);
    }
  </script>
</body>
</html>`)
});

// Serve video files for direct download
app.get('/download-video/:filename', (req, res) => {
  const { filename } = req.params;
  const videoPath = path.join(__dirname, 'public', 'temp-videos', filename);
  
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  // Set headers for proper video download
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.setHeader('Accept-Ranges', 'bytes');
  
  // Handle range requests (important for mobile video playback/download)
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="tkvgen-video.mp4"`,
      'Access-Control-Allow-Origin': '*'
    });
    
    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  } else {
    // For direct download without range
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': fileSize,
      'Content-Disposition': `attachment; filename="tkvgen-video.mp4"`,
      'Access-Control-Allow-Origin': '*'
    });
    
    const stream = fs.createReadStream(videoPath);
    stream.pipe(res);
  }
});

// Serve static files from public directory
app.use('/public', (req, res, next) => {
  // Set CORS headers for static file serving
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Range, X-Requested-With, Content-Type');
  
  // For video files, set proper headers
  if (req.path.endsWith('.mp4') || req.path.endsWith('.webm') || req.path.endsWith('.avi')) {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'video/mp4');
    
    // If it's a download request (from download button), set attachment header
    const isDownload = req.query.download === 'true' || req.headers['user-agent']?.includes('TKVGen-Mobile-Downloader');
    if (isDownload) {
      res.setHeader('Content-Disposition', 'attachment; filename="tkvgen-video.mp4"');
    }
  }
  
  next();
}, express.static(path.join(__dirname, 'public')));

// Enhanced multer configuration with security validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure upload directory exists
    const uploadDir = 'public/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate secure filename
    const secureFilename = generateSecureFilename(file.originalname, file.fieldname);
    cb(null, secureFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.total, // 100MB total limit
    files: 10, // Maximum 10 files
    fields: 10, // Maximum 10 fields
    fieldSize: 1024 * 1024, // 1MB field size
    headerPairs: 20 // Maximum 20 header pairs
  },
  fileFilter: validateUploadedFile
});

// API Routes

// Upload photos with enhanced security validation
app.post('/api/upload-photos', upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    const sessionId = req.body.sessionId || req.headers['x-session-id'];
    const validFiles = [];
    const invalidFiles = [];

    // Perform post-upload validation with magic number checking
    for (const file of req.files) {
      const filePath = path.join(__dirname, 'public', 'uploads', file.filename);
      const validation = await postUploadValidation(file, filePath);
      
      if (validation.isValid) {
        validFiles.push({
          id: Math.random().toString(36),
          filename: file.filename,
          originalname: file.originalname,
          url: `/public/uploads/${file.filename}`,
          size: file.size,
          validationResult: validation
        });
      } else {
        invalidFiles.push({
          filename: file.originalname,
          error: validation.error,
          code: validation.code
        });
      }
    }

    if (validFiles.length === 0) {
      return res.status(400).json({ 
        error: 'All uploaded files failed validation',
        invalidFiles: invalidFiles
      });
    }

    const photoUrls = validFiles;

    // Track uploaded files in session
    if (sessionId && activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      const filePaths = req.files.map(file => path.join(__dirname, 'public', 'uploads', file.filename));
      session.files.push(...filePaths);
      session.lastHeartbeat = Date.now();
    }

    // Validate video durations for any uploaded video files
    const { validateVideosDuration } = await import('./src/lib/videoProcessor.js');
    const filePaths = req.files.map(file => path.join(__dirname, 'public', 'uploads', file.filename));
    const validationResult = await validateVideosDuration(filePaths);
    
    if (!validationResult.valid) {
      // Delete uploaded files that are invalid
      const invalidFiles = validationResult.invalidFiles.map(file => {
        const filename = path.basename(file.path);
        // Delete the invalid file
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (deleteError) {
          console.error('Error deleting invalid file:', deleteError);
        }
        
        return file.duration ? 
          `${filename} (${file.durationFormatted} - exceeds 3 minute limit)` :
          `${filename} (validation error)`;
      });
      
      // Only return the valid files
      const validPhotoUrls = photoUrls.filter(photo => {
        return !validationResult.invalidFiles.some(invalid => 
          path.basename(invalid.path) === photo.filename
        );
      });
      
      return res.status(400).json({ 
        error: 'Some videos exceed the duration limit',
        message: 'Videos longer than 3 minutes are not allowed',
        invalidFiles: invalidFiles,
        validFiles: validPhotoUrls,
        details: 'Please use videos that are 3 minutes or shorter'
      });
    }

    res.json({
      success: true,
      photos: photoUrls,
      message: `${req.files.length} file(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Upload music with enhanced security validation
app.post('/api/upload-music', upload.single('music'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No music file uploaded' });
    }

    const sessionId = req.body.sessionId || req.headers['x-session-id'];
    
    // Perform post-upload validation with magic number checking
    const filePath = path.join(__dirname, 'public', 'uploads', req.file.filename);
    const validation = await postUploadValidation(req.file, filePath);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Music file failed validation',
        details: validation.error,
        code: validation.code
      });
    }

    const musicData = {
      id: Math.random().toString(36),
      filename: req.file.filename,
      originalname: req.file.originalname,
      url: `/public/uploads/${req.file.filename}`,
      size: req.file.size,
      type: 'uploaded',
      validationResult: validation
    };

    // Track uploaded music file in session
    if (sessionId && activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      const filePath = path.join(__dirname, 'public', 'uploads', req.file.filename);
      session.files.push(filePath);
      session.lastHeartbeat = Date.now();
    }

    res.json({
      success: true,
      music: musicData,
      message: 'Music uploaded successfully'
    });
  } catch (error) {
    console.error('Music upload error:', error);
    res.status(500).json({ error: 'Failed to upload music' });
  }
});

// Get local music files
app.get('/api/local-music', (req, res) => {
  try {
    const localMusicDir = path.join(__dirname, 'public', 'local-music');
    
    if (!fs.existsSync(localMusicDir)) {
      return res.json({ success: true, music: [] });
    }

    const files = fs.readdirSync(localMusicDir);
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    
    const musicFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return audioExtensions.includes(ext);
      })
      .map(file => {
        const filePath = path.join(localMusicDir, file);
        const stats = fs.statSync(filePath);
        
        // Extract title from filename (remove extension and format)
        const nameWithoutExt = path.parse(file).name;
        const title = nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Estimate duration based on file size (rough approximation)
        const estimatedDuration = Math.floor(stats.size / (128000 / 8)); // Assuming 128kbps bitrate
        const durationFormatted = `${Math.floor(estimatedDuration / 60)}:${(estimatedDuration % 60).toString().padStart(2, '0')}`;
        
        return {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file,
          originalname: file,
          title: title,
          url: `/public/local-music/${file}`,
          size: stats.size,
          type: 'local',
          duration: estimatedDuration,
          durationFormatted: durationFormatted,
          hotCount: musicHotCounts.get(file) || 0
        };
      });

    res.json({
      success: true,
      music: musicFiles,
      message: `Found ${musicFiles.length} local music files`
    });
  } catch (error) {
    console.error('Local music fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch local music files' });
  }
});

// Like/Unlike local music endpoint
app.post('/api/local-music/like', (req, res) => {
  try {
    const { filename, action } = req.body; // action: 'like' or 'unlike'
    
    if (!filename || !['like', 'unlike'].includes(action)) {
      return res.status(400).json({ error: 'Invalid filename or action' });
    }

    let currentCount = musicHotCounts.get(filename) || 0;
    
    if (action === 'like') {
      currentCount += 1;
    } else if (action === 'unlike' && currentCount > 0) {
      currentCount -= 1;
    }
    
    musicHotCounts.set(filename, currentCount);
    
    res.json({
      success: true,
      filename: filename,
      hotCount: currentCount,
      action: action
    });
  } catch (error) {
    console.error('Music like error:', error);
    res.status(500).json({ error: 'Failed to update music like status' });
  }
});

// Store music likes/hot counts (simple in-memory storage)
const musicHotCounts = new Map();

// Initialize hot counts for local music
const initializeMusicData = () => {
  const defaultHotCounts = {
    'Dynamic-Motivating.mp3': Math.floor(Math.random() * 100) + 50,
    'R&B-Energetic.mp3': Math.floor(Math.random() * 100) + 50,
    'Smooth-Soulful.mp3': Math.floor(Math.random() * 100) + 50,
    'Workout-Energy.mp3': Math.floor(Math.random() * 100) + 50
  };
  
  Object.entries(defaultHotCounts).forEach(([filename, count]) => {
    if (!musicHotCounts.has(filename)) {
      musicHotCounts.set(filename, count);
    }
  });
};

// Initialize music data
initializeMusicData();

// Store active progress trackers
const progressTrackers = new Map();

// Store temporary video URLs with expiration
const temporaryUrls = new Map();

// Session tracking for cleanup management
const activeSessions = new Map(); // sessionId -> { lastHeartbeat, files: [], generationAttempts: [] }

// Legacy session tracking for file cleanup (still needed)
// Rate limiting is now handled by Redis-based system

// Enhanced rate limit status endpoint with IP and Session tracking
app.get('/api/rate-limit-status', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || req.headers['x-session-id'];
    const clientIP = getClientIP(req);

    // Get both IP and session rate limit status
    const [ipStatus, sessionStatus] = await Promise.all([
      rateLimiter.getRateLimitStatus(clientIP, 'ip'),
      sessionId ? rateLimiter.getRateLimitStatus(sessionId, 'session') : null
    ]);

    // Determine if generation is allowed (both limits must pass)
    const canGenerate = ipStatus.allowed && (sessionStatus ? sessionStatus.allowed : true);

    res.json({
      success: true,
      canGenerate,
      ip: {
        address: clientIP,
        hourlyUsed: ipStatus.hourlyUsed,
        dailyUsed: ipStatus.dailyUsed,
        weeklyUsed: ipStatus.weeklyUsed,
        limits: ipStatus.limits,
        allowed: ipStatus.allowed,
        resetTimes: ipStatus.resetTimes
      },
      session: sessionStatus ? {
        id: sessionId,
        hourlyUsed: sessionStatus.hourlyUsed,
        dailyUsed: sessionStatus.dailyUsed,
        limits: sessionStatus.limits,
        allowed: sessionStatus.allowed,
        resetTimes: sessionStatus.resetTimes
      } : null,
      // Legacy compatibility fields
      hourlyAttempts: Math.max(ipStatus.hourlyUsed, sessionStatus?.hourlyUsed || 0),
      dailyAttempts: Math.max(ipStatus.dailyUsed, sessionStatus?.dailyUsed || 0),
      hourlyLimit: ipStatus.limits.hourly,
      dailyLimit: ipStatus.limits.daily
    });
  } catch (error) {
    console.error('Rate limit status error:', error);
    res.status(500).json({ error: 'Failed to get rate limit status' });
  }
});

// Heartbeat endpoint to track active sessions
app.post('/api/heartbeat', (req, res) => {
  try {
    const { sessionId, leaving } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const now = Date.now();
    
    // If user is leaving, immediately mark session for cleanup
    if (leaving) {
      if (activeSessions.has(sessionId)) {
        console.log(`👋 User leaving, marking session ${sessionId} for immediate cleanup`);
        // Mark session as abandoned by setting very old timestamp
        activeSessions.get(sessionId).lastHeartbeat = now - (10 * 60 * 1000); // 10 minutes ago
      }
    } else {
      // Normal heartbeat - update or create session
      if (activeSessions.has(sessionId)) {
        activeSessions.get(sessionId).lastHeartbeat = now;
      } else {
        activeSessions.set(sessionId, {
          lastHeartbeat: now,
          files: [],
          generationAttempts: [] // Track video generation attempts with timestamps
        });
      }
    }
    
    res.json({ 
      success: true, 
      sessionId,
      timestamp: now,
      leaving: leaving || false
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

// Generate video endpoint with enhanced IP-based rate limiting
app.post('/api/generate-video', combinedRateLimit, async (req, res) => {
  try {
    const { photos, music, settings = {} } = req.body;
    
    // Session ID is still used for UX but not required for rate limiting
    const sessionId = req.body.sessionId || req.headers['x-session-id'];

    if (!photos || photos.length === 0) {
      return res.status(400).json({ error: 'Photos are required' });
    }

    if (!music) {
      return res.status(400).json({ error: 'Music is required' });
    }

    console.log('Starting video generation...');
    console.log('Photos:', photos);
    console.log('Music:', music);

    // Record this generation attempt in Redis
    await recordGenerationAttempt(req);
    const clientIP = getClientIP(req);
    console.log(`🎬 Generation attempt recorded for IP: ${clientIP}${sessionId ? `, Session: ${sessionId}` : ''}`);

    // Generate unique job ID for progress tracking
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Import video processor
    const { createSlideshowDirectly, validateVideosDuration } = await import('./src/lib/videoProcessor.js');

    // Prepare file paths - URLs are like '/public/uploads/filename.jpg' for uploaded files
    const imagePaths = photos.map(photo => path.join(__dirname, photo.url.slice(1))); // Remove leading slash
    
    // Validate video durations (max 3 minutes per video)
    const validationResult = await validateVideosDuration(imagePaths);
    if (!validationResult.valid) {
      const invalidFiles = validationResult.invalidFiles.map(file => {
        const filename = path.basename(file.path);
        return file.duration ? 
          `${filename} (${file.durationFormatted} - exceeds 3 minute limit)` :
          `${filename} (${file.error})`;
      });
      
      return res.status(400).json({ 
        error: 'Video duration validation failed',
        message: 'Some videos exceed the 3-minute limit',
        invalidFiles: invalidFiles,
        details: 'Please use videos that are 3 minutes or shorter'
      });
    }
    
    // Handle music source - only uploaded music now
    let audioPath = path.join(__dirname, music.url.slice(1)); // Remove leading slash
    
    // Generate unique filename
    const filename = `video-${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, 'public', 'videos', filename);

    // Ensure videos directory exists
    const videosDir = path.dirname(outputPath);
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Validate input files exist
    for (const imagePath of imagePaths) {
      if (!fs.existsSync(imagePath)) {
        return res.status(400).json({ error: `Image file not found: ${imagePath}` });
      }
    }

    if (!fs.existsSync(audioPath)) {
      return res.status(400).json({ error: `Audio file not found: ${audioPath}` });
    }

    // Initialize progress tracker for this job
    progressTrackers.set(jobId, {
      progress: 0,
      status: 'initializing',
      message: 'Starting video generation...'
    });

    // Start video processing asynchronously
    (async () => {
      try {
        // Create progress callback
        const onProgress = (progress) => {
          const tracker = progressTrackers.get(jobId);
          if (tracker) {
            tracker.progress = Math.round(progress.percent || 0);
            tracker.status = 'processing';
            tracker.message = `Processing video... ${tracker.progress}% complete`;
            progressTrackers.set(jobId, tracker);
            console.log(`Job ${jobId}: ${tracker.progress}% done`);
          }
        };

        await createSlideshowDirectly({
          images: imagePaths,
          audioPath: audioPath,
          outputPath: outputPath,
          settings: {
            duration: settings.duration || 30,
            fps: settings.fps || 25,
            resolution: settings.resolution || '1280x720'
          },
          onProgress: onProgress
        });

        // Verify the output file was created
        if (!fs.existsSync(outputPath)) {
          throw new Error('Video file was not created successfully');
        }

        // Generate temporary URL that expires in 5 minutes
        const tempUrlId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes from now
        
        // Copy video to temporary public location with temp filename
        const tempVideoFilename = `${tempUrlId}.mp4`;
        const tempVideoPath = path.join(__dirname, 'public', 'temp-videos', tempVideoFilename);
        
        // Ensure temp-videos directory exists
        const tempVideosDir = path.dirname(tempVideoPath);
        if (!fs.existsSync(tempVideosDir)) {
          fs.mkdirSync(tempVideosDir, { recursive: true });
        }
        
        // Copy video to temporary location
        fs.copyFileSync(outputPath, tempVideoPath);
        
        // Store temporary URL mapping
        temporaryUrls.set(tempUrlId, {
          videoPath: outputPath,
          tempVideoPath: tempVideoPath,
          filename: filename,
          tempFilename: tempVideoFilename,
          expiresAt: expiresAt,
          accessed: false
        });
        
        const videoData = {
          id: Math.random().toString(36),
          filename: filename,
          url: `/public/videos/${filename}`,
          tempUrl: `/public/temp-videos/${tempVideoFilename}`,
          tempUrlId: tempUrlId,
          expiresAt: new Date(expiresAt).toISOString(),
          status: 'completed',
          createdAt: new Date().toISOString(),
          size: fs.statSync(outputPath).size
        };

        console.log('Video generated successfully:', videoData);

        // Update progress tracker with completion
        progressTrackers.set(jobId, {
          progress: 100,
          status: 'completed',
          message: 'Video generated successfully!',
          videoData: videoData
        });

        // Clean up tracker after a delay to allow client to get final status
        setTimeout(() => {
          progressTrackers.delete(jobId);
        }, 30000); // 30 seconds

      } catch (ffmpegError) {
        console.error('FFmpeg processing error:', ffmpegError);
        progressTrackers.set(jobId, {
          progress: 0,
          status: 'error',
          message: 'Video processing failed',
          error: ffmpegError.message
        });

        // Clean up tracker after error
        setTimeout(() => {
          progressTrackers.delete(jobId);
        }, 30000);
      }
    })();

    // Return job ID immediately to client
    res.json({
      success: true,
      jobId: jobId,
      message: 'Video generation started'
    });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      error: 'Failed to start video generation',
      details: error.message,
      type: error.name
    });
  }
});

// Progress tracking endpoint
app.get('/api/video-progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const tracker = progressTrackers.get(jobId);
  
  if (!tracker) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(tracker);
});


// Serve temporary video URLs
app.get('/api/video/:tempUrlId', (req, res) => {
  const { tempUrlId } = req.params;
  const tempVideo = temporaryUrls.get(tempUrlId);
  
  if (!tempVideo) {
    return res.status(404).json({ error: 'Video not found or expired' });
  }
  
  // Check if URL has expired
  if (Date.now() > tempVideo.expiresAt) {
    temporaryUrls.delete(tempUrlId);
    return res.status(410).json({ error: 'Video URL has expired' });
  }
  
  // Check if video file still exists
  if (!fs.existsSync(tempVideo.videoPath)) {
    temporaryUrls.delete(tempUrlId);
    return res.status(404).json({ error: 'Video file not found' });
  }
  
  // Mark as accessed
  tempVideo.accessed = true;
  
  // Set appropriate headers for video streaming
  const stat = fs.statSync(tempVideo.videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(tempVideo.videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Disposition': `inline; filename="${tempVideo.filename}"`,
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    };
    res.writeHead(200, head);
    fs.createReadStream(tempVideo.videoPath).pipe(res);
  }
});

// Generate QR Code for temporary video URL
app.get('/api/qr-code/:tempUrlId', async (req, res) => {
  const { tempUrlId } = req.params;
  const tempVideo = temporaryUrls.get(tempUrlId);
  
  if (!tempVideo) {
    return res.status(404).json({ error: 'Video not found or expired' });
  }
  
  // Check if URL has expired
  if (Date.now() > tempVideo.expiresAt) {
    temporaryUrls.delete(tempUrlId);
    return res.status(410).json({ error: 'Video URL has expired' });
  }
  
  try {
    // Get base URL for QR code generation
    const baseUrl = getBaseUrl(req);
    const videoUrl = `${baseUrl}/public/temp-videos/${tempVideo.tempFilename}`;
    
    console.log(`🔗 Generating QR code for: ${videoUrl}`);
    console.log(`📱 Base URL: ${baseUrl}`);
    console.log(`📄 Temp filename: ${tempVideo.tempFilename}`);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(videoUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    res.json({
      success: true,
      qrCodeDataUrl: qrCodeDataUrl,
      videoUrl: videoUrl,
      expiresAt: new Date(tempVideo.expiresAt).toISOString()
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Cleanup utility functions
const cleanupFiles = (filePaths) => {
  const results = [];
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        results.push({ path: filePath, success: true });
        console.log(`Deleted file: ${filePath}`);
      } else {
        results.push({ path: filePath, success: true, message: 'File already deleted' });
      }
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
      results.push({ path: filePath, success: false, error: error.message });
    }
  }
  return results;
};

// Import comment manager
import { 
  addComment, 
  getSessionComments, 
  getRandomPublicComments,
  startCommentCleanup,
  COMMENT_CONFIG 
} from './src/lib/commentManager.js';

// Initialize comment cleanup on server start
startCommentCleanup();

// Comment API endpoints

// Add a new comment
app.post('/api/comments', (req, res) => {
  try {
    const { sessionId, text } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    const result = addComment(sessionId, text);
    
    if (result.success) {
      console.log(`💬 Comment added for session ${sessionId}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      res.json({
        success: true,
        comments: result.comments,
        message: result.message
      });
    } else {
      res.status(400).json({
        error: result.error,
        comments: result.comments,
        cooldownRemaining: result.cooldownRemaining
      });
    }
  } catch (error) {
    console.error('Comment submission error:', error);
    res.status(500).json({ error: 'Failed to submit comment' });
  }
});

// Get random public comments for community feed
app.get('/api/comments/public', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const publicComments = getRandomPublicComments(limit);
    
    res.json({
      success: true,
      comments: publicComments,
      count: publicComments.length
    });
  } catch (error) {
    console.error('Public comments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch public comments' });
  }
});

// Get comment system configuration (optional - for frontend to know limits)
app.get('/api/comments/config', (req, res) => {
  res.json({
    maxCommentsPerSession: COMMENT_CONFIG.maxCommentsPerSession,
    submissionCooldownSeconds: COMMENT_CONFIG.submissionCooldown / 1000,
    retentionDays: COMMENT_CONFIG.retentionDays
  });
});

// Get comments for a session
app.get('/api/comments/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const result = getSessionComments(sessionId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Comment fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Cleanup endpoint - removes specified files
app.post('/api/cleanup', (req, res) => {
  try {
    const { photos = [], videos = [], music = [] } = req.body;
    
    const filesToDelete = [];
    
    // Add photo files to cleanup list
    photos.forEach(photo => {
      if (photo.url && photo.url.startsWith('/public/uploads/')) {
        filesToDelete.push(path.join(__dirname, photo.url.slice(1)));
      }
    });
    
    // Add video files to cleanup list
    videos.forEach(video => {
      if (video.url && video.url.startsWith('/public/videos/')) {
        filesToDelete.push(path.join(__dirname, video.url.slice(1)));
      }
    });
    
    // Add music files to cleanup list
    music.forEach(musicFile => {
      if (musicFile.url && musicFile.url.startsWith('/public/uploads/')) {
        filesToDelete.push(path.join(__dirname, musicFile.url.slice(1)));
      }
    });
    
    const results = cleanupFiles(filesToDelete);
    
    res.json({
      success: true,
      message: `Cleaned up ${results.filter(r => r.success).length} files`,
      results: results
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup files' });
  }
});

// Periodic cleanup endpoint - removes old files
app.post('/api/cleanup-old-files', (req, res) => {
  try {
    const { maxAgeMinutes = 60 } = req.body; // Default: 1 hour
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
    const now = Date.now();
    
    const directories = [
      path.join(__dirname, 'public', 'uploads'),
      path.join(__dirname, 'public', 'videos')
    ];
    
    const filesToDelete = [];
    
    for (const dir of directories) {
      if (!fs.existsSync(dir)) continue;
      
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          filesToDelete.push(filePath);
        }
      }
    }
    
    const results = cleanupFiles(filesToDelete);
    
    res.json({
      success: true,
      message: `Cleaned up ${results.filter(r => r.success).length} old files (older than ${maxAgeMinutes} minutes)`,
      results: results
    });
  } catch (error) {
    console.error('Old files cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup old files' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// CSP violation reporting endpoint
app.post('/api/csp-violation', express.json({ limit: '1mb' }), (req, res) => {
  try {
    const violation = req.body;
    
    // Log CSP violation for security monitoring
    console.warn('🚨 CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      clientIP: getClientIP(req),
      userAgent: req.get('User-Agent'),
      violation: {
        blockedURI: violation['blocked-uri'],
        disposition: violation.disposition,
        documentURI: violation['document-uri'],
        effectiveDirective: violation['effective-directive'],
        originalPolicy: violation['original-policy'],
        referrer: violation.referrer,
        statusCode: violation['status-code'],
        violatedDirective: violation['violated-directive']
      }
    });
    
    // In production, you might want to send these to a security monitoring service
    // or store them in a database for analysis
    
    res.status(204).end(); // No Content response for CSP reports
  } catch (error) {
    console.error('Error processing CSP violation report:', error);
    res.status(400).json({ error: 'Invalid CSP report' });
  }
});

// Get QR code configuration
app.get('/api/qr-config', (req, res) => {
  res.json({
    baseUrl: process.env.BASE_URL || null,
    defaultBaseUrl: getBaseUrl(req),
    instructions: {
      environment: "Set BASE_URL environment variable (e.g., https://wgenv.com for production or http://localhost:5003 for development)",
      howToSet: "Add BASE_URL=https://wgenv.com to your .env file",
      example: "For production: BASE_URL=https://wgenv.com npm start"
    }
  });
});

// Update QR code base URL (for development/testing)
app.post('/api/qr-config', (req, res) => {
  const { baseUrl } = req.body;
  
  if (!baseUrl) {
    return res.status(400).json({ error: 'baseUrl is required' });
  }
  
  // Validate URL format
  try {
    new URL(baseUrl);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  // Note: This is temporary per session, not persistent
  // For permanent config, users should set QR_BASE_URL environment variable
  process.env.QR_BASE_URL = baseUrl;
  
  res.json({
    success: true,
    message: 'QR base URL updated for this session',
    baseUrl: baseUrl,
    note: 'This is temporary. Set QR_BASE_URL environment variable for permanent config'
  });
});

// FFmpeg test endpoint
app.get('/api/test-ffmpeg', async (req, res) => {
  try {
    const { checkFFmpegAvailability } = await import('./src/lib/videoProcessor.js');
    const isAvailable = await checkFFmpegAvailability();
    
    res.json({
      ffmpegAvailable: isAvailable,
      status: isAvailable ? 'OK' : 'FFmpeg not available'
    });
  } catch (error) {
    res.status(500).json({
      ffmpegAvailable: false,
      error: error.message
    });
  }
});

// Enhanced error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File size too large',
        details: `Maximum file size is ${FILE_SIZE_LIMITS.total / (1024 * 1024)}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files',
        details: 'Maximum 10 files allowed per upload',
        code: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({ 
        error: 'Too many fields',
        code: 'TOO_MANY_FIELDS'
      });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({ 
        error: 'Field value too long',
        code: 'FIELD_VALUE_TOO_LONG'
      });
    }
  }

  // Handle file validation errors
  if (error.message && error.message.includes('File type') || 
      error.message.includes('not allowed') ||
      error.message.includes('Invalid')) {
    return res.status(400).json({ 
      error: 'File validation failed',
      details: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Enhanced automatic cleanup function with session tracking
const performPeriodicCleanup = () => {
  const now = Date.now();
  const abandonedSessionTimeout = 5 * 60 * 1000; // 5 minutes
  const fallbackMaxAge = 30 * 60 * 1000; // 30 minutes fallback

  // Clean up abandoned sessions and their files
  const abandonnedSessions = [];
  const filesToDeleteFromSessions = [];

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastHeartbeat > abandonedSessionTimeout) {
      abandonnedSessions.push(sessionId);
      filesToDeleteFromSessions.push(...session.files);
    }
  }

  // Remove abandoned sessions
  abandonnedSessions.forEach(sessionId => {
    activeSessions.delete(sessionId);
  });

  if (abandonnedSessions.length > 0) {
    console.log(`🧹 Cleaned up ${abandonnedSessions.length} abandoned sessions`);
  }
  
  // Clean expired temporary URLs and their files
  const expiredUrls = [];
  for (const [urlId, tempVideo] of temporaryUrls.entries()) {
    if (now > tempVideo.expiresAt) {
      expiredUrls.push(urlId);
      // Delete temporary video file if it exists
      if (tempVideo.tempVideoPath && fs.existsSync(tempVideo.tempVideoPath)) {
        try {
          fs.unlinkSync(tempVideo.tempVideoPath);
          console.log(`🗑️  Deleted expired temp video: ${tempVideo.tempVideoPath}`);
        } catch (error) {
          console.error(`Failed to delete temp video ${tempVideo.tempVideoPath}:`, error);
        }
      }
    }
  }
  
  expiredUrls.forEach(urlId => {
    temporaryUrls.delete(urlId);
  });
  
  if (expiredUrls.length > 0) {
    console.log(`🧹 Cleaned up ${expiredUrls.length} expired temporary URLs`);
  }
  
  // Comprehensive file coverage - all directories that may contain user files
  const directories = [
    path.join(__dirname, 'public', 'uploads'),
    path.join(__dirname, 'public', 'videos'),
    path.join(__dirname, 'public', 'temp-videos'),
    path.join(__dirname, 'public', 'videos', 'temp_clips'),
    path.join(__dirname, 'public', 'videos', 'temp_clips', 'preprocessed')
  ];
  
  const filesToDeleteByAge = [];
  
  // Add files from abandoned sessions first
  filesToDeleteByAge.push(...filesToDeleteFromSessions);
  
  // Add files based on age (fallback cleanup)
  for (const dir of directories) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      try {
        const stats = fs.statSync(filePath);
        
        // Skip if it's a directory
        if (stats.isDirectory()) continue;
        
        // For temp files, use shorter timeout; for others use fallback
        const isIntermediateFile = filePath.includes('temp_clips') || filePath.includes('temp-videos');
        const maxAge = isIntermediateFile ? abandonedSessionTimeout : fallbackMaxAge;
        
        if (now - stats.mtime.getTime() > maxAge) {
          filesToDeleteByAge.push(filePath);
        }
      } catch (error) {
        console.error(`Error checking file stats for ${filePath}:`, error);
      }
    }
  }
  
  // Remove duplicate file paths
  const uniqueFilesToDelete = [...new Set(filesToDeleteByAge)];
  
  if (uniqueFilesToDelete.length > 0) {
    const results = cleanupFiles(uniqueFilesToDelete);
    const successCount = results.filter(r => r.success).length;
    const abandonedCount = filesToDeleteFromSessions.length;
    const ageBasedCount = successCount - Math.min(abandonedCount, successCount);
    
    console.log(`🧹 Periodic cleanup: Removed ${successCount} files (${Math.min(abandonedCount, successCount)} from abandoned sessions, ${ageBasedCount} by age)`);
  }
};

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 TKVGen Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.BASE_URL) {
    console.log(`📱 Base URL: ${process.env.BASE_URL}`);
  } else {
    console.log(`📱 Using request host for QR codes and API calls`);
  }
  console.log(`💡 For production, configure BASE_URL environment variable to https://wgenv.com\n`);
  
  // Start enhanced periodic cleanup (every 2 minutes for abandoned sessions, fallback 30 min for age-based)
  setInterval(performPeriodicCleanup, 2 * 60 * 1000);
  console.log('🧹 Enhanced automatic file cleanup enabled:');
  console.log('   • Every 2 minutes: Check for abandoned sessions (5 min timeout)');
  console.log('   • Fallback: Remove files older than 30 minutes');
  console.log('   • Comprehensive coverage: uploads, videos, temp files, and processing clips');
  console.log('⏱️  Temporary video URLs expire after 5 minutes');
});