# WebView Installation Guide

## Quick Setup for YouTube Video Integration

To enable YouTube video playback in the CourseDetails screen, you need to install `react-native-webview`.

### Step 1: Install WebView Package

Run this command in your project directory:

```bash
npm install react-native-webview
# or if using yarn
yarn add react-native-webview
```

### Step 2: For Expo Projects

If you're using Expo, run:

```bash
npx expo install react-native-webview
```

### Step 3: Enable the Video Player

After installation, uncomment the WebView code in `screens/apps/CourseDetails.tsx`:

1. Find this line (around line 12):
   ```typescript
   // import { WebView } from 'react-native-webview'; // Uncomment after installing: npm install react-native-webview
   ```

2. Change it to:
   ```typescript
   import { WebView } from 'react-native-webview';
   ```

3. Find the commented WebView code (around line 95-115) and uncomment it:
   ```typescript
   <WebView
     style={styles.videoPlayer}
     source={{
       html: `
         <html>
           <body style="margin:0;padding:0;">
             <iframe
               width="100%"
               height="100%"
               src="https://www.youtube.com/embed/${videoId}?si=lNR2BeVzKLZysghz"
               frameborder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               referrerpolicy="strict-origin-when-cross-origin"
               allowfullscreen>
             </iframe>
           </body>
         </html>
       `
     }}
     allowsFullscreenVideo={true}
     mediaPlaybackRequiresUserAction={false}
   />
   ```

4. Comment out or remove the placeholder code.

### Step 4: Test the Integration

1. Navigate to the Learn menu
2. Click "View Details" on "Digital Basics 101"
3. You should see your YouTube video playing in the Course Preview section

### Current Status

- ✅ Video URL updated for "Digital Basics 101": `wod8gUBxWR4`
- ✅ Video ID extraction function implemented
- ✅ WebView code ready (commented out)
- ✅ Placeholder shows video ID for verification
- ⏳ **Next**: Install WebView package and uncomment the code

### Troubleshooting

If you encounter issues:

1. **Video not playing**: Check internet permissions in your app
2. **Black screen**: Verify the video ID is correct
3. **WebView not loading**: Make sure the package is properly installed
4. **Build errors**: Try cleaning and rebuilding your project

### Video URLs Ready

All courses now have video URLs configured. You can update them with your actual videos:

- Digital Basics 101: `wod8gUBxWR4` ✅ (Your video)
- Click with Confidence: `8jLoW7Ee6nY`
- Staying Safe Online: `ANWJHu1hRjI`
- And more...

The system is ready to play your YouTube videos once WebView is installed! 