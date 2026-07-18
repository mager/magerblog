#!/bin/bash
# Upload a photo to the magerblog Vercel Blob store (magerblog-images).
#
# Usage: scripts/upload-photo.sh <image-file> <post-slug> [basename]
#
#   image-file  source image (jpg, png, heic — anything sips can read)
#   post-slug   the post's slug, e.g. 2026-07-18-montrose-sunset
#   basename    optional name for the stored file (default: hero)
#
# Compresses to max 1600px JPEG (~200-400KB), uploads to
# blog/<post-slug>/<basename>.jpg, prints the public URL on stdout.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$1"
SLUG="$2"
NAME="${3:-hero}"

TOKEN="$(grep '^BLOB_READ_WRITE_TOKEN=' "$REPO_DIR/.env.local" | cut -d= -f2- | tr -d '"')"
if [ -z "$TOKEN" ]; then
  echo "BLOB_READ_WRITE_TOKEN not found — run: vercel env pull .env.local" >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
sips -s format jpeg -s formatOptions 80 -Z 1600 "$SRC" --out "$TMP/$NAME.jpg" >/dev/null

vercel blob put "$TMP/$NAME.jpg" \
  --cwd "$REPO_DIR" \
  --pathname "blog/$SLUG/$NAME.jpg" \
  --allow-overwrite true \
  --rw-token "$TOKEN" 2>&1 | grep -o 'https://[^ ]*'
