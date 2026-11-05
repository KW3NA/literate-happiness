// Translation API Configuration
export const TRANSLATION_CONFIG = {
  // Supported languages
  SUPPORTED_LANGUAGES: {
    en: 'English',
    af: 'Afrikaans', 
    zu: 'Zulu'
  },
  
  // Default language
  DEFAULT_LANGUAGE: 'en',
  
  // Cache settings
  CACHE_ENABLED: true,
  CACHE_MAX_SIZE: 1000, // Maximum number of cached translations
  
  // API settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 500, // milliseconds
  REQUEST_TIMEOUT: 10000, // milliseconds
};

// Environment variables (for production)
export const getApiKey = (): string => {
  // TEMPORARY: Hardcode for now - environment variables not working in React Native runtime
  const tempApiKey = '';  
  
  // Try multiple methods to get the API key (like your other working API keys)
  try {
    // Method 1: Direct process.env access (Node/metro time)
    const envKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;
    if (envKey) {
      console.log('DEBUG: API Key from process.env: FOUND');
      return envKey;
    }
    
    // Method 2: Expo Constants (runtime in app)
    const Constants = require('expo-constants');
    const constantsKey =
      Constants.expoConfig?.extra?.GOOGLE_CLOUD_TRANSLATION_API_KEY ||
      Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY ||
      Constants.manifest?.extra?.GOOGLE_CLOUD_TRANSLATION_API_KEY ||
      Constants.manifest?.extra?.EXPO_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;

    if (constantsKey) {
      console.log('DEBUG: API Key from Constants: FOUND');
      console.log(constantsKey);
      return constantsKey;
    }
    
    console.log('DEBUG: Using temporary API key - environment variables not accessible in React Native runtime');
    return tempApiKey;
  } catch (error) {
    console.log('DEBUG: Error accessing API key:', error instanceof Error ? error.message : 'Unknown error');
    return tempApiKey;
  }
};

// Validation function
export const validateApiKey = (apiKey: string): boolean => {
  return Boolean(apiKey && apiKey !== 'YOUR_GOOGLE_CLOUD_API_KEY' && apiKey.length > 0);
}; 