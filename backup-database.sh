#!/bin/bash
# Database backup script for Barbour

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/barbour_backup_${TIMESTAMP}.sql"

echo "Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform backup
pg_dump -U postgres -h localhost barbour > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully: ${BACKUP_FILE}"
    
    # Keep only last 7 days of backups
    find ${BACKUP_DIR} -name "barbour_backup_*.sql" -mtime +7 -delete
    echo "🧹 Cleaned up old backups"
else
    echo "❌ Backup failed!"
    exit 1
fi
