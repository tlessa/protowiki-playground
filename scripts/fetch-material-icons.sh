#!/usr/bin/env bash
set -euo pipefail

# Fetch selected SVG icons from the Wikimedia Android app icon-svgs folder.
# Update COMMIT to pin reproducible snapshots.
COMMIT="main"
BASE_URL="https://raw.githubusercontent.com/wikimedia/apps-android-wikipedia/${COMMIT}/icon-svgs"
OUT_DIR="public/assets/wiki-material-icons"

mkdir -p "$OUT_DIR"

icons=(
  "ic_home_white_24dp.svg"
  "ic_bookmark_border_white_24dp.svg"
  "ic_search_white_24dp.svg"
  "ic_edit_white_24dp.svg"
  "ic_more_vert_white_24dp.svg"
  "ic_notifications_white_24dp.svg"
  "ic_filter_list_white_24dp.svg"
  "ic_delete_white_24dp.svg"
)

for icon in "${icons[@]}"; do
  if curl -fsSL "$BASE_URL/$icon" -o "$OUT_DIR/$icon"; then
    echo "fetched: $icon"
  else
    echo "missing in source: $icon"
  fi
done
