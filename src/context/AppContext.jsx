import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [photos, setPhotos] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [uploadMode, setUploadMode] = useState('photos'); // 'photos' or 'videos', default to photos
  const [hasGeneratedVideo, setHasGeneratedVideo] = useState(false); // Track if user has generated a video
  const [musicActiveTab, setMusicActiveTab] = useState('local'); // MusicSelector tab state
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState(null); // Currently playing track

  // Per-slide Avatar state - Virtual Duet Mode
  const [slideAvatars, setSlideAvatars] = useState({}); // Per-slide avatar data: { slideIndex: avatarData }
  const [slideAvatarPositions, setSlideAvatarPositions] = useState({}); // Per-slide positions: { slideIndex: {x, y} }
  const [slideAvatarSettings, setSlideAvatarSettings] = useState({}); // Per-slide settings: { slideIndex: {scale, animation, syncToMusic} }
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // Currently viewing slide index

  // Legacy compatibility - current slide avatar data
  const selectedAvatar = slideAvatars[currentSlideIndex] || null;
  const avatarPosition = slideAvatarPositions[currentSlideIndex] || { x: 50, y: 70 };
  const avatarSettings = slideAvatarSettings[currentSlideIndex] || {
    scale: 2.0,
    animation: 'idle',
    syncToMusic: true
  };


  // Video generation state - persistent across component mounts
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  const addPhotos = (newPhotos) => {
    setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
  };

  const clearPhotos = () => {
    setPhotos([]);
  };

  const selectMusic = (music) => {
    setSelectedMusic(music);
  };

  const clearMusic = () => {
    setSelectedMusic(null);
  };

  const setVideo = (videoData) => {
    setGeneratedVideo(videoData);
    setHasGeneratedVideo(true);
  };

  const clearVideo = () => {
    setGeneratedVideo(null);
    setHasGeneratedVideo(false);
  };

  // Clear generation state
  const clearGenerationState = () => {
    setIsProcessing(false);
    setGenerationProgress(0);
    setCurrentJobId(null);
    setGenerationError(null);
  };

  const cleanupAndReset = async () => {
    // Cleanup files before clearing state
    try {
      const filesToCleanup = {
        photos: photos,
        videos: generatedVideo ? [generatedVideo] : [],
        music: selectedMusic ? [selectedMusic] : []
      };

      await fetch('/api/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filesToCleanup)
      });

    } catch (error) {
      console.error('Cleanup before reset failed:', error);
    }

    // Clear all state including generation state
    setPhotos([]);
    setSelectedMusic(null);
    setGeneratedVideo(null);
    setHasGeneratedVideo(false);
    setUploadMode('photos'); // Reset to default mode
    setMusicActiveTab('upload');
    setCurrentPlayingTrack(null);
    clearAllAvatars(); // Reset all avatar state
    // Reset emoji state removed
    setCurrentSlideIndex(0); // Reset to first slide
    clearGenerationState();
  };

  // Per-slide Avatar functions
  const selectAvatar = (avatarData, slideIndex = currentSlideIndex) => {

    if (avatarData) {
      setSlideAvatars(prev => ({
        ...prev,
        [slideIndex]: avatarData
      }));

      // Set default position if not already set
      if (!slideAvatarPositions[slideIndex]) {
        setSlideAvatarPositions(prev => ({
          ...prev,
          [slideIndex]: { x: 50, y: 70 }
        }));
      }

      // Set default settings if not already set
      if (!slideAvatarSettings[slideIndex]) {
        setSlideAvatarSettings(prev => ({
          ...prev,
          [slideIndex]: {
            scale: 2.0,
            animation: 'idle',
            syncToMusic: true
          }
        }));
      }
    } else {
      // Clear avatar for this slide
      clearAvatar(slideIndex);
    }
  };

  const clearAvatar = (slideIndex = currentSlideIndex) => {
    setSlideAvatars(prev => {
      const newAvatars = { ...prev };
      delete newAvatars[slideIndex];
      return newAvatars;
    });
    setSlideAvatarPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[slideIndex];
      return newPositions;
    });
    setSlideAvatarSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[slideIndex];
      return newSettings;
    });
  };

  const clearAllAvatars = () => {
    setSlideAvatars({});
    setSlideAvatarPositions({});
    setSlideAvatarSettings({});
  };

  const updateAvatarPosition = (position, slideIndex = currentSlideIndex) => {
    setSlideAvatarPositions(prev => ({
      ...prev,
      [slideIndex]: position
    }));
  };

  const updateAvatarSettings = (settings, slideIndex = currentSlideIndex) => {
    setSlideAvatarSettings(prev => ({
      ...prev,
      [slideIndex]: { ...prev[slideIndex], ...settings }
    }));
  };

  const setCurrentSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  // Check if any slide has avatars (for auto-slideshow control)
  const hasAnyAvatars = Object.keys(slideAvatars).length > 0;


  const value = {
    // State
    photos,
    selectedMusic,
    generatedVideo,
    uploadMode,
    hasGeneratedVideo,
    musicActiveTab,
    currentPlayingTrack,

    // Per-slide Avatar state
    slideAvatars,
    slideAvatarPositions,
    slideAvatarSettings,
    currentSlideIndex,
    hasAnyAvatars,

    // Legacy compatibility
    selectedAvatar,
    avatarPosition,
    avatarSettings,


    // Video generation state
    isProcessing,
    generationProgress,
    currentJobId,
    generationError,

    // Actions
    addPhotos,
    removePhoto,
    clearPhotos,
    selectMusic,
    clearMusic,
    setVideo,
    clearVideo,
    cleanupAndReset,
    setUploadMode,
    setMusicActiveTab,
    setCurrentPlayingTrack,

    // Per-slide Avatar actions
    selectAvatar,
    clearAvatar,
    clearAllAvatars,
    updateAvatarPosition,
    updateAvatarSettings,
    setCurrentSlide,


    // Generation actions
    setIsProcessing,
    setGenerationProgress,
    setCurrentJobId,
    setGenerationError,
    clearGenerationState
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext };