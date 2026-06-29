#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/mipmap-anydpi
mkdir -p android/app/src/main/res/values
mkdir -p frontend/assets/brand

npx --yes svg2vectordrawable -i brand/logo-launcher.svg \
  -o android/app/src/main/res/drawable/ic_launcher_foreground.xml
npx --yes svg2vectordrawable -i brand/logo-mono.svg \
  -o android/app/src/main/res/drawable/ic_launcher_monochrome.xml

cp brand/*.svg frontend/assets/brand/

echo "Icons built."
