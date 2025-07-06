# iOS App Store Deployment Guide - Coming to Our Senses

## Overview
Your React mindfulness app has been successfully configured with Capacitor for iOS deployment. This guide will walk you through the complete process of building and submitting your app to the Apple App Store.

## Prerequisites

### 1. Mac Computer Required
- You'll need a Mac with macOS 10.15 or later
- Xcode 12 or later installed (free from Mac App Store)

### 2. Apple Developer Account
- Sign up at https://developer.apple.com
- Cost: $99/year
- Required for App Store distribution

### 3. Install CocoaPods (on Mac)
```bash
sudo gem install cocoapods
```

## Step 1: Setup on Mac

### Transfer Project Files
1. Download your project files from Replit
2. Extract to your Mac
3. Open Terminal and navigate to project directory

### Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install iOS dependencies
cd ios
pod install
cd ..
```

## Step 2: Build Your App

### Production Build
```bash
# Build your React app
npm run build

# Sync with iOS
npx cap sync ios
```

### Open in Xcode
```bash
npx cap open ios
```

## Step 3: Configure in Xcode

### App Identity
1. Select your project in Xcode
2. Go to "Signing & Capabilities"
3. Set your Team (Apple Developer Account)
4. Update Bundle Identifier to match your developer account

### App Icons
Create app icons in these sizes:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 167x167 (iPad)
- 152x152 (iPad)

Place icons in: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Launch Screen
Update splash screen in: `ios/App/App/Assets.xcassets/Splash.imageset/`

### App Info
Update `ios/App/App/Info.plist`:
- App name
- Version numbers
- Permissions (microphone for voice recording)
- Background modes for audio playback

## Step 4: Test Your App

### Simulator Testing
1. In Xcode, select iPhone simulator
2. Click "Run" (Play button)
3. Test all features thoroughly

### Device Testing
1. Connect your iPhone
2. Select your device in Xcode
3. Enable "Developer Mode" on your iPhone
4. Run and test on physical device

## Step 5: App Store Submission

### Create App Store Connect Record
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in app details:
   - Name: "Coming to Our Senses"
   - Bundle ID: com.ctos.mindfulness
   - Category: Health & Fitness
   - Description: Your mindfulness app description

### Archive Your App
1. In Xcode, select "Any iOS Device"
2. Product → Archive
3. When archive completes, click "Distribute App"
4. Choose "App Store Connect"
5. Upload to App Store Connect

### Complete App Store Listing
1. Upload screenshots (required sizes)
2. Write app description
3. Set pricing (can be free)
4. Add privacy policy URL
5. Complete age rating questionnaire
6. Submit for review

## Step 6: App Store Assets Needed

### Screenshots Required
- 6.7" iPhone (iPhone 15 Pro Max): 1290x2796
- 6.1" iPhone (iPhone 15 Pro): 1179x2556
- 12.9" iPad Pro: 2048x2732

### App Preview Video (Optional)
- 30-second preview video
- Same dimensions as screenshots

### App Description
```
Coming to Our Senses - 8-Week Mindfulness Journey

Transform your relationship with technology and develop deeper awareness through our comprehensive mindfulness program. Based on Jon Kabat-Zinn's renowned course, this app guides you through an 8-week journey of self-discovery.

Features:
• 8 weeks of guided meditation sessions
• Daily journaling with structured morning/evening routines
• Progress tracking with visual milestones
• Practice reminder notifications
• Audio recordings from authentic mindfulness teachers
• Beautiful, calming interface designed for focus

Whether you're new to mindfulness or deepening your practice, Coming to Our Senses provides the tools and guidance for lasting transformation.
```

## Step 7: Common Issues & Solutions

### Build Errors
- Clean build folder: Product → Clean Build Folder
- Update signing certificates
- Check Bundle Identifier matches your developer account

### Rejection Reasons
- Missing privacy policy
- Incomplete app description
- Screenshots don't match app content
- App crashes during review

### Audio Permissions
Add to Info.plist:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice journaling features.</string>
```

## Current Project Status

✅ **Completed:**
- Capacitor configuration
- iOS platform added
- Native plugins installed (notifications, splash screen, device, filesystem)
- Basic sync completed

⚠️ **Next Steps:**
1. Build production version on Mac
2. Configure app icons and launch screens
3. Test on physical device
4. Submit to App Store Connect

## Estimated Timeline
- Setup on Mac: 2-3 hours
- App Store preparation: 4-6 hours
- Review process: 1-7 days

## Support Resources
- Apple Developer Documentation: https://developer.apple.com/documentation/
- Capacitor iOS Guide: https://capacitorjs.com/docs/ios
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/