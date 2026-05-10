#!/usr/bin/env bash
# convert-to-webp.sh
# Converts all .png / .jpg / .jpeg in img/** to .webp using ffmpeg.
# Originals are kept in place. Already-converted files are skipped.
#
# Usage:
#   cd img && bash convert-to-webp.sh
#   or from repo root:
#   bash img/convert-to-webp.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

converted=0
skipped=0
errors=0

while IFS= read -r -d '' src; do
  webp="${src%.*}.webp"

  if [ -f "$webp" ]; then
    echo "  skip   $(basename "$src")"
    ((skipped++)) || true
    continue
  fi

  if ffmpeg -y -i "$src" -c:v libwebp -quality 82 "$webp" -loglevel error </dev/null 2>/dev/null; then
    echo "  ok     $(basename "$webp")"
    ((converted++)) || true
  else
    echo "  ERROR  $src"
    ((errors++)) || true
  fi
done < <(find "$SCRIPT_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -not -name "convert-to-webp.sh" -print0)

echo ""
echo "Done. converted=$converted  skipped=$skipped  errors=$errors"
