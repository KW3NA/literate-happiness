// Google Cloud Translation API Service using fetch
type LangCode = 'en' | 'af' | 'zu' | 'auto';

interface CacheEntry {
  [key: string]: string;
}

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

export class TranslationService {
  private static cache: CacheEntry = {};
  private static apiKey: string | null = null;
  private static hasWarned = false;
  private static baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  // Initialize the translation service with your API key
  static initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Whether an API key has been configured for live (dynamic) translation.
  static isInitialized() {
    return this.apiKey !== null;
  }

  static async translateText(
    text: string,
    to: LangCode,
    from: LangCode = 'auto'
  ): Promise<string> {
    if (!text || !to) return text;
    if (to === 'en') return text; // No translation needed for English

    // Temporary fallback - return original text if API key is not properly set
    if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_CLOUD_API_KEY') {
      if (!this.hasWarned) {
        console.warn('Translation API key not properly configured, returning original text');
        this.hasWarned = true;
      }
      return text;
    }

    const cacheKey = `${from}-${to}-${text}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    try {
      const result = await this.tryTranslate(text, to, from);
      this.cache[cacheKey] = result;
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }

  private static async tryTranslate(
    text: string,
    to: LangCode,
    from: LangCode,
    retries = 2
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Translation API key not set. Call TranslationService.initialize() first.');
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const targetLang = this.convertLangCode(to);
        const sourceLang = from === 'auto' ? undefined : this.convertLangCode(from);

        const url = new URL(this.baseUrl);
        url.searchParams.append('key', this.apiKey);
        url.searchParams.append('q', text);
        url.searchParams.append('target', targetLang);
        if (sourceLang) {
          url.searchParams.append('source', sourceLang);
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Translation API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: url.toString(),
            error: errorText
          });
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data: TranslationResponse = await response.json();
        
        if (data.data?.translations?.[0]?.translatedText) {
          const translatedText = data.data.translations[0].translatedText.trim();
          const decodedText = this.decodeHtmlEntities(translatedText);
          
          // Log if HTML entities were found and decoded
          if (translatedText !== decodedText) {
            console.log('HTML entities decoded:', {
              original: translatedText,
              decoded: decodedText
            });
          }
          
          return decodedText;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.warn(`Translation attempt ${attempt + 1} failed:`, err);
        if (attempt === retries) throw err;
        await this.delay(500 * (attempt + 1));
      }
    }
    return text;
  }

  // Convert our language codes to Google Cloud format
  private static convertLangCode(code: LangCode): string {
    const codeMap: Record<LangCode, string> = {
      'en': 'en',
      'af': 'af',
      'zu': 'zu',
      'auto': 'auto'
    };
    return codeMap[code] || code;
  }

  private static delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // Decode HTML entities to proper characters
  private static decodeHtmlEntities(text: string): string {
    // Common HTML entities mapping
    const htmlEntities: { [key: string]: string } = {
      '&#39;': "'",
      '&apos;': "'",
      '&quot;': '"',
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&#8217;': "'",
      '&#8216;': "'",
      '&#8220;': '"',
      '&#8221;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '=',
      '&#x2B;': '+',
    };

    let decodedText = text;
    
    // Replace HTML entities with their character equivalents
    Object.keys(htmlEntities).forEach(entity => {
      const regex = new RegExp(entity, 'g');
      decodedText = decodedText.replace(regex, htmlEntities[entity]);
    });

    // Handle numeric HTML entities (like &#39;)
    decodedText = decodedText.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });

    // Handle hex HTML entities (like &#x27;)
    decodedText = decodedText.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    return decodedText;
  }

  // Clear cache if needed
  static clearCache() {
    this.cache = {};
    console.log('Translation cache cleared');
  }

  // Get cache statistics
  static getCacheStats() {
    return {
      size: Object.keys(this.cache).length,
      entries: Object.keys(this.cache)
    };
  }

  // Test the API connection
  static async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_CLOUD_API_KEY') {
        console.warn('API key not configured');
        return false;
      }
      const result = await this.translateText('Hello', 'af', 'en');
      return result !== 'Hello';
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}
