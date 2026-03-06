#!/usr/bin/env bash
set -euo pipefail

# Voice Trainer — Azure App Service deploy script
# Usage: ./scripts/deploy.sh

APP_NAME="voice-trainer-app"
RESOURCE_GROUP="voice-trainer-rg"
DEPLOY_DIR="/tmp/voice-trainer-deploy"
DEPLOY_ZIP="/tmp/voice-trainer-deploy.zip"

echo "=== Building app ==="
npm run build

echo "=== Preparing deploy package ==="
rm -rf "$DEPLOY_DIR" "$DEPLOY_ZIP"
mkdir -p "$DEPLOY_DIR"
cp -r dist/ "$DEPLOY_DIR/dist/"
cp package.json package-lock.json "$DEPLOY_DIR/"

echo "=== Installing production dependencies ==="
cd "$DEPLOY_DIR"
npm install --omit=dev --ignore-scripts 2>&1 | tail -3
cd -

echo "=== Creating zip ==="
(cd "$DEPLOY_DIR" && zip -qr "$DEPLOY_ZIP" .)
echo "Package size: $(du -h "$DEPLOY_ZIP" | cut -f1)"

echo "=== Deploying to Azure App Service ==="
az webapp deploy \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --type zip \
  --src-path "$DEPLOY_ZIP" \
  --async true

echo "=== Waiting for app to start ==="
sleep 15
for i in $(seq 1 6); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "https://${APP_NAME}.azurewebsites.net/api/health" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "App is live at https://${APP_NAME}.azurewebsites.net"
    curl -s "https://${APP_NAME}.azurewebsites.net/api/health"
    echo ""
    exit 0
  fi
  echo "Waiting for startup... (attempt $i/6, status=$STATUS)"
  sleep 15
done

echo "Warning: App may still be starting (F1 free tier has slow cold starts)"
echo "Try: curl https://${APP_NAME}.azurewebsites.net/api/health"
