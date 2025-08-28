# TKVGen Docker Development Setup

## Prerequisites
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop application
3. Ensure Docker daemon is running

## Quick Start Commands

### Build and Start All Services
```bash
# Build all containers
docker compose build

# Start complete development environment
docker compose up -d

# View all running containers
docker compose ps
```

### Individual Service Management
```bash
# Start Redis only
docker compose up redis -d

# Start Backend only
docker compose up backend -d

# Start Frontend only  
docker compose up frontend -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f redis
```

## Development Environment Access
- **Frontend**: http://localhost:3002 (React + Vite dev server)
- **Backend API**: http://localhost:5003 (Express + FFmpeg)
- **Redis**: localhost:6379

## Container Architecture

### Frontend Container
- **Base**: Node.js 18 Alpine
- **Development**: Vite dev server with hot reload
- **Port**: 3002
- **Volumes**: Source code mounted for live editing

### Backend Container  
- **Base**: Node.js 18 Bullseye (includes FFmpeg)
- **Development**: Nodemon with auto-restart
- **Port**: 5003
- **Volumes**: 
  - Source code for live editing
  - Persistent uploads, videos, temp files
  - Local music library

### Redis Container
- **Base**: Redis 7 Alpine
- **Port**: 6379  
- **Features**: Data persistence, health checks
- **Volume**: Persistent Redis data

## Development Workflow

### 1. Initial Setup
```bash
# Clone and navigate to project
cd "D:\Web Projects\tkvgen"

# Build all containers
docker compose build
```

### 2. Start Development Environment
```bash
# Start all services in background
docker compose up -d

# Check service status
docker compose ps
```

### 3. Development Commands
```bash
# View real-time logs
docker compose logs -f

# Restart a service after changes
docker compose restart backend

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

### 4. Debugging
```bash
# Execute commands in running containers
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec redis redis-cli

# View container resource usage
docker stats
```

## Environment Variables
The docker-compose.yml includes all necessary environment variables:
- `NODE_ENV=development`
- `REDIS_URL=redis://redis:6379`
- `VITE_API_URL=http://localhost:5003`
- FFmpeg and video processing settings

## File Structure
```
├── Dockerfile.frontend     # Frontend container definition
├── Dockerfile.backend      # Backend container definition  
├── docker-compose.yml      # Development orchestration
├── docker-compose.prod.yml # Production configuration
└── docker-entrypoint.sh    # Container startup script
```

## Production Deployment

### Production Setup
The production environment uses:
- **Nginx** for serving static files and API proxying
- **Resource limits** and security constraints
- **SSL/HTTPS** support with certificate mounting
- **Optimized Redis** configuration with memory limits

### Quick Production Start
```bash
# Build and start production environment
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Check production status
docker compose -f docker-compose.prod.yml ps

# View production logs
docker compose -f docker-compose.prod.yml logs -f
```

### Production Environment Variables
Key production settings in `docker-compose.prod.yml`:
- `BASE_URL=https://wgenv.com` - Your production domain
- `CORS_ORIGIN=https://wgenv.com` - CORS configuration
- `FORCE_HTTPS=true` - Redirect HTTP to HTTPS
- `REDIS_URL=redis://redis:6379` - Redis connection

### Production Features
- **Resource Limits**: Memory and CPU constraints
- **Security**: No new privileges, SSL termination
- **Persistence**: Separate production data volumes
- **Health Checks**: All services monitored
- **Logging**: Centralized log collection

### SSL Certificate Setup
For HTTPS support, place your certificates in:
```bash
./ssl/certificate.crt
./ssl/private.key
```

### Optional Nginx Proxy
For advanced load balancing, enable the proxy profile:
```bash
docker compose -f docker-compose.prod.yml --profile proxy up -d
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3002, 5003, 6379 are available
2. **Docker daemon not running**: Start Docker Desktop
3. **Volume permissions**: On Windows, ensure drive sharing is enabled

### Useful Commands
```bash
# Clean up unused containers/images
docker system prune -a

# View detailed container information
docker compose config

# Force rebuild containers
docker compose build --no-cache
```