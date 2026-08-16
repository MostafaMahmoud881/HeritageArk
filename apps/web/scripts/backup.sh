#!/bin/bash
set -e

ENV=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$ENV"
mkdir -p "$BACKUP_DIR"

echo "Backing up $ENV database..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

source "$PROJECT_DIR/apps/web/.env.$ENV" 2>/dev/null || {
  echo "Warning: No .env.$ENV file found. Using DATABASE_URL from environment."
}

pg_dump "$DATABASE_URL" > "$BACKUP_DIR/heritageverse_$TIMESTAMP.sql"

gzip "$BACKUP_DIR/heritageverse_$TIMESTAMP.sql"

find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Backup complete: $BACKUP_DIR/heritageverse_$TIMESTAMP.sql.gz"
