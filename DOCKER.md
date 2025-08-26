# Docker Setup for TKVGen

TKVGen is fully containerized with Docker support for both development and production environments.

## Quick Start

### Development Environment
```bash
# Start all services (backend, frontend, Redis)
docker-compose up

# Start with build (if code changes)
docker-compose up --build

# Run in background
docker-compose up -d
```

### Production Environment
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# With nginx proxy (optional)
docker-compose -f docker-compose.prod.yml --profile proxy up -d
```

## Architecture

### Services Overview
- **Backend**: Node.js/Express server with FFmpeg support (port 5003)
- **Frontend**: React/Vite application served by nginx (port 3002/80)
- **Redis**: Caching and rate limiting (port 6379)
- **Nginx Proxy**: SSL termination and load balancing (optional)

### File Structure
```
├── Dockerfile.backend          # Backend multi-stage build
├── Dockerfile.frontend         # Frontend multi-stage build  
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── docker-entrypoint.sh        # Container initialization script
└── .dockerignore              # Build context optimization
```

## Development Setup

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- At least 4GB available RAM
- 10GB free disk space

### Environment Variables
Development uses these default values:
- `NODE_ENV=development`
- `BASE_URL=http://localhost:5003`
- `REACT_APP_BASE_URL=http://localhost:5003`
- `REDIS_DISABLED=false`

### Volume Mounts
Development mode mounts source code for hot reload:
- Source code: `.:/app`
- Node modules: `/app/node_modules` (anonymous volume)
- Persistent data: Named volumes for uploads, videos, music

### Commands
```bash
# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Shell into backend container
docker-compose exec backend bash

# Shell into frontend container  
docker-compose exec frontend sh

# Stop all services
docker-compose down

# Remove volumes (clears all data)
docker-compose down -v
```

## Production Setup

### Prerequisites
- Server with Docker and Docker Compose
- Domain name pointing to server IP
- SSL certificates (optional but recommended)

### Environment Configuration
Production uses `wgenv.com` as the domain:
- `NODE_ENV=production`
- `BASE_URL=https://wgenv.com`
- `REACT_APP_BASE_URL=https://wgenv.com`
- `CORS_ORIGIN=https://wgenv.com`
- `FORCE_HTTPS=true`

### SSL Setup (Optional)
1. Place certificates in `./ssl/` directory:
   - `ssl/cert.pem` - SSL certificate
   - `ssl/key.pem` - Private key

2. Update nginx configuration as needed

### Resource Limits
Production containers have resource limits:
- **Backend**: 2GB RAM, 1 CPU core
- **Frontend**: 256MB RAM, 0.5 CPU cores  
- **Redis**: 512MB RAM
- **Nginx**: 128MB RAM, 0.25 CPU cores

### Production Commands
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Update application (rebuild and restart)
docker-compose -f docker-compose.prod.yml up --build -d

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

## Container Details

### Backend Container (Dockerfile.backend)
**Base Image**: `node:18-bullseye` (dev) / `node:18-bullseye-slim` (prod)

**Features**:
- FFmpeg and FFprobe installed
- Multi-stage build (development/production)
- Non-root user in production
- Health checks
- Proper file permissions

**Volumes**:
- `/app/public/uploads` - User uploaded files
- `/app/public/temp-videos` - Generated video files
- `/app/public/videos/temp_clips` - Processing clips
- `/app/public/local-music` - Music library

### Frontend Container (Dockerfile.frontend)
**Base Image**: `node:18-alpine` (build) / `nginx:alpine` (serve)

**Features**:
- Multi-stage build with nginx serving
- Custom nginx configuration
- API proxy to backend
- Static asset caching
- Health checks
- Security headers

**Ports**:
- Development: 3002
- Production: 80, 443

### Redis Container
**Base Image**: `redis:7-alpine`

**Features**:
- Persistent data with AOF
- Memory limits in production
- Health checks
- Optimized for caching workload

## Networking

### Development Network
- Network: `tkvgen-network` (bridge)
- All services can communicate by service name
- Frontend proxies `/api` and `/public` to backend

### Production Network  
- Network: `tkvgen-network` (bridge with custom subnet)
- Internal communication only
- Frontend container handles external traffic

## Persistent Data

### Development Volumes
- `redis_data` - Redis data
- `backend_uploads` - User uploads
- `backend_videos` - Generated videos
- `backend_temp_clips` - Processing clips  
- `backend_music` - Music library

### Production Volumes
All development volumes plus:
- `backend_prod_logs` - Application logs
- `frontend_prod_logs` - Nginx logs

## Troubleshooting

### Common Issues

**1. FFmpeg not working**
```bash
# Check FFmpeg in backend container
docker-compose exec backend ffmpeg -version
docker-compose exec backend ffprobe -version
```

**2. Redis connection issues**
```bash
# Test Redis connectivity
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis
```

**3. Frontend not loading**
```bash
# Check nginx configuration
docker-compose exec frontend nginx -t

# View frontend logs
docker-compose logs frontend
```

**4. File permissions**
```bash
# Fix backend file permissions
docker-compose exec backend chown -R tkvgen:tkvgen /app/public
```

**5. Port conflicts**
```bash
# Check if ports are in use
netstat -tulpn | grep :5003
netstat -tulpn | grep :3002
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Container logs with timestamps
docker-compose logs -t -f

# Disk usage by containers and volumes
docker system df
```

### Cleanup Commands
```bash
# Remove stopped containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a
```

## Security Considerations

### Production Security
- Containers run as non-root users
- `no-new-privileges` security option
- Resource limits prevent DoS
- Internal network communication
- HTTPS enforcement
- Security headers in nginx

### File Security
- Proper file permissions (755 for directories)
- Upload size limits (10MB per file, 10 files max)
- File type validation
- Temporary file cleanup

### Network Security
- Internal Docker network
- Redis not exposed externally in production
- Backend only accessible through frontend proxy
- CORS restrictions in production

## Monitoring and Logging

### Health Checks
All services have health checks:
- **Backend**: `GET /api/health`
- **Frontend**: `GET /`
- **Redis**: `redis-cli ping`

### Log Management
```bash
# Real-time logs from all services
docker-compose logs -f

# Logs from specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Metrics Collection
Consider adding monitoring tools:
- Prometheus for metrics
- Grafana for visualization  
- ELK stack for log aggregation