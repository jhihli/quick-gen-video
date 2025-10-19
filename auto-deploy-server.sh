#!/bin/bash

#############################################
# TKVGen Automated Server Setup Script
# Domain: qwimgenv.com
# Server: 103.54.57.240
#############################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="qwimgenv.com"
EMAIL="your-email@example.com"  # CHANGE THIS TO YOUR EMAIL

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   TKVGen Automated Deployment Script                  ║${NC}"
echo -e "${BLUE}║   Domain: qwimgenv.com                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

#############################################
# Step 1: Update System
#############################################
echo -e "${YELLOW}[1/9] Updating system packages...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

#############################################
# Step 2: Install Docker
#############################################
echo -e "${YELLOW}[2/9] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi
docker --version
echo ""

#############################################
# Step 3: Install Docker Compose
#############################################
echo -e "${YELLOW}[3/9] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi
docker-compose --version
echo ""

#############################################
# Step 4: Install Git and other tools
#############################################
echo -e "${YELLOW}[4/9] Installing Git and essential tools...${NC}"
apt install -y git curl ufw certbot
echo -e "${GREEN}✓ Essential tools installed${NC}"
echo ""

#############################################
# Step 5: Clone Repository
#############################################
echo -e "${YELLOW}[5/9] Cloning repository...${NC}"
mkdir -p /var/www
cd /var/www

if [ -d "tkvgen" ]; then
    echo -e "${YELLOW}Repository already exists. Updating...${NC}"
    cd tkvgen
    git pull origin main
else
    git clone https://github.com/jhihli/quick-gen-video.git tkvgen
    cd tkvgen
fi
echo -e "${GREEN}✓ Repository ready${NC}"
echo ""

#############################################
# Step 6: Setup SSL Certificates
#############################################
echo -e "${YELLOW}[6/9] Setting up SSL certificates...${NC}"

if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${GREEN}✓ SSL certificates already exist${NC}"
else
    echo -e "${YELLOW}Obtaining SSL certificate from Let's Encrypt...${NC}"
    echo -e "${YELLOW}You will be prompted for your email address${NC}"

    # Stop any running containers that might use port 80/443
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Get certificate (only for main domain, not www)
    certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email $EMAIL || {
        echo -e "${RED}✗ SSL certificate generation failed${NC}"
        echo -e "${YELLOW}Please run this manually:${NC}"
        echo -e "${YELLOW}certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ SSL certificate obtained${NC}"
fi

# Copy certificates to project
mkdir -p /var/www/tkvgen/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /var/www/tkvgen/ssl/certificate.crt
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /var/www/tkvgen/ssl/private.key
chmod 644 /var/www/tkvgen/ssl/certificate.crt
chmod 600 /var/www/tkvgen/ssl/private.key
echo -e "${GREEN}✓ SSL certificates copied to project${NC}"
echo ""

#############################################
# Step 7: Setup Firewall
#############################################
echo -e "${YELLOW}[7/9] Configuring firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

#############################################
# Step 8: Deploy Application
#############################################
echo -e "${YELLOW}[8/9] Building and deploying application...${NC}"
cd /var/www/tkvgen

echo -e "${YELLOW}Building Docker images (this may take 5-10 minutes)...${NC}"
docker-compose -f docker-compose.prod.yml build

echo -e "${YELLOW}Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✓ Application deployed${NC}"
echo ""

#############################################
# Step 9: Setup Auto-renewal for SSL
#############################################
echo -e "${YELLOW}[9/9] Setting up SSL auto-renewal...${NC}"
CRON_CMD="0 0,12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /var/www/tkvgen/ssl/certificate.crt && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /var/www/tkvgen/ssl/private.key && docker-compose -f /var/www/tkvgen/docker-compose.prod.yml restart frontend"

# Check if cron job already exists
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -
echo -e "${GREEN}✓ SSL auto-renewal configured${NC}"
echo ""

#############################################
# Verification
#############################################
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Deployment Complete! Verifying...                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

sleep 5  # Give containers time to start

echo -e "${YELLOW}Container Status:${NC}"
docker-compose -f /var/www/tkvgen/docker-compose.prod.yml ps
echo ""

echo -e "${YELLOW}Testing backend health...${NC}"
sleep 5
if curl -f http://localhost:5003/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    docker-compose -f /var/www/tkvgen/docker-compose.prod.yml logs backend | tail -20
fi
echo ""

#############################################
# Summary
#############################################
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  DEPLOYMENT SUMMARY                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ System updated${NC}"
echo -e "${GREEN}✓ Docker and Docker Compose installed${NC}"
echo -e "${GREEN}✓ Repository cloned${NC}"
echo -e "${GREEN}✓ SSL certificates configured${NC}"
echo -e "${GREEN}✓ Firewall configured${NC}"
echo -e "${GREEN}✓ Application deployed${NC}"
echo ""
echo -e "${BLUE}Your application is now running at:${NC}"
echo -e "${GREEN}🌐 https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View logs:     ${BLUE}docker-compose -f /var/www/tkvgen/docker-compose.prod.yml logs -f${NC}"
echo -e "  Restart:       ${BLUE}docker-compose -f /var/www/tkvgen/docker-compose.prod.yml restart${NC}"
echo -e "  Stop:          ${BLUE}docker-compose -f /var/www/tkvgen/docker-compose.prod.yml down${NC}"
echo -e "  Status:        ${BLUE}docker-compose -f /var/www/tkvgen/docker-compose.prod.yml ps${NC}"
echo ""
echo -e "${GREEN}🎉 Deployment successful! Test your site at https://$DOMAIN${NC}"
echo ""
