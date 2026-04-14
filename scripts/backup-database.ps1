# PowerShell script pour sauvegarde PostgreSQL - Barbour
# Usage: .\backup-database.ps1 [-BackupName "nom_du_backup"]

param(
    [string]$BackupName = "barbour_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
)

# Configuration
$DB_USER = "postgres"
$DB_NAME = "barbour"
$DB_HOST = "localhost"
$DB_PORT = "5432"
$BACKUP_DIR = "C:\barbour\backups"
$RETENTION_DAYS = 30

# Création du répertoire de sauvegarde si nécessaire
if (-not (Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force
}

$BACKUP_FILE = "$BACKUP_DIR\$BackupName.sql"
$BACKUP_FILE_GZIP = "$BACKUP_FILE.gz"

Write-Host "=== Démarrage de la sauvegarde ==="
Write-Host "Base de données: $DB_NAME@$DB_HOST`:$DB_PORT"
Write-Host "Fichier de sauvegarde: $BACKUP_FILE_GZIP"

# Export de la base de données
pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME `
  --format=custom `
  --compress=9 `
  --verbose `
  --file=$BACKUP_FILE

# Compression
Compress-Archive -Path $BACKUP_FILE -DestinationPath $BACKUP_FILE_GZIP -Force
Remove-Item $BACKUP_FILE

Write-Host "=== Sauvegarde terminée ==="
Write-Host "Fichier créé: $BACKUP_FILE_GZIP"
Write-Host "Taille: $(Get-Item $BACKUP_FILE_GZIP | Select-Object -ExpandProperty Length) bytes"

# Suppression des anciennes sauvegardes
Write-Host "=== Nettoyage des sauvegardes de plus de $RETENTION_DAYS jours ==="
Get-ChildItem -Path $BACKUP_DIR -Filter "barbour_*.sql.gz" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RETENTION_DAYS) } | 
    Remove-Item -Force

Write-Host "=== Sauvegarde réussie ==="
Write-Host "Fichier: $BACKUP_FILE_GZIP"
