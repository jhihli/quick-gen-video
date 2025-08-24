import React, { createContext, useState, useContext, useEffect } from 'react';
import { AVAILABLE_LANGUAGES, loadLanguage, preloadLanguages } from './LanguageLoader';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export available languages from the loader
export { AVAILABLE_LANGUAGES };

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);

  // Load language translations
  const loadLanguageTranslations = async (languageCode) => {
    setIsLoadingLanguage(true);
    try {
      console.log(`🌍 Loading translations for: ${languageCode}`);
      const newTranslations = await loadLanguage(languageCode);
      setTranslations(newTranslations);
      console.log(`✅ Translations loaded for: ${languageCode}`);
    } catch (error) {
      console.error('Failed to load language:', error);
      // Fallback to English if current language fails
      if (languageCode !== 'en') {
        await loadLanguageTranslations('en');
      }
    } finally {
      setIsLoadingLanguage(false);
    }
  };

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) return;
    
    console.log(`🔄 Changing language to: ${languageCode}`);
    setCurrentLanguage(languageCode);
    
    // Save to localStorage
    localStorage.setItem('tkvgen-language', languageCode);
    
    // Load new translations
    await loadLanguageTranslations(languageCode);
  };

  // Translation function
  const t = (key, fallback = key) => {
    if (isLoadingLanguage) {
      return 'Loading...';
    }
    
    return translations[key] || fallback || key;
  };

  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tkvgen-language');
    const initialLanguage = savedLanguage && AVAILABLE_LANGUAGES.find(lang => lang.code === savedLanguage) 
      ? savedLanguage 
      : 'en';

    setCurrentLanguage(initialLanguage);
    loadLanguageTranslations(initialLanguage);

    // Preload common languages in background (after 3 seconds)
    const preloadTimer = setTimeout(() => {
      const commonLanguages = ['es', 'pt', 'fr'].filter(lang => lang !== initialLanguage);
      if (commonLanguages.length > 0) {
        console.log('📦 Preloading common languages...');
        preloadLanguages(commonLanguages);
      }
    }, 3000);

    return () => clearTimeout(preloadTimer);
  }, []);

  const contextValue = {
    currentLanguage,
    changeLanguage,
    t,
    isLoadingLanguage,
    availableLanguages: AVAILABLE_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};