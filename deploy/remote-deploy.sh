#!/bin/bash
# Remote deployment script for SSH execution
# This script is called by the local deployment script

set -e

REMOTE_DIR="/opt/barbour"
BACKUP_DIR="/opt/barbour/backups"

echo "🔧 Running remote deployment..."

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Stop existing containers
echo "🛑 Stopping existing containers..."
cd ${REMOTE_DIR}
if [ -f docker-compose.prod.yml ]; then
    docker-compose -f docker-compose.prod.yml down || true
fi

# Extract new deployment
echo "📦 Extracting deployment package..."
tar -xzf deployment.tar.gz
rm deployment.tar.gz

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd .output
npm run prisma:generate

# Start new containers
echo "🚀 Starting containers..."
cd ${REMOTE_DIR}
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
echo "📊 Running database migrations..."
docker exec barbour-app npx prisma migrate deploy

# Seed database if needed
echo "🌱 Seeding database..."
docker exec barbour-app npm run db:seed

# Cleanup
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Remote deployment completed!"
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps
