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
    console.log('🎼 AppContext: selectMusic called with:', music);
    setSelectedMusic(music);
    console.log('🎼 AppContext: Music selection updated');
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

      console.log('Files cleaned up before reset');
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
    clearGenerationState();
  };

  const value = {
    // State
    photos,
    selectedMusic,
    generatedVideo,
    uploadMode,
    hasGeneratedVideo,
    musicActiveTab,
    currentPlayingTrack,

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