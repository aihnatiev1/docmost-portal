#!/usr/bin/env bash
# Update Midnight Electric design system on commitdoc.com/ds/
# Usage: bash scripts/update-design-system.sh [source_dir]
#
# source_dir defaults to /root/commitdoc-ds/commitdoc/

set -euo pipefail

SRC="${1:-/root/commitdoc-ds/commitdoc}"
DEST="/var/www/commitdoc-ds"
CONTAINER="nginx"

if [ ! -d "$SRC" ]; then
  echo "Error: source directory $SRC does not exist"
  exit 1
fi

echo "==> Copying design system files from $SRC to $DEST..."
mkdir -p "$DEST"
find "$SRC" -maxdepth 1 -type f ! -name '.DS_Store' -exec cp {} "$DEST/" \;

echo "==> Syncing into nginx container..."
docker cp "$DEST" "$CONTAINER":/var/www/commitdoc-ds

echo "==> Fixing permissions..."
docker exec -u root "$CONTAINER" chmod -R a+rX /var/www/commitdoc-ds/

echo "==> Done! Design system updated at https://commitdoc.com/ds/"
echo "    Files: $(ls "$DEST" | wc -l)"
