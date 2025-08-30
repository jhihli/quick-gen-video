# TKVGen Production Deployment Guide

This guide covers how to deploy TKVGen to a production server using Docker.

## 🐳 Production Architecture

### Container Setup
- **Frontend**: Nginx + React (built with Vite)
- **Backend**: Node.js + Express + FFmpeg
- **Database**: Redis for sessions and rate limiting

### Required Environment Variables
```env
NODE_ENV=production
BASE_URL=https://your-domain.com
REACT_APP_BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
REDIS_URL=redis://redis:6379
DOCKER_ENV=true
```

## ⚙️ Critical Configuration Requirements

### 1. Nginx Location Priority Fix
**Problem**: Static asset regex overrides `/public/` proxy routes  
**Solution**: Use `^~` prefix match in `Dockerfile.frontend`:

```nginx
# CRITICAL: Use ^~ to override static asset regex matching
location ^~ /public/ {
    proxy_pass http://backend:5003;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 2. Vite Docker Configuration
**File**: `vite.config.js`
```javascript
proxy: {
  '/api': {
    target: process.env.DOCKER_ENV === 'true' ? 'http://backend:5003' : 'http://localhost:5003',
    changeOrigin: true
  },
  '/public': {
    target: process.env.DOCKER_ENV === 'true' ? 'http://backend:5003' : 'http://localhost:5003',
    changeOrigin: true
  }
}
```

### 3. Required Files
- **vite.svg**: Must exist in `/public/` directory (create if missing)
- **Docker Environment**: Set `DOCKER_ENV=true` in docker-compose

## 🚀 Standard Deployment Process

### 1. Server Preparation
```bash
# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Ensure required files exist
ls -la public/vite.svg  # Should exist

# Install Docker and Docker Compose
# (Instructions vary by OS)
```

### 2. Production Deployment
```bash
# Build and start all services
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Verify deployment
docker compose -f docker-compose.prod.yml ps
curl -f http://your-domain.com/api/health
```

### 3. Health Verification
Test these endpoints after deployment:
- **Main App**: `http://your-domain.com`
- **API Health**: `http://your-domain.com/api/health`
- **Favicon**: `http://your-domain.com/vite.svg`
- **Public Files**: `http://your-domain.com/public/local-music/[filename].mp3`

## 🔧 Common Issues & Solutions

### Issue 1: vite.svg 404 Error
**Symptoms**: `GET /vite.svg 404` in browser console  
**Solution**: Create the missing favicon file in `/public/vite.svg`

### Issue 2: Public File 404 Errors  
**Symptoms**: `GET /public/uploads/*.jpg 404`  
**Solutions**:
1. Verify nginx uses `location ^~ /public/` (with `^~` prefix)
2. Ensure backend container is healthy
3. Check container networking between frontend/backend

### Issue 3: API Routing Errors
**Symptoms**: `POST /api/* ERR_ABORTED 500`  
**Solutions**:
1. Set `DOCKER_ENV=true` in docker-compose environment
2. Verify Vite proxy uses container names when `DOCKER_ENV=true`
3. Check backend container health and logs

## 🔍 Debugging Commands

### Container Status
```bash
# Check all containers
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs backend  
docker compose -f docker-compose.prod.yml logs redis
```

### Network Testing
```bash
# Test frontend to backend connectivity
docker compose -f docker-compose.prod.yml exec frontend wget -q -O- http://backend:5003/api/health

# Test backend file serving
docker compose -f docker-compose.prod.yml exec backend curl -I http://localhost:5003/public/local-music/[filename].mp3
```

### File System Verification
```bash
# Check uploads directory in backend
docker compose -f docker-compose.prod.yml exec backend ls -la /app/public/uploads/

# Check static files in frontend
docker compose -f docker-compose.prod.yml exec frontend ls -la /usr/share/nginx/html/
```

## 🔒 HTTPS/SSL Setup (Recommended)

### Option 1: Let's Encrypt (Free)
```bash
# Install certbot
snap install --classic certbot

# Generate certificate for your domain
certbot --nginx -d your-domain.com

# Setup auto-renewal
echo "0 */12 * * * certbot renew --quiet && docker compose -f docker-compose.prod.yml restart frontend" | crontab -
```

### Option 2: Manual Certificate
```bash
# Place your certificates
cp your-certificate.crt ssl/certificate.crt
cp your-private-key.key ssl/private.key
chmod 600 ssl/*

# Restart frontend to load certificates
docker compose -f docker-compose.prod.yml restart frontend
```

## 📋 Pre-Deployment Checklist

Before each deployment:
- [ ] `vite.svg` exists in `/public/` directory
- [ ] Nginx config uses `^~` for `/public/` locations
- [ ] `DOCKER_ENV=true` set in docker-compose environment
- [ ] Vite proxy configured for container networking
- [ ] Environment variables updated for your domain
- [ ] SSL certificates in place (if using HTTPS)

## 🎯 Success Indicators

### ✅ Healthy Deployment
- All containers show "healthy" status
- Main app returns 200 OK
- API health endpoint returns valid JSON
- No 404 errors in browser console
- Public files (uploads, music, favicon) accessible
- Upload functionality works with image previews

### ⚠️ Warning Signs  
- Containers stuck in "starting" status
- 404 errors for static assets
- API endpoints returning 500 errors
- High response times (> 3 seconds)

---

**Note**: This guide contains general deployment instructions. Server-specific details (IP addresses, SSH keys, exact paths) should be kept in separate, private documentation for security.