import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LoadingFallback from './LoadingFallback';

/**
 * Wrapper component that shows loading state while language is being loaded
 */
const LanguageLoadingWrapper = ({ children }) => {
  const { isLoadingLanguage } = useLanguage();

  if (isLoadingLanguage) {
    return <LoadingFallback message="Loading language..." />;
  }

  return children;
};

export default LanguageLoadingWrapper;