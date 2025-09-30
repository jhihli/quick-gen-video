import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const BottomButtonBar = ({ 
  onPhotosClick, 
  onMusicClick, 
  onAvatarClick, 
  onGenerateClick,
  hasPhotos = false,
  hasMusic = false,
  hasAvatar = false,
  canGenerate = false,
  isGenerating = false 
}) => {
  const { t } = useLanguage();

  const buttonVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const ButtonIcon = ({ type, completed }) => {
    const getIconColor = () => {
      if (completed) return 'text-green-400';

      switch (type) {
        case 'photos':
          return 'text-blue-400';
        case 'music':
          return 'text-purple-400';
        case 'avatar':
          return 'text-orange-400';
        case 'generate':
          return 'text-cyan-400';
        default:
          return 'text-white/80';
      }
    };

    const iconClass = `w-4 h-4 ${getIconColor()}`;

    switch (type) {
      case 'photos':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'music':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'avatar':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'generate':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const ActionButton = ({ 
    icon, 
    label, 
    onClick, 
    completed = false, 
    disabled = false, 
    primary = false,
    loading = false 
  }) => (
    <motion.button
      variants={itemVariants}
      whileHover={!disabled ? "hover" : "idle"}
      whileTap={!disabled ? "tap" : "idle"}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-row items-center justify-start px-2 py-1 rounded-lg border transition-all duration-300 space-x-2 whitespace-nowrap overflow-hidden
        ${primary && canGenerate ?
          'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400/50 shadow-lg shadow-blue-500/25' :
          completed ?
            'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 shadow-lg shadow-green-500/10' :
            'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        min-h-[32px] flex-1
      `}
    >

      {/* Loading Spinner */}
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
        </motion.div>
      )}

      <div className={`${loading ? 'opacity-30' : 'opacity-100'} transition-opacity duration-200 flex items-center justify-between w-full`}>
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <ButtonIcon type={icon} completed={completed} />
          </div>
          <span className={`text-xs font-medium truncate ${
            primary && canGenerate ? 'text-white' :
            completed ? 'text-green-400' : 'text-white/80'
          } sm:text-xs`}>
            {label}
          </span>
        </div>

        {/* Completion Checkmark - inline */}
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ml-1"
          >
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Hover Glow Effect */}
      {!disabled && (
        <motion.div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300"
          whileHover={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        />
      )}
    </motion.button>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xl mx-auto p-3"
    >
      {/* Button Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <ActionButton
          icon="photos"
          label={t('photosVideos')}
          onClick={onPhotosClick}
          completed={hasPhotos}
          disabled={isGenerating} // Disable during generation
        />

        <ActionButton
          icon="music"
          label={t('music')}
          onClick={onMusicClick}
          completed={hasMusic}
          disabled={isGenerating} // Disable during generation
        />

        <ActionButton
          icon="avatar"
          label={t('avatar')}
          onClick={onAvatarClick}
          completed={hasAvatar}
          disabled={isGenerating || !hasPhotos || !hasMusic}
        />

        <ActionButton
          icon="generate"
          label={t('generate')}
          onClick={onGenerateClick}
          disabled={!canGenerate}
          primary={true}
          loading={isGenerating}
        />
      </div>

      {/* Progress Indicator */}
      <motion.div 
        variants={itemVariants}
        className="mt-6 flex justify-center"
      >
        <div className="flex items-center space-x-2">
          {[hasPhotos, hasMusic, hasAvatar].map((completed, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                completed ? 'bg-green-400' : 'bg-white/20'
              }`}
              animate={{ scale: completed ? 1.2 : 1 }}
            />
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
};

export default BottomButtonBar;