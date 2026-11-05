# Metro Bundling Error Fix Guide

## Problem

```
Android Bundling failed 4012ms index.js (1407 modules)
Unable to resolve "C:\Users\Serati\OneDrive\Desktop\Project_3rdYear\E-lite-Current\E-Literacy-Citizen-App\node_modules\@expo\metro-config\build\async-require.js" from "screens\apps\ResumeCourse.tsx"
```

## Root Cause

The error is caused by:

1. Missing `expo-web-browser` dependency
2. Dynamic import syntax that Metro bundler can't resolve properly
3. Potential Metro cache issues

## Solution Steps

### Step 1: Install Missing Dependency

```bash
cd "E-lite-Current/E-Literacy-Citizen-App"
npm install expo-web-browser@~14.1.4
```

### Step 2: Clear Metro Cache

```bash
npx expo start --clear
```

### Step 3: Alternative - Reset Everything

If the above doesn't work, try:

```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules
npm install
npx expo start --clear
```

## What Was Fixed

### 1. ResumeCourse.tsx

- **Before**: Dynamic imports causing Metro resolution issues

```javascript
import("expo-web-browser").then((WebBrowser) => {
  WebBrowser.openBrowserAsync(pdfUrl);
});
```

- **After**: Static imports with proper error handling

```javascript
import * as WebBrowser from 'expo-web-browser';

// In the component:
onPress={async () => {
  try {
    await WebBrowser.openBrowserAsync(pdfUrl);
  } catch (error) {
    await Linking.openURL(pdfUrl);
  }
}}
```

### 2. package.json

- Added missing `expo-web-browser` dependency
- Version: `~14.1.4` (compatible with Expo SDK 53)

### 3. Import Structure

- Added proper static imports at the top of the file
- Removed problematic dynamic imports
- Added fallback to React Native's `Linking` API

## Verification

After running the fix:

1. The Metro bundler should start without errors
2. The PDF download functionality should work
3. The app should build and run successfully

## Additional Notes

- The `expo-web-browser` package provides better PDF viewing experience
- Falls back to `Linking.openURL` if WebBrowser fails
- Compatible with both iOS and Android platforms

## Troubleshooting

If you still encounter issues:

1. Check that all dependencies are properly installed
2. Ensure you're using the correct Expo SDK version
3. Try running `npx expo doctor` to check for configuration issues
4. Consider updating to the latest Expo SDK if possible
