#!/bin/bash
# Deployment script for Barbour application to production server
# Usage: ./deploy-to-production.sh

set -e

# Configuration
REMOTE_USER="root"
REMOTE_HOST="barbour.unikweb.fr"
REMOTE_DIR="/opt/barbour"
LOCAL_BUILD_DIR=".output"

echo "🚀 Starting deployment to $REMOTE_HOST..."

# 1. Build the application locally
echo "📦 Building application..."
npm run build

# 2. Create deployment package
echo "📦 Creating deployment package..."
tar -czf deployment.tar.gz \
    .output \
    .env \
    package.json \
    prisma/schema.prisma \
    docker-compose.yml \
    Dockerfile \
    ecosystem.config.js \
    scripts/

# 3. Transfer files to server
echo "📤 Transferring files to server..."
scp deployment.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# 4. Execute remote deployment
echo "⚙️  Running remote deployment..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'EOF'
    set -e
    
    cd /opt/barbour
    
    echo "📦 Extracting deployment package..."
    tar -xzf deployment.tar.gz
    rm deployment.tar.gz
    
    echo "🔧 Generating Prisma client..."
    cd .output
    npm run prisma:generate
    
    echo "🔄 Restarting application with PM2..."
    cd ..
    pm2 stop barbour-app || true
    pm2 delete barbour-app || true
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "📊 PM2 status:"
    pm2 status
    
    echo "✅ Deployment completed successfully!"
EOF

# 5. Cleanup
echo "🧹 Cleaning up..."
rm deployment.tar.gz

echo "✅ Deployment completed!"
echo "📊 Monitor with: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs'"
