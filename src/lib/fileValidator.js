import { fileTypeFromBuffer } from 'file-type';
import sanitizeFilename from 'sanitize-filename';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,    // 5MB for images
  video: 50 * 1024 * 1024,   // 50MB for videos  
  audio: 10 * 1024 * 1024,   // 10MB for audio
  total: 100 * 1024 * 1024   // 100MB total per request
};

// Allowed file types with their magic numbers
export const ALLOWED_FILE_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/mov',
    'video/quicktime'
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/aac'
  ]
};

/**
 * Validates file type using magic number detection
 * @param {Buffer} fileBuffer - File buffer to analyze
 * @param {string} expectedMimeType - Expected MIME type from multer
 * @param {string} originalname - Original filename
 * @returns {Promise<Object>} Validation result
 */
export async function validateFileType(fileBuffer, expectedMimeType, originalname) {
  try {
    // Detect actual file type from magic numbers
    const detectedType = await fileTypeFromBuffer(fileBuffer);
    
    if (!detectedType) {
      return {
        isValid: false,
        error: 'Unable to detect file type - potentially corrupted or malicious file',
        code: 'UNKNOWN_FILE_TYPE'
      };
    }

    // Normalize MIME types for comparison
    const normalizedExpected = expectedMimeType.toLowerCase();
    const normalizedDetected = detectedType.mime.toLowerCase();
    
    // Check if detected type matches expected type
    if (normalizedDetected !== normalizedExpected) {
      return {
        isValid: false,
        error: `File type mismatch: Expected ${expectedMimeType}, detected ${detectedType.mime}`,
        code: 'TYPE_MISMATCH',
        expected: expectedMimeType,
        detected: detectedType.mime
      };
    }

    // Validate file extension matches
    const fileExtension = path.extname(originalname).toLowerCase();
    const expectedExtension = `.${detectedType.ext}`;
    
    if (fileExtension !== expectedExtension) {
      return {
        isValid: false,
        error: `File extension mismatch: Expected ${expectedExtension}, got ${fileExtension}`,
        code: 'EXTENSION_MISMATCH',
        expected: expectedExtension,
        detected: fileExtension
      };
    }

    return {
      isValid: true,
      detectedType: detectedType,
      mime: detectedType.mime,
      extension: detectedType.ext
    };

  } catch (error) {
    return {
      isValid: false,
      error: `File type validation failed: ${error.message}`,
      code: 'VALIDATION_ERROR'
    };
  }
}

/**
 * Validates image file using Sharp
 * @param {string} filePath - Path to the image file
 * @returns {Promise<Object>} Validation result
 */
export async function validateImageFile(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Check for reasonable image dimensions
    if (metadata.width > 10000 || metadata.height > 10000) {
      return {
        isValid: false,
        error: 'Image dimensions too large (max 10000x10000)',
        code: 'IMAGE_TOO_LARGE'
      };
    }

    if (metadata.width < 1 || metadata.height < 1) {
      return {
        isValid: false,
        error: 'Invalid image dimensions',
        code: 'INVALID_DIMENSIONS'
      };
    }

    return {
      isValid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Image validation failed: ${error.message}`,
      code: 'IMAGE_VALIDATION_ERROR'
    };
  }
}

/**
 * Validates video file integrity (basic check)
 * @param {string} filePath - Path to the video file
 * @returns {Promise<Object>} Validation result
 */
export async function validateVideoFile(filePath) {
  return new Promise((resolve) => {
    // Basic file existence and size check
    try {
      const stats = fs.statSync(filePath);
      
      if (stats.size === 0) {
        resolve({
          isValid: false,
          error: 'Video file is empty',
          code: 'EMPTY_FILE'
        });
        return;
      }

      if (stats.size > FILE_SIZE_LIMITS.video) {
        resolve({
          isValid: false,
          error: `Video file too large (max ${FILE_SIZE_LIMITS.video / (1024 * 1024)}MB)`,
          code: 'FILE_TOO_LARGE'
        });
        return;
      }

      // Additional validation using existing FFprobe can be added here
      resolve({
        isValid: true,
        metadata: {
          size: stats.size
        }
      });

    } catch (error) {
      resolve({
        isValid: false,
        error: `Video validation failed: ${error.message}`,
        code: 'VIDEO_VALIDATION_ERROR'
      });
    }
  });
}

/**
 * Validates audio file integrity
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<Object>} Validation result
 */
export async function validateAudioFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.size === 0) {
      return {
        isValid: false,
        error: 'Audio file is empty',
        code: 'EMPTY_FILE'
      };
    }

    if (stats.size > FILE_SIZE_LIMITS.audio) {
      return {
        isValid: false,
        error: `Audio file too large (max ${FILE_SIZE_LIMITS.audio / (1024 * 1024)}MB)`,
        code: 'FILE_TOO_LARGE'
      };
    }

    // Read first few bytes to verify audio file header
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    // Check for common audio file signatures
    const isValidAudio = 
      buffer.toString('ascii', 0, 3) === 'ID3' ||  // MP3 with ID3
      buffer.toString('ascii', 8, 12) === 'WAVE' || // WAV
      buffer.toString('ascii', 0, 4) === 'OggS' ||  // OGG
      buffer.toString('ascii', 4, 8) === 'ftyp';    // M4A/AAC

    if (!isValidAudio) {
      return {
        isValid: false,
        error: 'Invalid audio file format or corrupted file',
        code: 'INVALID_AUDIO_FORMAT'
      };
    }

    return {
      isValid: true,
      metadata: {
        size: stats.size
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Audio validation failed: ${error.message}`,
      code: 'AUDIO_VALIDATION_ERROR'
    };
  }
}

/**
 * Generates a secure filename
 * @param {string} originalname - Original filename
 * @param {string} fieldname - Form field name
 * @returns {string} Secure filename
 */
export function generateSecureFilename(originalname, fieldname) {
  // Sanitize the original filename
  const sanitized = sanitizeFilename(originalname);
  
  // Extract extension
  const ext = path.extname(sanitized).toLowerCase();
  
  // Generate unique identifier
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  
  // Create secure filename
  return `${fieldname}-${timestamp}-${randomString}${ext}`;
}

/**
 * Comprehensive file validation for multer
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
export async function validateUploadedFile(req, file, cb) {
  try {
    const fieldname = file.fieldname;
    const mimeType = file.mimetype;
    const originalname = file.originalname;
    
    // Check fieldname
    if (!['photos', 'music'].includes(fieldname)) {
      return cb(new Error('Invalid field name'), false);
    }

    // Check file size based on type
    const sizeLimit = fieldname === 'photos' ? 
      (mimeType.startsWith('image/') ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.video) :
      FILE_SIZE_LIMITS.audio;

    // Note: file.size is not available in fileFilter, size checking happens in multer limits

    // Validate MIME type
    const allowedTypes = fieldname === 'photos' ? 
      [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.videos] :
      ALLOWED_FILE_TYPES.audio;

    if (!allowedTypes.includes(mimeType)) {
      return cb(new Error(`File type ${mimeType} not allowed for ${fieldname}`), false);
    }

    // Validate filename
    if (!originalname || originalname.length > 255) {
      return cb(new Error('Invalid filename'), false);
    }

    // Check for dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.js', '.jar', '.php', '.asp'];
    const fileExtension = path.extname(originalname).toLowerCase();
    
    if (dangerousExtensions.includes(fileExtension)) {
      return cb(new Error(`File extension ${fileExtension} not allowed`), false);
    }

    cb(null, true);

  } catch (error) {
    cb(new Error(`File validation error: ${error.message}`), false);
  }
}

/**
 * Post-upload validation with magic number checking
 * @param {Object} file - Uploaded file info
 * @param {string} uploadPath - Path where file was uploaded
 * @returns {Promise<Object>} Detailed validation result
 */
export async function postUploadValidation(file, uploadPath) {
  try {
    // Read file buffer for magic number validation
    const fileBuffer = fs.readFileSync(uploadPath);
    
    // Validate file type with magic numbers
    const typeValidation = await validateFileType(fileBuffer, file.mimetype, file.originalname);
    
    if (!typeValidation.isValid) {
      // Delete invalid file
      try {
        fs.unlinkSync(uploadPath);
      } catch (deleteError) {
        console.error('Error deleting invalid file:', deleteError);
      }
      return typeValidation;
    }

    // Content-specific validation
    let contentValidation = { isValid: true };
    
    if (file.fieldname === 'photos') {
      if (file.mimetype.startsWith('image/')) {
        contentValidation = await validateImageFile(uploadPath);
      } else if (file.mimetype.startsWith('video/')) {
        contentValidation = await validateVideoFile(uploadPath);
      }
    } else if (file.fieldname === 'music') {
      contentValidation = await validateAudioFile(uploadPath);
    }

    if (!contentValidation.isValid) {
      // Delete invalid file
      try {
        fs.unlinkSync(uploadPath);
      } catch (deleteError) {
        console.error('Error deleting invalid file:', deleteError);
      }
      return contentValidation;
    }

    return {
      isValid: true,
      typeValidation,
      contentValidation,
      fileSize: fileBuffer.length
    };

  } catch (error) {
    // Delete file on validation error
    try {
      fs.unlinkSync(uploadPath);
    } catch (deleteError) {
      console.error('Error deleting file after validation error:', deleteError);
    }

    return {
      isValid: false,
      error: `Post-upload validation failed: ${error.message}`,
      code: 'POST_VALIDATION_ERROR'
    };
  }
}