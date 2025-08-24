// Dynamic language loading system for reduced initial bundle size

// Available languages configuration
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: 'US', country: 'United States' },
  { code: 'es', name: 'Español', flag: 'ES', country: 'Spain' },
  { code: 'pt', name: 'Português', flag: 'BR', country: 'Brazil' },
  { code: 'fr', name: 'Français', flag: 'FR', country: 'France' },
  { code: 'de', name: 'Deutsch', flag: 'DE', country: 'Germany' },
  { code: 'it', name: 'Italiano', flag: 'IT', country: 'Italy' },
  { code: 'zh', name: '中文', flag: 'CN', country: 'China' },
  { code: 'ja', name: '日本語', flag: 'JP', country: 'Japan' },
  { code: 'ko', name: '한국어', flag: 'KR', country: 'South Korea' },
  { code: 'ar', name: 'العربية', flag: 'SA', country: 'Saudi Arabia' },
  { code: 'hi', name: 'हिंदी', flag: 'IN', country: 'India' },
  { code: 'ru', name: 'Русский', flag: 'RU', country: 'Russia' }
];

// Cache for loaded translations
const translationCache = new Map();

// Dynamic import functions for each language
const languageLoaders = {
  en: () => import('./translations/en.js').then(module => module.default),
  es: () => import('./translations/es.js').then(module => module.default),
  pt: () => import('./translations/pt.js').then(module => module.default),
  fr: () => import('./translations/fr.js').then(module => module.default),
  de: () => import('./translations/de.js').then(module => module.default),
  it: () => import('./translations/it.js').then(module => module.default),
  zh: () => import('./translations/zh.js').then(module => module.default),
  ja: () => import('./translations/ja.js').then(module => module.default),
  ko: () => import('./translations/ko.js').then(module => module.default),
  ar: () => import('./translations/ar.js').then(module => module.default),
  hi: () => import('./translations/hi.js').then(module => module.default),
  ru: () => import('./translations/ru.js').then(module => module.default)
};

/**
 * Load translations for a specific language
 * @param {string} languageCode - ISO language code (e.g., 'en', 'es')
 * @returns {Promise<Object>} - Promise resolving to translation object
 */
export const loadLanguage = async (languageCode) => {
  // Return from cache if already loaded
  if (translationCache.has(languageCode)) {
    return translationCache.get(languageCode);
  }

  // Check if language loader exists
  if (!languageLoaders[languageCode]) {
    console.warn(`Language loader not found for: ${languageCode}, falling back to English`);
    return loadLanguage('en');
  }

  try {
    console.log(`🌍 Loading language: ${languageCode}`);
    const translations = await languageLoaders[languageCode]();
    
    // Cache the loaded translations
    translationCache.set(languageCode, translations);
    
    console.log(`✅ Language loaded: ${languageCode}`);
    return translations;
  } catch (error) {
    console.error(`Failed to load language ${languageCode}:`, error);
    
    // Fallback to English if language loading fails
    if (languageCode !== 'en') {
      return loadLanguage('en');
    }
    
    // If even English fails, return minimal fallback
    return {
      title: 'TKVGen',
      loading: 'Loading...',
      error: 'Error occurred'
    };
  }
};

/**
 * Preload multiple languages (useful for common languages)
 * @param {string[]} languageCodes - Array of language codes to preload
 */
export const preloadLanguages = async (languageCodes) => {
  const loadPromises = languageCodes.map(code => loadLanguage(code));
  
  try {
    await Promise.allSettled(loadPromises);
    console.log(`📦 Preloaded languages: ${languageCodes.join(', ')}`);
  } catch (error) {
    console.warn('Some languages failed to preload:', error);
  }
};

/**
 * Get cached languages (already loaded)
 * @returns {string[]} - Array of cached language codes
 */
export const getCachedLanguages = () => {
  return Array.from(translationCache.keys());
};

/**
 * Clear language cache (useful for testing or memory management)
 */
export const clearLanguageCache = () => {
  translationCache.clear();
  console.log('🗑️ Language cache cleared');
};