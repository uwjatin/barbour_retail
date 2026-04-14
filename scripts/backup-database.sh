#!/bin/bash
# Script de sauvegarde de la base de données PostgreSQL pour Barbour
# Usage: ./backup-database.sh [nom_du_backup]

set -e

# Configuration
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-barbour}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/opt/barbour/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${1:-barbour_${TIMESTAMP}}"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql"
BACKUP_FILE_GZIP="${BACKUP_FILE}.gz"

# Création du répertoire de sauvegarde si nécessaire
mkdir -p "${BACKUP_DIR}"

echo "=== Démarrage de la sauvegarde ==="
echo "Base de données: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo "Fichier de sauvegarde: ${BACKUP_FILE_GZIP}"

# Export de la base de données
pg_dump -U "${DB_USER}" -h "${DB_HOST}" -p "${DB_PORT}" -d "${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="${BACKUP_FILE}"

# Compression
gzip -f "${BACKUP_FILE}"

echo "=== Sauvegarde terminée ==="
echo "Fichier créé: ${BACKUP_FILE_GZIP}"
echo "Taille: $(du -h "${BACKUP_FILE_GZIP}" | cut -f1)"

# Suppression des anciennes sauvegardes
echo "=== Nettoyage des sauvegardes de plus de ${RETENTION_DAYS} jours ==="
find "${BACKUP_DIR}" -name "barbour_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "=== Sauvegarde réussie ==="
echo "Fichier: ${BACKUP_FILE_GZIP}"
