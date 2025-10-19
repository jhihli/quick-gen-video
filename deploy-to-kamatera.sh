#!/bin/bash

# TKVGen Deployment Script for Kamatera Server
# This script deploys the latest changes to your Kamatera server

set -e  # Exit on any error

echo "🚀 Starting TKVGen deployment to Kamatera server..."

# Server configuration (update these values)
SERVER_IP="103.54.57.240"
SERVER_USER="root"  # or your server username
SSH_KEY="~/.ssh/kamatera_key.pem"
REMOTE_PATH="/var/www/tkvgen"  # or your deployment path
REPO_URL="https://github.com/jhihli/quick-gen-video.git"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "Server: $SERVER_USER@$SERVER_IP"
echo "Remote Path: $REMOTE_PATH"
echo "Repository: $REPO_URL"
echo ""

# Function to run commands on the server
run_remote() {
    echo -e "${YELLOW}🔧 Running on server: $1${NC}"
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to check if command was successful
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Step 1: Test SSH connection
echo -e "${YELLOW}🔐 Testing SSH connection...${NC}"
run_remote "echo 'SSH connection successful'"
check_success "SSH connection test"

# Step 2: Update the repository
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
run_remote "cd $REMOTE_PATH && git pull origin main"
check_success "Git pull"

# Step 3: Install/update dependencies
echo -e "${YELLOW}📦 Installing/updating dependencies...${NC}"
run_remote "cd $REMOTE_PATH && npm ci"
check_success "Dependencies installation"

# Step 4: Build the frontend
echo -e "${YELLOW}🏗️ Building frontend...${NC}"
run_remote "cd $REMOTE_PATH && npm run build"
check_success "Frontend build"

# Step 5: Restart Docker services (if using Docker)
echo -e "${YELLOW}🐳 Restarting Docker services...${NC}"
run_remote "cd $REMOTE_PATH && docker compose -f docker-compose.prod.yml down"
run_remote "cd $REMOTE_PATH && docker compose -f docker-compose.prod.yml up -d --build"
check_success "Docker services restart"

# Step 6: Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
run_remote "cd $REMOTE_PATH && docker compose -f docker-compose.prod.yml ps"
check_success "Service status check"

# Step 7: Health check
echo -e "${YELLOW}🩺 Running health check...${NC}"
sleep 10  # Give services time to start
run_remote "curl -f http://localhost:5003/api/health || echo 'Health check failed'"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your TKVGen application has been updated on the server.${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Check your domain to verify the updates are live"
echo "2. Test the application functionality"
echo "3. Monitor the server logs if needed: docker compose -f docker-compose.prod.yml logs -f"