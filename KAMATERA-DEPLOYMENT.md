# TKVGen Deployment to Kamatera (qwimgenv.com)

## Server Information
- **Domain**: qwimgenv.com
- **Server IP**: 103.54.57.240
- **Cloud Provider**: Kamatera
- **DNS Record**: Already configured (A record pointing to 103.54.57.240)

---

## Pre-Deployment Checklist

### 1. Local Preparation
- [ ] All code changes committed to GitHub repository
- [ ] Domain qwimgenv.com DNS configured (✅ Already done)
- [ ] SSH key generated for Kamatera server access

### 2. Server Requirements
- [ ] Ubuntu 20.04 or 22.04 LTS
- [ ] Minimum 2GB RAM, 2 CPU cores
- [ ] 20GB+ storage
- [ ] Root or sudo access

---

## Step 1: Initial Server Setup

### 1.1 Connect to Your Server
```bash
# Connect via SSH (replace with your SSH key path if different)
ssh root@103.54.57.240
```

### 1.2 Update System Packages
```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
```

### 1.4 Install Docker Compose
```bash
# Download Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 1.5 Install Git
```bash
apt install git -y
git --version
```

---

## Step 2: Clone Your Repository

```bash
# Create application directory
mkdir -p /var/www
cd /var/www

# Clone the repository
git clone https://github.com/jhihli/quick-gen-video.git tkvgen
cd tkvgen

# Verify files
ls -la
```

---

## Step 3: SSL Certificate Setup (IMPORTANT)

You have two options for SSL:

### Option A: Let's Encrypt (Recommended - Free & Auto-Renewing)

```bash
# Install Certbot
apt install certbot -y

# Stop any running web servers temporarily
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Generate certificate (use standalone mode since nginx isn't running yet)
certbot certonly --standalone -d qwimgenv.com -d www.qwimgenv.com

# Certificates will be created at:
# /etc/letsencrypt/live/qwimgenv.com/fullchain.pem
# /etc/letsencrypt/live/qwimgenv.com/privkey.pem

# Create SSL directory for Docker
mkdir -p /var/www/tkvgen/ssl

# Copy certificates to project directory
cp /etc/letsencrypt/live/qwimgenv.com/fullchain.pem /var/www/tkvgen/ssl/certificate.crt
cp /etc/letsencrypt/live/qwimgenv.com/privkey.pem /var/www/tkvgen/ssl/private.key

# Set proper permissions
chmod 644 /var/www/tkvgen/ssl/certificate.crt
chmod 600 /var/www/tkvgen/ssl/private.key

# Setup auto-renewal (runs twice daily)
echo "0 0,12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/qwimgenv.com/fullchain.pem /var/www/tkvgen/ssl/certificate.crt && cp /etc/letsencrypt/live/qwimgenv.com/privkey.pem /var/www/tkvgen/ssl/private.key && docker-compose -f /var/www/tkvgen/docker-compose.prod.yml restart frontend" | crontab -
```

### Option B: Self-Signed Certificate (Testing Only)

**⚠️ WARNING: Self-signed certificates will show browser warnings. Only use for testing!**

```bash
# Create SSL directory
mkdir -p /var/www/tkvgen/ssl
cd /var/www/tkvgen/ssl

# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout private.key \
  -out certificate.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=qwimgenv.com"

# Set proper permissions
chmod 644 certificate.crt
chmod 600 private.key
```

---

## Step 4: Configure Environment Variables

```bash
cd /var/www/tkvgen

# The .env.production file is already configured with qwimgenv.com
# Verify the settings:
cat .env.production

# You should see:
# BASE_URL=https://qwimgenv.com
# REACT_APP_BASE_URL=https://qwimgenv.com
# CORS_ORIGIN=https://qwimgenv.com
```

---

## Step 5: Build and Deploy

```bash
cd /var/www/tkvgen

# Build and start all services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# This will start:
# - Redis (caching and rate limiting)
# - Backend (Node.js + Express + FFmpeg)
# - Frontend (Nginx + React)
```

---

## Step 6: Verify Deployment

### 6.1 Check Container Status
```bash
docker-compose -f docker-compose.prod.yml ps

# You should see all 3 containers running (healthy status):
# - tkvgen-redis-prod
# - tkvgen-backend-prod
# - tkvgen-frontend-prod
```

### 6.2 Check Container Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View specific service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs redis

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f
```

### 6.3 Test Endpoints
```bash
# Test backend health (from server)
curl http://localhost:5003/api/health

# Test frontend (from server)
curl -I http://localhost/

# Test from your local machine
# Open browser and visit: https://qwimgenv.com
```

---

## Step 7: Configure Firewall

```bash
# Allow HTTP and HTTPS traffic
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

---

## Step 8: Test Your Application

1. **Open your browser**: Navigate to `https://qwimgenv.com`
2. **Upload Photos**: Test the photo upload functionality
3. **Add Music**: Select or upload music
4. **Generate Video**: Create a test video
5. **QR Code**: Test QR code generation and mobile download
6. **Mobile Test**: Scan QR code from mobile device and download video

---

## Common Commands

### View Logs
```bash
cd /var/www/tkvgen
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
cd /var/www/tkvgen
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services
```bash
cd /var/www/tkvgen
docker-compose -f docker-compose.prod.yml down
```

### Update Deployment (After Code Changes)
```bash
cd /var/www/tkvgen
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### View Container Resource Usage
```bash
docker stats
```

### Clean Up Old Images and Containers
```bash
docker system prune -a
```

---

## Monitoring and Maintenance

### 1. Check Disk Space
```bash
df -h
# Clean up if needed:
docker system prune -a
```

### 2. Monitor Container Health
```bash
watch -n 5 'docker-compose -f /var/www/tkvgen/docker-compose.prod.yml ps'
```

### 3. View Resource Usage
```bash
docker stats
```

### 4. Backup Important Data
```bash
# Backup volumes
docker run --rm -v tkvgen_backend_prod_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz /data

docker run --rm -v tkvgen_backend_prod_videos:/data -v $(pwd):/backup \
  alpine tar czf /backup/videos-backup-$(date +%Y%m%d).tar.gz /data
```

---

## Troubleshooting

### Issue: Containers won't start
```bash
# Check logs for errors
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Rebuild containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Issue: SSL certificate errors
```bash
# Verify certificate files exist
ls -la /var/www/tkvgen/ssl/

# Check certificate expiration
openssl x509 -in /var/www/tkvgen/ssl/certificate.crt -noout -dates

# Renew Let's Encrypt certificate
certbot renew --force-renewal
cp /etc/letsencrypt/live/qwimgenv.com/fullchain.pem /var/www/tkvgen/ssl/certificate.crt
cp /etc/letsencrypt/live/qwimgenv.com/privkey.pem /var/www/tkvgen/ssl/private.key
docker-compose -f docker-compose.prod.yml restart frontend
```

### Issue: Backend can't generate videos
```bash
# Check FFmpeg is installed in container
docker-compose -f docker-compose.prod.yml exec backend ffmpeg -version

# Check file permissions
docker-compose -f docker-compose.prod.yml exec backend ls -la /app/public/

# Check available disk space
docker-compose -f docker-compose.prod.yml exec backend df -h
```

### Issue: High memory usage
```bash
# Check container stats
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Clean up temp files
docker-compose -f docker-compose.prod.yml exec backend find /app/public/temp-videos -type f -mtime +1 -delete
```

---

## Automated Deployment Script

For future updates, you can use the deployment script:

```bash
# From your local machine (make sure you have SSH key setup)
cd /path/to/tkvgen
chmod +x deploy-to-kamatera.sh
./deploy-to-kamatera.sh
```

The script will:
1. Connect to your server via SSH
2. Pull latest code from GitHub
3. Rebuild and restart Docker containers
4. Verify deployment health

---

## Security Recommendations

1. **Change default SSH port** (optional but recommended)
2. **Setup SSH key-only authentication** (disable password login)
3. **Enable automatic security updates**
4. **Configure fail2ban** to prevent brute force attacks
5. **Regular backups** of volumes and database
6. **Monitor logs** for suspicious activity
7. **Keep Docker and system packages updated**

---

## Support

If you encounter issues:

1. Check container logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify all containers are healthy: `docker-compose -f docker-compose.prod.yml ps`
3. Check disk space: `df -h`
4. Review this deployment guide
5. Check GitHub repository for updates

---

## Next Steps After Successful Deployment

1. ✅ Test all functionality (upload, music, video generation)
2. ✅ Setup monitoring and alerts
3. ✅ Configure regular backups
4. ✅ Document any custom configurations
5. ✅ Setup analytics (if desired)
6. ✅ Configure CDN (optional, for better performance)
7. ✅ Setup uptime monitoring (e.g., UptimeRobot, Pingdom)

---

**Deployment Date**: _[Fill in after deployment]_
**Last Updated**: _[Fill in after updates]_
**Deployed By**: _[Your name]_
