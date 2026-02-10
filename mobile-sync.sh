#!/bin/bash
echo "Building web app..."
npm run build

echo ""
echo "Syncing to iOS and Android..."
npx cap sync

echo ""
echo "Done! Your iOS and Android apps are updated."
