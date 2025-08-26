#!/bin/bash
set -e

# TKVGen Docker Container Initialization Script
# This script handles container startup, directory setup, and health checks

echo "🚀 Starting TKVGen container initialization..."

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a service is available
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1

    log "Waiting for $service_name to be available at $host:$port..."
    
    while ! nc -z "$host" "$port" > /dev/null 2>&1; do
        if [ $attempt -eq $max_attempts ]; then
            log "❌ $service_name is not available after $max_attempts attempts"
            return 1
        fi
        
        log "Attempt $attempt/$max_attempts: $service_name not ready, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "✅ $service_name is available"
    return 0
}

# Create necessary directories
log "📁 Creating application directories..."
mkdir -p public/uploads
mkdir -p public/temp-videos  
mkdir -p public/videos/temp_clips/preprocessed
mkdir -p public/local-music
mkdir -p logs

# Set proper permissions
log "🔒 Setting directory permissions..."
chmod 755 public/uploads
chmod 755 public/temp-videos
chmod 755 public/videos/temp_clips
chmod 755 public/videos/temp_clips/preprocessed
chmod 755 public/local-music
chmod 755 logs

# Verify FFmpeg installation
log "🎬 Verifying FFmpeg installation..."
if command -v ffmpeg >/dev/null 2>&1; then
    FFMPEG_VERSION=$(ffmpeg -version 2>/dev/null | head -n 1)
    log "✅ FFmpeg found: $FFMPEG_VERSION"
else
    log "❌ FFmpeg not found - video processing will fail"
    exit 1
fi

if command -v ffprobe >/dev/null 2>&1; then
    FFPROBE_VERSION=$(ffprobe -version 2>/dev/null | head -n 1)
    log "✅ FFprobe found: $FFPROBE_VERSION"
else
    log "❌ FFprobe not found - video processing will fail" 
    exit 1
fi

# Check Node.js version
log "🟢 Verifying Node.js installation..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    log "✅ Node.js found: $NODE_VERSION"
    
    # Verify Node.js version meets requirements (>=18.0.0)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d 'v' -f2 | cut -d '.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        log "❌ Node.js version $NODE_VERSION is below required minimum (18.0.0)"
        exit 1
    fi
else
    log "❌ Node.js not found"
    exit 1
fi

# Wait for Redis if not disabled
if [ "$REDIS_DISABLED" != "true" ] && [ -n "$REDIS_URL" ]; then
    log "🔄 Redis is enabled, checking connectivity..."
    
    # Extract host and port from Redis URL
    REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's|redis://\([^:]*\):\([0-9]*\)|\1|p')
    REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's|redis://\([^:]*\):\([0-9]*\)|\2|p')
    
    if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
        wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis"
        
        # Test Redis connectivity
        if command -v redis-cli >/dev/null 2>&1; then
            if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
                log "✅ Redis connectivity test passed"
            else
                log "⚠️ Redis connectivity test failed, but continuing..."
            fi
        else
            log "⚠️ redis-cli not available for testing connectivity"
        fi
    else
        log "⚠️ Could not parse Redis URL: $REDIS_URL"
    fi
else
    log "⚠️ Redis is disabled or not configured"
fi

# Initialize local music library if it doesn't exist
log "🎵 Checking local music library..."
if [ ! -f "public/local-music/Dynamic-Motivating.mp3" ]; then
    log "⚠️ Local music library appears to be empty"
    log "📝 Note: Music files should be mounted as a volume or copied during build"
else
    MUSIC_COUNT=$(find public/local-music -name "*.mp3" -type f 2>/dev/null | wc -l)
    log "✅ Found $MUSIC_COUNT music files in local library"
fi

# Set up cleanup handling for graceful shutdown
cleanup() {
    log "🛑 Received shutdown signal, cleaning up..."
    
    # Kill any running FFmpeg processes
    if pgrep ffmpeg > /dev/null; then
        log "Stopping running FFmpeg processes..."
        pkill -TERM ffmpeg
        sleep 2
        if pgrep ffmpeg > /dev/null; then
            pkill -KILL ffmpeg
        fi
    fi
    
    # Clean up temporary files (but preserve uploads)
    if [ -d "public/videos/temp_clips" ]; then
        log "Cleaning up temporary video clips..."
        find public/videos/temp_clips -name "*.mp4" -mmin +60 -delete 2>/dev/null || true
    fi
    
    log "✅ Cleanup completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Environment validation
log "🔍 Validating environment configuration..."

# Required environment variables
REQUIRED_VARS=("NODE_ENV" "PORT")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log "❌ Required environment variable $var is not set"
        exit 1
    else
        log "✅ $var is set"
    fi
done

# Validate PORT
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    log "❌ PORT must be a valid port number (1-65535)"
    exit 1
fi

# Log configuration summary
log "📋 Configuration Summary:"
log "   Environment: $NODE_ENV"
log "   Port: $PORT"
log "   Base URL: ${BASE_URL:-'Not set'}"
log "   Redis: ${REDIS_DISABLED:+'Disabled'}${REDIS_URL:+$REDIS_URL}"
log "   CORS Origin: ${CORS_ORIGIN:-'Not set'}"
log "   Max File Size: ${MAX_FILE_SIZE:-'Not set'}"
log "   Max Files: ${MAX_FILES_COUNT:-'Not set'}"

log "✅ Container initialization completed successfully"

# Execute the main command
log "🎯 Starting application: $@"
exec "$@"