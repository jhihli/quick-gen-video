import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMENTS_DIR = path.join(__dirname, '../../public/comments');
const COMMENT_CONFIG = {
  retentionDays: 7,
  maxCommentsPerSession: 1,
  submissionCooldown: 0, // No cooldown needed for single submission
  cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
};

// Ensure comments directory exists
function ensureCommentsDirectory() {
  if (!fs.existsSync(COMMENTS_DIR)) {
    fs.mkdirSync(COMMENTS_DIR, { recursive: true });
    console.log('Created comments directory:', COMMENTS_DIR);
  }
}

// Generate comment file path for session
function getCommentFilePath(sessionId) {
  return path.join(COMMENTS_DIR, `session-${sessionId}.json`);
}

// Generate unique comment ID
function generateCommentId() {
  return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Load comments for a session
export function loadSessionComments(sessionId) {
  ensureCommentsDirectory();
  
  const filePath = getCommentFilePath(sessionId);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const commentData = JSON.parse(data);
      
      // Check if comments have expired
      const now = Date.now();
      if (commentData.expiresAt && now > commentData.expiresAt) {
        // Comments expired, delete file and return empty
        fs.unlinkSync(filePath);
        return {
          sessionId,
          comments: [],
          createdAt: now,
          lastUpdated: now,
          expiresAt: now + (COMMENT_CONFIG.retentionDays * 24 * 60 * 60 * 1000),
          lastSubmission: null
        };
      }
      
      return commentData;
    }
  } catch (error) {
    console.error('Error loading comments for session', sessionId, ':', error);
  }
  
  // Return empty comment structure
  const now = Date.now();
  return {
    sessionId,
    comments: [],
    createdAt: now,
    lastUpdated: now,
    expiresAt: now + (COMMENT_CONFIG.retentionDays * 24 * 60 * 60 * 1000),
    lastSubmission: null
  };
}

// Save comments for a session
function saveSessionComments(commentData) {
  ensureCommentsDirectory();
  
  const filePath = getCommentFilePath(commentData.sessionId);
  
  try {
    commentData.lastUpdated = Date.now();
    fs.writeFileSync(filePath, JSON.stringify(commentData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving comments for session', commentData.sessionId, ':', error);
    return false;
  }
}

// Add a new comment to a session
export function addComment(sessionId, text) {
  const commentData = loadSessionComments(sessionId);
  const now = Date.now();
  
  // Validation checks
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'Comment text is required',
      comments: commentData.comments
    };
  }
  
  if (text.length > 200) {
    return {
      success: false,
      error: 'Comment too long (max 200 characters)',
      comments: commentData.comments
    };
  }
  
  // Check comment limit (only one comment allowed per session)
  if (commentData.comments.length >= COMMENT_CONFIG.maxCommentsPerSession) {
    return {
      success: false,
      error: 'You have already submitted your feedback for this session',
      comments: commentData.comments,
      hasSubmitted: true
    };
  }
  
  // Create new comment
  const newComment = {
    id: generateCommentId(),
    text: text.trim(),
    timestamp: now
  };
  
  // Add to comments array
  commentData.comments.push(newComment);
  commentData.lastSubmission = now;
  
  // Save to file
  const saved = saveSessionComments(commentData);
  
  if (saved) {
    return {
      success: true,
      comments: commentData.comments,
      message: 'Comment added successfully'
    };
  } else {
    return {
      success: false,
      error: 'Failed to save comment',
      comments: commentData.comments
    };
  }
}

// Get all comments for a session
export function getSessionComments(sessionId) {
  const commentData = loadSessionComments(sessionId);
  
  return {
    comments: commentData.comments,
    commentCount: commentData.comments.length,
    maxComments: COMMENT_CONFIG.maxCommentsPerSession,
    lastSubmission: commentData.lastSubmission,
    hasSubmitted: commentData.comments.length >= COMMENT_CONFIG.maxCommentsPerSession,
    expiresAt: commentData.expiresAt
  };
}

// Clean up expired comment files
export function cleanupExpiredComments() {
  ensureCommentsDirectory();
  
  const now = Date.now();
  let deletedCount = 0;
  let errorCount = 0;
  
  try {
    const files = fs.readdirSync(COMMENTS_DIR);
    
    for (const file of files) {
      if (!file.startsWith('session-') || !file.endsWith('.json')) {
        continue;
      }
      
      const filePath = path.join(COMMENTS_DIR, file);
      
      try {
        const stats = fs.statSync(filePath);
        const data = fs.readFileSync(filePath, 'utf8');
        const commentData = JSON.parse(data);
        
        // Check if expired by expiration date or age-based fallback
        const isExpired = (commentData.expiresAt && now > commentData.expiresAt) ||
                         (now - stats.mtime.getTime() > COMMENT_CONFIG.retentionDays * 24 * 60 * 60 * 1000);
        
        if (isExpired) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted expired comment file: ${file}`);
        }
      } catch (fileError) {
        console.error(`Error processing comment file ${file}:`, fileError);
        errorCount++;
      }
    }
  } catch (error) {
    console.error('Error during comment cleanup:', error);
    errorCount++;
  }
  
  console.log(`Comment cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`);
  return { deletedCount, errorCount };
}

// Get all comments for admin review (optional feature)
export function getAllComments() {
  ensureCommentsDirectory();
  
  const allComments = [];
  
  try {
    const files = fs.readdirSync(COMMENTS_DIR);
    
    for (const file of files) {
      if (!file.startsWith('session-') || !file.endsWith('.json')) {
        continue;
      }
      
      const filePath = path.join(COMMENTS_DIR, file);
      
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const commentData = JSON.parse(data);
        
        // Skip expired comments
        if (commentData.expiresAt && Date.now() > commentData.expiresAt) {
          continue;
        }
        
        allComments.push({
          sessionId: commentData.sessionId,
          comments: commentData.comments,
          createdAt: commentData.createdAt,
          lastUpdated: commentData.lastUpdated
        });
      } catch (fileError) {
        console.error(`Error reading comment file ${file}:`, fileError);
      }
    }
  } catch (error) {
    console.error('Error getting all comments:', error);
  }
  
  return allComments;
}

// Initialize comment cleanup interval
let cleanupTimer = null;

export function startCommentCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }
  
  // Run cleanup immediately
  cleanupExpiredComments();
  
  // Schedule regular cleanup
  cleanupTimer = setInterval(() => {
    cleanupExpiredComments();
  }, COMMENT_CONFIG.cleanupInterval);
  
  console.log('Comment cleanup scheduled every', COMMENT_CONFIG.cleanupInterval / (60 * 60 * 1000), 'hours');
}

export function stopCommentCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    console.log('Comment cleanup stopped');
  }
}

// Get random public comments for community feed
export function getRandomPublicComments(limit = 10) {
  ensureCommentsDirectory();
  
  const allPublicComments = [];
  let userIdCounter = 1;
  const sessionUserMap = new Map(); // Map session IDs to anonymous user IDs
  
  try {
    const files = fs.readdirSync(COMMENTS_DIR);
    
    for (const file of files) {
      if (!file.startsWith('session-') || !file.endsWith('.json')) {
        continue;
      }
      
      const filePath = path.join(COMMENTS_DIR, file);
      
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const commentData = JSON.parse(data);
        
        // Skip expired comments
        if (commentData.expiresAt && Date.now() > commentData.expiresAt) {
          continue;
        }
        
        // Generate anonymous user ID for this session
        if (!sessionUserMap.has(commentData.sessionId)) {
          sessionUserMap.set(commentData.sessionId, `User #${userIdCounter++}`);
        }
        const anonymousUserId = sessionUserMap.get(commentData.sessionId);
        
        // Add all comments from this session with anonymous user ID
        for (const comment of commentData.comments) {
          allPublicComments.push({
            id: comment.id,
            text: comment.text,
            timestamp: comment.timestamp,
            anonymousUser: anonymousUserId
          });
        }
      } catch (fileError) {
        console.error(`Error reading comment file ${file}:`, fileError);
      }
    }
  } catch (error) {
    console.error('Error getting public comments:', error);
  }
  
  // Shuffle the comments randomly
  for (let i = allPublicComments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPublicComments[i], allPublicComments[j]] = [allPublicComments[j], allPublicComments[i]];
  }
  
  // Return the requested number of comments
  return allPublicComments.slice(0, limit);
}

// Export configuration for reference
export { COMMENT_CONFIG };