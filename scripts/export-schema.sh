#!/usr/bin/env bash
# Export current PostgreSQL schema to docs/db/schema.sql
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT="$PROJECT_ROOT/docs/db/schema.sql"

echo "==> Exporting schema from docmost-db-1..."
docker exec docmost-db-1 pg_dump -U docmost -d docmost \
  --schema-only --no-owner --no-privileges > "$OUTPUT"

echo "==> Schema exported to $OUTPUT ($(wc -l < "$OUTPUT") lines)"
