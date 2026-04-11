#!/usr/bin/env bash
# Daily backup: PostgreSQL dump + Redis snapshot
# Usage: bash scripts/backup.sh
# Retention: 14 days

set -euo pipefail

BACKUP_DIR="/root/docmost/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# PostgreSQL full dump (data + schema)
PG_FILE="$BACKUP_DIR/docmost_pg_${TIMESTAMP}.sql.gz"
docker exec docmost-db-1 pg_dump -U docmost -d docmost \
  --no-owner --no-privileges \
  | gzip > "$PG_FILE"
PG_SIZE=$(du -h "$PG_FILE" | cut -f1)
echo "  PostgreSQL: $PG_FILE ($PG_SIZE)"

# Redis AOF snapshot
REDIS_FILE="$BACKUP_DIR/docmost_redis_${TIMESTAMP}.rdb"
docker exec docmost-redis-1 redis-cli BGSAVE > /dev/null 2>&1
sleep 2
docker cp docmost-redis-1:/data/dump.rdb "$REDIS_FILE" 2>/dev/null || true
if [ -f "$REDIS_FILE" ]; then
  REDIS_SIZE=$(du -h "$REDIS_FILE" | cut -f1)
  echo "  Redis: $REDIS_FILE ($REDIS_SIZE)"
else
  echo "  Redis: skipped (no dump.rdb)"
fi

# Cleanup old backups
DELETED=$(find "$BACKUP_DIR" -name "docmost_*" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "  Cleaned up: $DELETED old files"

echo "[$(date)] Backup complete."
