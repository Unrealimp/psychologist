#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="/home/daniil/react/psychologist/public/images"
TARGET_WIDTHS=(480 768 1200)

images=(
  "profile-1770267166986-8045a8ad.webp"
  "profile-1770267153868-d79c92d4.webp"
  "urfu-social-psychology.webp"
  "cbt.webp"
  "eastern-europe-psychoanalysis.webp"
  "institute-psychotherapy-psychoanalysis.webp"
  "association.webp"
)

for img in "${images[@]}"; do
  src="$SRC_DIR/$img"
  if [[ ! -f "$src" ]]; then
    echo "Missing $src" >&2
    exit 1
  fi
  width=$(identify -format "%w" "$src")
  base="${img%.webp}"
  for w in "${TARGET_WIDTHS[@]}"; do
    if (( width >= w )); then
      out="$SRC_DIR/${base}-${w}w.webp"
      convert "$src" -resize "${w}x" -strip -quality 82 "$out"
      echo "Generated $out"
    fi
  done
  echo "Done $img (orig ${width}px)"
done
