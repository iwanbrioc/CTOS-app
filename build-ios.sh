#!/bin/bash

# iOS Build Script for Coming to Our Senses
# This script builds the React app and syncs it with iOS

echo "🏗️  Building Coming to Our Senses for iOS..."

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Step 2: Build React app
echo "⚛️  Building React app..."
npm run build

# Step 3: Sync with iOS
echo "📱 Syncing with iOS..."
npx cap sync ios

# Step 4: Open in Xcode (if on Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Opening in Xcode..."
    npx cap open ios
else
    echo "ℹ️  To continue on Mac:"
    echo "   1. Transfer this project to your Mac"
    echo "   2. Run: npx cap open ios"
    echo "   3. Build and archive in Xcode"
fi

echo "✅ Build complete!"
echo "📖 See ios-deployment-guide.md for detailed deployment instructions"