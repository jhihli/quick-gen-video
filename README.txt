# TKVGen - Video Generation Platform

TKVGen is a web-based video editing tool that allows users to upload photos/videos, select music, and create slideshow videos with professional quality output.

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker Desktop 4.0+ installed
- At least 4GB RAM available
- 10GB free disk space
- Windows 10/11 with WSL2 enabled (for Windows users)

### Quick Start - Local Testing

1. **Clone and Navigate**
   ```bash
   cd "D:\Web Projects\tkvgen"
   ```

2. **Start Development Environment**
   ```bash
   # Build and start all services (backend, frontend, Redis)
   docker-compose up --build
   ```

3. **Access Application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:5003/api/health
   - Redis: localhost:6379 (internal)

4. **Test Video Generation**
   - Upload 2-3 test photos
   - Select music from library
   - Generate a test video
   - Download and verify quality

5. **Stop Services**
   ```bash
   docker-compose down
   ```

### 🧪 Testing Checklist

Before deployment, verify these features work:

**✅ File Upload Tests**
- [ ] Upload multiple photos (JPG, PNG)
- [ ] Upload video files (MP4)
- [ ] Test file size limits (max 10MB per file)
- [ ] Test maximum file count (10 files)
- [ ] Verify duplicate detection works

**✅ Music Integration Tests**  
- [ ] Play local music library tracks
- [ ] Upload custom music files
- [ ] Verify music duration detection
- [ ] Test music looping with short tracks

**✅ Video Generation Tests**
- [ ] Single image to video conversion
- [ ] Multiple images slideshow creation
- [ ] Video file with audio replacement
- [ ] Progress tracking during generation
- [ ] Video quality verification (1080x1920)

**✅ Mobile Compatibility Tests**
- [ ] QR code generation for mobile sharing
- [ ] Mobile device video download
- [ ] Touch interface responsiveness
- [ ] Cross-browser compatibility

**✅ System Health Tests**
- [ ] FFmpeg functionality: `docker-compose exec backend ffmpeg -version`
- [ ] Redis connectivity: `docker-compose exec redis redis-cli ping`
- [ ] File permissions: Upload and download work
- [ ] Memory usage under load
- [ ] Cleanup processes working

## 🚀 Production Deployment on PC

### Step 1: Environment Preparation

1. **Install Docker Desktop**
   - Download from https://docker.com/products/docker-desktop
   - Enable WSL2 integration (Windows)
   - Allocate at least 4GB RAM to Docker

2. **Domain Configuration** 
   - Ensure `wgenv.com` points to your server IP
   - Update DNS A record: `wgenv.com -> YOUR_SERVER_IP`
   - Verify with: `nslookup wgenv.com`

3. **Firewall Configuration**
   ```bash
   # Windows Firewall - Allow Docker ports
   netsh advfirewall firewall add rule name="TKVGen-HTTP" dir=in action=allow protocol=TCP localport=80
   netsh advfirewall firewall add rule name="TKVGen-HTTPS" dir=in action=allow protocol=TCP localport=443
   netsh advfirewall firewall add rule name="TKVGen-Backend" dir=in action=allow protocol=TCP localport=5003
   ```

### Step 2: SSL Certificate Setup (Optional but Recommended)

1. **Create SSL Directory**
   ```bash
   mkdir ssl
   ```

2. **Option A: Self-Signed Certificate (Testing)**
   ```bash
   # Generate self-signed certificate
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -subj "/CN=wgenv.com"
   ```

3. **Option B: Let's Encrypt (Production)**
   ```bash
   # Install certbot and generate certificate
   # Follow Let's Encrypt documentation for your OS
   ```

### Step 3: Production Deployment

1. **Create Production Environment File**
   ```bash
   # Copy production environment template
   cp .env.production .env.prod.local
   
   # Verify configuration
   cat .env.prod.local
   ```

2. **Deploy Production Stack**
   ```bash
   # Start production environment
   docker-compose -f docker-compose.prod.yml up -d
   
   # With nginx proxy (if using SSL)
   docker-compose -f docker-compose.prod.yml --profile proxy up -d
   ```

3. **Verify Deployment**
   ```bash
   # Check all services are running
   docker-compose -f docker-compose.prod.yml ps
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Test health endpoints
   curl -f http://localhost:5003/api/health
   curl -f http://localhost/
   ```

4. **Test Production Features**
   - Access: https://wgenv.com (or http://YOUR_IP)
   - Upload test files
   - Generate test video
   - Verify QR code sharing works
   - Check mobile compatibility

### Step 4: Post-Deployment Monitoring

1. **Resource Monitoring**
   ```bash
   # Monitor container resources
   docker stats
   
   # Check disk usage
   docker system df
   
   # Monitor logs
   docker-compose -f docker-compose.prod.yml logs -f --tail=100
   ```

2. **Performance Tuning**
   - Monitor memory usage during video generation
   - Check CPU usage during peak loads
   - Verify Redis cache hit rates
   - Monitor disk space for uploads/videos

## 🔧 Pre-Deployment Checklist

### ✅ System Requirements
- [ ] Docker Desktop 4.0+ installed and running
- [ ] Windows 10/11 with WSL2 enabled
- [ ] Minimum 4GB RAM allocated to Docker
- [ ] 10GB+ free disk space
- [ ] Firewall ports 80, 443, 5003 open
- [ ] Domain DNS configured (wgenv.com -> server IP)

### ✅ Configuration Verification
- [ ] `.env.production` file configured correctly
- [ ] `BASE_URL=https://wgenv.com` set properly
- [ ] SSL certificates in place (if using HTTPS)
- [ ] Docker Compose files validated
- [ ] File permissions correct for uploads directory

### ✅ Security Checks
- [ ] Production containers run as non-root users
- [ ] CORS origins restricted to domain
- [ ] File upload limits configured (10MB/file, 10 files max)
- [ ] Redis not exposed externally
- [ ] Security headers configured in nginx
- [ ] HTTPS enforcement enabled (if SSL configured)

### ✅ Backup Strategy
- [ ] Regular backup of Docker volumes
- [ ] Database/Redis backup procedures
- [ ] Application code backup
- [ ] SSL certificate backup
- [ ] Configuration files backup

## 🐛 Common Issues & Solutions

### Issue: Docker Desktop Not Starting
**Solution:**
```bash
# Restart Docker Desktop
# Check WSL2 integration in Docker Desktop settings
# Ensure Windows features are enabled:
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### Issue: Port Already in Use
**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :5003
netstat -ano | findstr :3002

# Kill the process or change ports in docker-compose.yml
```

### Issue: FFmpeg Not Working
**Solution:**
```bash
# Check FFmpeg in container
docker-compose exec backend ffmpeg -version

# If missing, rebuild containers
docker-compose build --no-cache backend
```

### Issue: File Upload Failing
**Solution:**
```bash
# Check directory permissions
docker-compose exec backend ls -la public/

# Fix permissions
docker-compose exec backend chown -R tkvgen:tkvgen public/
```

### Issue: Redis Connection Failed
**Solution:**
```bash
# Test Redis
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis

# Restart Redis service
docker-compose restart redis
```

### Issue: High Memory Usage
**Solution:**
```bash
# Monitor container memory
docker stats

# Adjust resource limits in docker-compose.prod.yml
# Clean up temporary files
docker-compose exec backend find public/temp-videos -name "*.mp4" -mtime +1 -delete
```

## 🔄 Maintenance Commands

### Regular Maintenance
```bash
# Update containers
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Clean up Docker system
docker system prune -a

# Backup volumes
docker run --rm -v tkvgen_backend_prod_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# View application logs
docker-compose -f docker-compose.prod.yml logs -f --tail=50
```

### Emergency Recovery
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart with fresh containers
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# If data corruption, restore from backup
docker run --rm -v tkvgen_backend_prod_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

## 📞 Support

For technical support:
1. Check logs: `docker-compose logs -f`
2. Verify system resources: `docker stats`
3. Check service health: Visit `/api/health` endpoint
4. Review DOCKER.md for detailed troubleshooting

## 📚 Additional Resources

- **DOCKER.md** - Comprehensive Docker documentation
- **CLAUDE.md** - Development guidelines and architecture
- **.env.example** - Environment configuration template
- **docker-compose.yml** - Development environment
- **docker-compose.prod.yml** - Production environment