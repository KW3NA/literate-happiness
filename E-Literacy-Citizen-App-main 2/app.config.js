import 'dotenv/config';

export default ({ config }) => ({
  expo: {
    name: "E-Literacy App",
    slug: "e-literacy-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/logo.jpg",
    splash: {
      image: "./assets/logo.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.eliteracy.citizenapp"
    },
    android: {
      package: "com.eliteracy.citizenapp"
    },
    ...config,
    extra: {
      HTML2PDFROCKET_API_KEY: process.env.HTML2PDFROCKET_API_KEY,
      GOOGLE_CLOUD_TRANSLATION_API_KEY: process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY,
      OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
    },
    plugins: [
      "expo-font",
      "expo-sharing",
      "expo-splash-screen",
      "expo-status-bar",
      "expo-web-browser"
    ]
  }
});