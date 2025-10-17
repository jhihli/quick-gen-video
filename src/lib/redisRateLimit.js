import { createClient } from 'redis';
import rateLimit from 'express-rate-limit';

// Redis client configuration
let redisClient = null;
let isRedisConnected = false;

// Rate limiting constants - Adjusted for development
export const RATE_LIMITS = {
  IP_HOURLY: process.env.NODE_ENV === 'development' ? 50 : 3,
  IP_DAILY: process.env.NODE_ENV === 'development' ? 200 : 10,
  IP_WEEKLY: process.env.NODE_ENV === 'development' ? 1000 : 50,
  SESSION_HOURLY: process.env.NODE_ENV === 'development' ? 50 : 3,
  SESSION_DAILY: process.env.NODE_ENV === 'development' ? 200 : 10
};

// Time windows in milliseconds
export const TIME_WINDOWS = {
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
};

/**
 * Initialize Redis connection
 */
export async function initRedis() {
  // Check if Redis is disabled
  if (process.env.REDIS_DISABLED === 'true') {
    console.log('🔄 Redis disabled via REDIS_DISABLED=true, using in-memory rate limiting');
    isRedisConnected = false;
    redisClient = null;
    return null;
  }

  try {
    // Redis connection configuration
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 2000,
        lazyConnect: true
      },
      // Graceful error handling - reduced retries for testing
      retry: {
        retries: 1,
        delay: (attempt) => Math.min(attempt * 100, 1000)
      }
    });

    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisConnected = true;
    });

    redisClient.on('disconnect', () => {
      console.warn('⚠️  Redis disconnected');
      isRedisConnected = false;
    });

    // Connect to Redis
    await redisClient.connect();
    isRedisConnected = true;
    
    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    console.log('🔄 Falling back to in-memory rate limiting');
    isRedisConnected = false;
    redisClient = null;
    return null;
  }
}

/**
 * Get client IP address with proxy support
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
export function getClientIP(req) {
  // Priority order for IP detection
  const ipSources = [
    req.headers['x-forwarded-for'],
    req.headers['x-real-ip'],
    req.headers['x-client-ip'],
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.ip
  ];

  for (const source of ipSources) {
    if (source) {
      // Handle comma-separated IPs (from proxies)
      const ip = Array.isArray(source) ? source[0] : source.split(',')[0].trim();
      
      // Validate IP format
      if (isValidIP(ip)) {
        return normalizeIP(ip);
      }
    }
  }

  return '127.0.0.1'; // Fallback to localhost
}

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IP
 */
function isValidIP(ip) {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Normalize IP address for consistent storage
 * @param {string} ip - IP address to normalize
 * @returns {string} Normalized IP address
 */
function normalizeIP(ip) {
  // Remove IPv6 wrapper for IPv4 addresses
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }
  
  return ip.toLowerCase().trim();
}

/**
 * Redis-based rate limiting implementation
 */
export class RedisRateLimit {
  constructor() {
    this.fallbackStore = new Map(); // Fallback for when Redis is unavailable
  }

  /**
   * Get rate limit key for Redis
   * @param {string} identifier - IP address or session ID
   * @param {string} window - Time window (hourly, daily, weekly)
   * @param {string} type - Type of limit (ip, session)
   * @returns {string} Redis key
   */
  getKey(identifier, window, type = 'ip') {
    return `rate_limit:${type}:${identifier}:${window}`;
  }

  /**
   * Check and update rate limit
   * @param {string} identifier - IP address or session ID
   * @param {string} type - Type of limit (ip, session)
   * @returns {Promise<Object>} Rate limit status
   */
  async checkRateLimit(identifier, type = 'ip') {
    const now = Date.now();
    
    try {
      if (isRedisConnected && redisClient) {
        return await this.checkRedisRateLimit(identifier, type, now);
      } else {
        return await this.checkFallbackRateLimit(identifier, type, now);
      }
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fallback to allowing the request if rate limiting fails
      return {
        allowed: true,
        hourlyCount: 0,
        dailyCount: 0,
        weeklyCount: 0,
        resetTimes: {
          hourly: new Date(now + TIME_WINDOWS.HOUR),
          daily: new Date(now + TIME_WINDOWS.DAY),
          weekly: new Date(now + TIME_WINDOWS.WEEK)
        }
      };
    }
  }

  /**
   * Redis-based rate limit checking
   * @param {string} identifier - IP or session identifier
   * @param {string} type - Rate limit type
   * @param {number} now - Current timestamp
   * @returns {Promise<Object>} Rate limit result
   */
  async checkRedisRateLimit(identifier, type, now) {
    const hourlyKey = this.getKey(identifier, 'hourly', type);
    const dailyKey = this.getKey(identifier, 'daily', type);
    const weeklyKey = this.getKey(identifier, 'weekly', type);

    // Get current counts
    const [hourlyCount, dailyCount, weeklyCount] = await Promise.all([
      redisClient.get(hourlyKey).then(val => parseInt(val) || 0),
      redisClient.get(dailyKey).then(val => parseInt(val) || 0),
      redisClient.get(weeklyKey).then(val => parseInt(val) || 0)
    ]);

    // Check limits
    const limits = type === 'ip' ? {
      hourly: RATE_LIMITS.IP_HOURLY,
      daily: RATE_LIMITS.IP_DAILY,
      weekly: RATE_LIMITS.IP_WEEKLY
    } : {
      hourly: RATE_LIMITS.SESSION_HOURLY,
      daily: RATE_LIMITS.SESSION_DAILY,
      weekly: RATE_LIMITS.SESSION_DAILY * 7 // Weekly session limit
    };

    const allowed = hourlyCount < limits.hourly && 
                   dailyCount < limits.daily && 
                   weeklyCount < limits.weekly;

    return {
      allowed,
      hourlyCount,
      dailyCount,
      weeklyCount,
      limits,
      resetTimes: {
        hourly: new Date(now + TIME_WINDOWS.HOUR),
        daily: new Date(now + TIME_WINDOWS.DAY),
        weekly: new Date(now + TIME_WINDOWS.WEEK)
      }
    };
  }

  /**
   * Increment rate limit counters
   * @param {string} identifier - IP or session identifier
   * @param {string} type - Rate limit type
   * @returns {Promise<void>}
   */
  async incrementRateLimit(identifier, type = 'ip') {
    try {
      if (isRedisConnected && redisClient) {
        await this.incrementRedisRateLimit(identifier, type);
      } else {
        await this.incrementFallbackRateLimit(identifier, type);
      }
    } catch (error) {
      console.error('Rate limit increment failed:', error);
    }
  }

  /**
   * Redis-based rate limit increment
   * @param {string} identifier - IP or session identifier
   * @param {string} type - Rate limit type
   */
  async incrementRedisRateLimit(identifier, type) {
    const hourlyKey = this.getKey(identifier, 'hourly', type);
    const dailyKey = this.getKey(identifier, 'daily', type);
    const weeklyKey = this.getKey(identifier, 'weekly', type);

    // Use Redis pipeline for atomic operations
    const pipeline = redisClient.multi();
    
    // Increment counters
    pipeline.incr(hourlyKey);
    pipeline.incr(dailyKey);
    pipeline.incr(weeklyKey);
    
    // Set expiration times if keys are new
    pipeline.expire(hourlyKey, Math.ceil(TIME_WINDOWS.HOUR / 1000));
    pipeline.expire(dailyKey, Math.ceil(TIME_WINDOWS.DAY / 1000));
    pipeline.expire(weeklyKey, Math.ceil(TIME_WINDOWS.WEEK / 1000));
    
    await pipeline.exec();
  }

  /**
   * Fallback rate limiting using in-memory storage
   * @param {string} identifier - IP or session identifier
   * @param {string} type - Rate limit type
   * @param {number} now - Current timestamp
   * @returns {Promise<Object>} Rate limit result
   */
  async checkFallbackRateLimit(identifier, type, now) {
    const key = `${type}:${identifier}`;
    const data = this.fallbackStore.get(key) || {
      hourly: [],
      daily: [],
      weekly: []
    };

    // Clean up expired timestamps
    data.hourly = data.hourly.filter(ts => now - ts < TIME_WINDOWS.HOUR);
    data.daily = data.daily.filter(ts => now - ts < TIME_WINDOWS.DAY);
    data.weekly = data.weekly.filter(ts => now - ts < TIME_WINDOWS.WEEK);

    // Check limits
    const limits = type === 'ip' ? {
      hourly: RATE_LIMITS.IP_HOURLY,
      daily: RATE_LIMITS.IP_DAILY,
      weekly: RATE_LIMITS.IP_WEEKLY
    } : {
      hourly: RATE_LIMITS.SESSION_HOURLY,
      daily: RATE_LIMITS.SESSION_DAILY,
      weekly: RATE_LIMITS.SESSION_DAILY * 7
    };

    const allowed = data.hourly.length < limits.hourly &&
                   data.daily.length < limits.daily &&
                   data.weekly.length < limits.weekly;

    // Update storage
    this.fallbackStore.set(key, data);

    return {
      allowed,
      hourlyCount: data.hourly.length,
      dailyCount: data.daily.length,
      weeklyCount: data.weekly.length,
      limits,
      resetTimes: {
        hourly: new Date(now + TIME_WINDOWS.HOUR),
        daily: new Date(now + TIME_WINDOWS.DAY),
        weekly: new Date(now + TIME_WINDOWS.WEEK)
      }
    };
  }

  /**
   * Increment fallback rate limit counters
   * @param {string} identifier - IP or session identifier
   * @param {string} type - Rate limit type
   */
  async incrementFallbackRateLimit(identifier, type) {
    const key = `${type}:${identifier}`;
    const now = Date.now();
    const data = this.fallbackStore.get(key) || {
      hourly: [],
      daily: [],
      weekly: []
    };

    // Add current timestamp
    data.hourly.push(now);
    data.daily.push(now);
    data.weekly.push(now);

    // Update storage
    this.fallbackStore.set(key, data);
  }

  /**
   * Get rate limit status for reporting
   * @param {string} identifier - IP or session identifier
   * @param {string} type - Rate limit type
   * @returns {Promise<Object>} Current rate limit status
   */
  async getRateLimitStatus(identifier, type = 'ip') {
    const result = await this.checkRateLimit(identifier, type);
    
    return {
      identifier,
      type,
      hourlyUsed: result.hourlyCount,
      dailyUsed: result.dailyCount,
      weeklyUsed: result.weeklyCount,
      limits: result.limits,
      allowed: result.allowed,
      resetTimes: result.resetTimes
    };
  }
}

// Global rate limiter instance
export const rateLimiter = new RedisRateLimit();

/**
 * Combined IP and Session rate limiting middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export async function combinedRateLimit(req, res, next) {
  try {
    const clientIP = getClientIP(req);
    const sessionId = req.body.sessionId || req.headers['x-session-id'];

    // Check IP-based rate limit
    const ipResult = await rateLimiter.checkRateLimit(clientIP, 'ip');
    
    // Check session-based rate limit (if session exists)
    let sessionResult = { allowed: true };
    if (sessionId) {
      sessionResult = await rateLimiter.checkRateLimit(sessionId, 'session');
    }

    // Both limits must pass (strictest enforcement)
    const allowed = ipResult.allowed && sessionResult.allowed;

    if (!allowed) {
      // Determine which limit was exceeded
      let limitType = 'unknown';
      let resetTime = null;
      let details = {};

      if (!ipResult.allowed) {
        limitType = 'ip';
        details = {
          ip: clientIP,
          hourlyUsed: ipResult.hourlyCount,
          dailyUsed: ipResult.dailyCount,
          weeklyUsed: ipResult.weeklyCount,
          limits: ipResult.limits
        };
        
        // Find the earliest reset time
        if (ipResult.hourlyCount >= ipResult.limits.hourly) {
          resetTime = ipResult.resetTimes.hourly;
        } else if (ipResult.dailyCount >= ipResult.limits.daily) {
          resetTime = ipResult.resetTimes.daily;
        } else if (ipResult.weeklyCount >= ipResult.limits.weekly) {
          resetTime = ipResult.resetTimes.weekly;
        }
      } else if (!sessionResult.allowed) {
        limitType = 'session';
        details = {
          sessionId,
          hourlyUsed: sessionResult.hourlyCount,
          dailyUsed: sessionResult.dailyCount,
          limits: sessionResult.limits
        };
        
        if (sessionResult.hourlyCount >= sessionResult.limits.hourly) {
          resetTime = sessionResult.resetTimes.hourly;
        } else if (sessionResult.dailyCount >= sessionResult.limits.daily) {
          resetTime = sessionResult.resetTimes.daily;
        }
      }

      return res.status(429).json({
        error: 'Rate limit exceeded',
        limitType,
        details,
        resetTime: resetTime?.toISOString(),
        message: `Rate limit exceeded. Please try again after ${resetTime?.toLocaleTimeString() || 'some time'}.`
      });
    }

    // Store rate limit info in request for later use
    req.rateLimitInfo = {
      clientIP,
      sessionId,
      ipResult,
      sessionResult
    };

    next();
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    // Allow request if rate limiting fails
    next();
  }
}

/**
 * Record successful generation attempt
 * @param {Object} req - Express request object
 */
export async function recordGenerationAttempt(req) {
  try {
    if (req.rateLimitInfo) {
      const { clientIP, sessionId } = req.rateLimitInfo;
      
      // Increment both IP and session counters
      await Promise.all([
        rateLimiter.incrementRateLimit(clientIP, 'ip'),
        sessionId ? rateLimiter.incrementRateLimit(sessionId, 'session') : Promise.resolve()
      ]);
    }
  } catch (error) {
    console.error('Failed to record generation attempt:', error);
  }
}

// Cleanup fallback storage periodically (every 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimiter.fallbackStore.entries()) {
    // Clean up expired entries
    if (data.weekly && data.weekly.length > 0) {
      const hasRecentActivity = data.weekly.some(ts => now - ts < TIME_WINDOWS.WEEK);
      if (!hasRecentActivity) {
        rateLimiter.fallbackStore.delete(key);
      }
    }
  }
}, TIME_WINDOWS.HOUR);

export default rateLimiter;