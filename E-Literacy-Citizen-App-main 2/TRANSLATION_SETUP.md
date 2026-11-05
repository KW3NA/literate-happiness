# Google Cloud Translation API Setup Guide

## Overview
This guide will help you set up Google Cloud Translation API for your E-Literacy app to provide translations between English, Afrikaans, and Zulu.

## Step 1: Set up Google Cloud Project

1. **Create a Google Cloud Project** (if you don't have one):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" → "New Project"
   - Name your project (e.g., "E-Literacy Translation")
   - Click "Create"

2. **Enable the Translation API**:
   - In your project, go to "APIs & Services" → "Library"
   - Search for "Cloud Translation API"
   - Click on it and press "Enable"

## Step 2: Create API Key

1. **Create credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

2. **Restrict the API Key** (recommended for security):
   - Click on the API key you just created
   - Under "Application restrictions", select "HTTP referrers"
   - Add your app's domain or use "None" for development
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Translation API" from the dropdown
   - Click "Save"

## Step 3: Configure Your App

### Option A: Environment Variable (Recommended for Production)

1. Create a `.env` file in your project root:
```bash
GOOGLE_CLOUD_TRANSLATION_API_KEY=your_api_key_here
```

2. Install environment variable support:
```bash
npm install react-native-dotenv
```

3. Update your `babel.config.js`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }]
    ]
  };
};
```

4. Update `config/translation.ts`:
```typescript
import { GOOGLE_CLOUD_TRANSLATION_API_KEY } from '@env';

export const TRANSLATION_CONFIG = {
  API_KEY: GOOGLE_CLOUD_TRANSLATION_API_KEY,
  // ... rest of config
};
```

### Option B: Direct Configuration (For Development)

1. Update `config/translation.ts`:
```typescript
export const TRANSLATION_CONFIG = {
  API_KEY: 'your_actual_api_key_here', // Replace with your API key
  // ... rest of config
};
```

## Step 4: Test the Setup

1. **Add the test component** to any screen temporarily:
```typescript
import { TranslationTest } from '../components/TranslationTest';

// In your component's render method:
<TranslationTest />
```

2. **Run the app** and test the translation functionality

3. **Check the console** for initialization messages

## Step 5: Usage

The translation service is automatically initialized when your app starts. You can use it in any component:

```typescript
import { useLanguage } from '../components/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();
  
  const [translatedText, setTranslatedText] = useState('');
  
  useEffect(() => {
    const translateText = async () => {
      const result = await t('Hello, welcome to E-Literacy!');
      setTranslatedText(result);
    };
    translateText();
  }, [t]);

  return <Text>{translatedText}</Text>;
};
```

## Features

- **Caching**: Translations are cached to reduce API calls
- **Error Handling**: Falls back to original text if translation fails
- **Retry Logic**: Automatically retries failed requests
- **Language Support**: English, Afrikaans, and Zulu
- **Type Safety**: Full TypeScript support

## API Limits and Costs

- **Free Tier**: 500,000 characters per month
- **Paid Tier**: $20 per million characters
- **Rate Limits**: 100 requests per 100 seconds per user

## Troubleshooting

### Common Issues:

1. **"API Key Error"**: Make sure your API key is correctly set
2. **"Translation failed"**: Check if the Translation API is enabled
3. **"Network error"**: Verify your internet connection
4. **"Quota exceeded"**: Check your Google Cloud billing and quotas

### Debug Steps:

1. Check the console for error messages
2. Use the `TranslationTest` component to test connectivity
3. Verify your API key restrictions
4. Check your Google Cloud billing status

## Security Notes

- Never commit API keys to version control
- Use environment variables in production
- Restrict API keys to specific domains/IPs
- Monitor API usage in Google Cloud Console

## Support

If you encounter issues:
1. Check the Google Cloud Console for API errors
2. Review the [Google Cloud Translation API documentation](https://cloud.google.com/translate/docs)
3. Check your billing and quota limits 