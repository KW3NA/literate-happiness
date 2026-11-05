import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { 
  StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';

const WebViewScreen = ({ route, navigation }) => {
  const { uri, title } = route.params || {};
  const { colors } = useTheme();
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  // WebView's generic type param is derived from props, which confuses TS here —
  // use an opaque object ref and access goBack() dynamically.
  const webViewRef = useRef<any>(null);

  // Request camera (and microphone) permission up-front so the AR web experience
  // can access the device camera. Uses expo-image-picker so it also works in Expo Go.
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasCameraPermission(false);
      }
    };

    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (hasCameraPermission === false) {
      Alert.alert(
        "Camera Permission Required", 
        "Camera access is required for AR features to work properly. Please enable it and relaunch the AR experience.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              setHasCameraPermission(status === 'granted');
            } }
        ]
      );
    }
  }, [hasCameraPermission]);

  const handleError = (errorMessage: string) => {
    setError(true);
    setLoading(false);
    Alert.alert("Error", errorMessage, [
      { text: "Retry", onPress: () => { setError(false); setLoading(true); }},
      { text: "Go Back", onPress: () => navigation.goBack() }
    ]);
  };

  // Header back button: first steps through the web page's own history,
  // and exits the screen once there is nothing left to go back to.
  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]} numberOfLines={1}>
          {title || 'AR Experience'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Cancel and exit AR experience"
        >
          <TranslatedText style={styles.cancelButtonText}>Cancel</TranslatedText>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {loading && !error && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E67012" />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading AR experience…</Text>
        </View>
      )}

      {/* WebView */}
      {!error && (
        <WebView
          ref={webViewRef}
          source={{ uri }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={() => true}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setLoading(navState.loading);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            handleError(`HTTP Error: ${nativeEvent.statusCode}`);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            handleError(`Error: ${nativeEvent.description || 'Something went wrong while loading the page.'}`);
          }}
          style={styles.webview}
          javaScriptEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={true}
          // Enable camera and microphone for AR
          mediaTypes="all"
          allowsProtectedMedia={true}
          // Grant the web page camera/mic access once the native permission is granted
          onPermissionRequest={(request) => {
            if (hasCameraPermission) {
              request.grant();
            } else {
              request.deny();
            }
          }}
          // Additional AR-specific settings
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          thirdPartyCookiesEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
        />
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <FontAwesome6 name="exclamation-triangle" size={48} color="#E67012" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Failed to load AR experience
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(false);
              setLoading(true);
            }}
          >
            <TranslatedText style={styles.retryButtonText}>Retry</TranslatedText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E67012',
  },
  cancelButtonText: {
    color: '#E67012',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#E67012',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WebViewScreen;