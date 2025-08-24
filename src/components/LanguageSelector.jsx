import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

function LanguageSelector() {
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Find current language info from available languages
  const currentLang = availableLanguages?.find(lang => lang.code === currentLanguage) || { code: 'en', name: 'English', flag: 'US' };
  
  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Modal component to be rendered in portal
  const Modal = () => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleDropdown}
          />
          
          {/* Modal Content - Redesigned */}
          <motion.div
            className="relative bg-gradient-to-br from-slate-800/95 via-gray-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl z-[100000]"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {t('chooseLanguage')}
                    </h3>
                    <p className="text-gray-400 text-sm">{t('selectPreferredLanguage')}</p>
                  </div>
                </div>
                <motion.button
                  onClick={toggleDropdown}
                  className="p-2 rounded-xl hover:bg-white/10 border border-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
            
            {/* Languages Grid - Show all at once */}
            <div className="p-6">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableLanguages.map((language, index) => (
                  <motion.button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 group ${
                      currentLanguage === language.code 
                        ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/50 shadow-lg shadow-purple-500/25' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Flag */}
                    <div className="w-12 h-8 mb-2 rounded overflow-hidden border border-white/20 shadow-md transform transition-transform group-hover:scale-105">
                      <img 
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${language.flag}.svg`}
                        alt={`${language.country} flag`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Try alternative CDN
                          if (e.target.src.includes('purecatamphetamine')) {
                            e.target.src = `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${language.flag.toLowerCase()}.svg`;
                          } else if (e.target.src.includes('jsdelivr')) {
                            // Final fallback to styled text
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs" style={{display: 'none'}}>
                        {language.flag}
                      </div>
                    </div>
                    
                    {/* Country Name */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-white leading-tight">
                        {language.country}
                      </p>
                    </div>
                    
                    {/* Selected Indicator */}
                    {currentLanguage === language.code && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </motion.div>
                    )}
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/10 bg-black/20 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {availableLanguages.length} languages available
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time translation</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  
  return (
    <div className="relative">
      {/* Language Button */}
      <motion.button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-5 h-3 sm:w-6 sm:h-4 rounded overflow-hidden border border-white/20">
          <img 
            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${currentLang.flag}.svg`}
            alt={`${currentLang.country} flag`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Try alternative CDN
              if (e.target.src.includes('purecatamphetamine')) {
                e.target.src = `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${currentLang.flag.toLowerCase()}.svg`;
              } else if (e.target.src.includes('jsdelivr')) {
                // Final fallback to styled text
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }
            }}
          />
          <span className="text-xs font-bold text-white" style={{display: 'none'}}>
            {currentLang.flag}
          </span>
        </div>
        <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">
          {currentLang.name}
        </span>
        <motion.svg 
          className="w-4 h-4 text-white/70"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>
      
      {/* Render Modal in Portal */}
      {createPortal(<Modal />, document.body)}
    </div>
  );
}

export default LanguageSelector;