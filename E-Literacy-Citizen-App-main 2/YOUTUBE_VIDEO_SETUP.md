# YouTube Video Integration Setup

## Overview
To add YouTube video playback functionality to the CourseDetails screen, you'll need to install and configure a React Native YouTube player library.

## Recommended Libraries

### Option 1: react-native-youtube-iframe (Recommended)
This is the most popular and well-maintained YouTube player for React Native.

#### Installation
```bash
npm install react-native-youtube-iframe
# or
yarn add react-native-youtube-iframe
```

#### For Expo (if using Expo)
```bash
npx expo install react-native-youtube-iframe
```

### Option 2: react-native-webview + YouTube Embed
If you prefer a webview-based approach, you can use the existing WebView component.

#### Installation
```bash
npm install react-native-webview
# or
yarn add react-native-webview
```

## Implementation Guide

### Using react-native-youtube-iframe

1. **Import the component:**
```typescript
import YoutubePlayer from "react-native-youtube-iframe";
```

2. **Add state for player control:**
```typescript
const [playing, setPlaying] = useState(false);
```

3. **Replace the video placeholder in CourseDetails.tsx:**
```typescript
const renderVideoContainer = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Course Preview</Text>
    <View style={styles.videoContainer}>
      <YoutubePlayer
        height={200}
        play={playing}
        videoId={getYouTubeVideoId(courseData.videoUrl)}
        onChangeState={event => console.log(event)}
        onReady={() => console.log("ready")}
        onError={e => console.log(e)}
        onPlaybackQualityChange={q => console.log(q)}
        initialPlayerParams={{
          preventFullScreen: false,
          cc_lang_pref: "us",
          showClosedCaptions: true
        }}
      />
    </View>
  </View>
);
```

4. **Add helper function to extract YouTube video ID:**
```typescript
const getYouTubeVideoId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};
```

### Using WebView Approach

1. **Import WebView:**
```typescript
import { WebView } from 'react-native-webview';
```

2. **Replace the video placeholder:**
```typescript
const renderVideoContainer = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Course Preview</Text>
    <View style={styles.videoContainer}>
      <WebView
        style={{ height: 200 }}
        source={{
          html: `
            <html>
              <body style="margin:0;padding:0;">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/${getYouTubeVideoId(courseData.videoUrl)}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </body>
            </html>
          `
        }}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  </View>
);
```

## Configuration

### Android Configuration
If using react-native-youtube-iframe, add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS Configuration
For iOS, no additional configuration is typically required.

## Features Available

### react-native-youtube-iframe Features:
- ✅ Play/Pause control
- ✅ Fullscreen support
- ✅ Quality selection
- ✅ Closed captions
- ✅ Custom controls
- ✅ Event handling
- ✅ Error handling

### WebView Features:
- ✅ Basic playback
- ✅ Fullscreen support
- ✅ Limited control over player
- ⚠️ Less control over player events
- ⚠️ May have performance issues

## Recommended Implementation

I recommend using **react-native-youtube-iframe** because it:
- Provides better performance
- Offers more control over the player
- Has better event handling
- Supports more features
- Is actively maintained

## Next Steps

1. Choose your preferred library
2. Install the dependencies
3. Replace the video placeholder in `CourseDetails.tsx`
4. Test the implementation
5. Add any additional features like play/pause controls or fullscreen handling

## Troubleshooting

### Common Issues:
1. **Video not playing**: Check internet permissions
2. **Black screen**: Verify video ID extraction
3. **Performance issues**: Consider using WebView for simpler implementations
4. **Fullscreen issues**: Check device orientation settings

### Support:
- [react-native-youtube-iframe GitHub](https://github.com/LonelyCpp/react-native-youtube-iframe)
- [react-native-webview GitHub](https://github.com/react-native-webview/react-native-webview) 