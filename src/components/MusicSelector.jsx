import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import GlobalMusicPlayer from './GlobalMusicPlayer'
import ConfirmationDialog from './ConfirmationDialog'

function MusicSelector() {
  const { selectedMusic, selectMusic, hasGeneratedVideo, cleanupAndReset, musicActiveTab, setMusicActiveTab, currentPlayingTrack, setCurrentPlayingTrack } = useAppContext()
  const { t } = useLanguage()
  const activeTab = musicActiveTab
  const setActiveTab = setMusicActiveTab
  const [isUploading, setIsUploading] = useState(false)
  const [localMusic, setLocalMusic] = useState([])
  const [isLoadingLocal, setIsLoadingLocal] = useState(true)
  const [showGlobalPlayer, setShowGlobalPlayer] = useState(false)
  const [userLikes, setUserLikes] = useState(new Set()) // Track which songs user has liked
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  // Fetch local music files on component mount
  useEffect(() => {
    fetchLocalMusic()
  }, [])

  // Reset local music player state when global music state is cleared
  useEffect(() => {
    if (!selectedMusic) {
      // Global music was cleared (likely from confirmation dialog), reset local state
      setCurrentPlayingTrack(null)
      setShowGlobalPlayer(false)
    }
  }, [selectedMusic, setCurrentPlayingTrack])


  const fetchLocalMusic = async () => {
    try {
      setIsLoadingLocal(true)
      const response = await fetch('/api/local-music')
      const data = await response.json()
      
      if (response.ok) {
        setLocalMusic(data.music || [])
      } else {
        console.error('Failed to fetch local music:', data.error)
      }
    } catch (error) {
      console.error('Error fetching local music:', error)
    } finally {
      setIsLoadingLocal(false)
    }
  }

  const processFileUpload = async (file, inputElement) => {
    console.log('🎵 Starting music upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('music', file)
      
      // Add session ID for file tracking
      const sessionId = sessionStorage.getItem('tkvgen-session-id')
      if (sessionId) {
        formData.append('sessionId', sessionId)
      }

      console.log('📤 Sending upload request to /api/upload-music')
      const response = await fetch('/api/upload-music', {
        method: 'POST',
        body: formData
      })

      console.log('📥 Response received:', {
        status: response.status,
        ok: response.ok
      })

      const data = await response.json()
      console.log('📊 Response data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Select the uploaded music
      console.log('✅ Upload successful, selecting music:', data.music)
      selectMusic(data.music)
      console.log('🎉 Music selected successfully')
      
    } catch (error) {
      console.error('❌ Music upload error:', error)
      alert('❌ Failed to upload music: ' + error.message)
    } finally {
      setIsUploading(false)
      // Clear the input
      if (inputElement) inputElement.value = ''
      console.log('🔄 Upload process completed')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    console.log('📁 File selected:', file)
    
    if (!file) {
      console.log('❌ No file selected')
      return
    }

    // Check if user has generated a video and show confirmation
    if (hasGeneratedVideo) {
      setPendingAction(() => () => processFileUpload(file, e.target))
      setShowConfirmDialog(true)
      return
    }

    // If no video generated, proceed normally
    await processFileUpload(file, e.target)
  }

  const processMusicSelect = (music) => {
    // Use the same robust selection check as isSelected
    const isMusicSelected = selectedMusic && (
      selectedMusic.id === music.id ||
      selectedMusic.filename === music.filename ||
      selectedMusic.url === music.url ||
      (selectedMusic.originalname && selectedMusic.originalname === music.filename)
    );
    
    // If the music is already selected, remove it (deselect)
    if (isMusicSelected) {
      selectMusic(null)
    } else {
      // Otherwise, select the new music
      selectMusic(music)
    }
  }

  const handleMusicSelect = (music) => {
    // Check if user has generated a video and is changing music selection
    if (hasGeneratedVideo && selectedMusic?.id !== music.id) {
      setPendingAction(() => () => processMusicSelect(music))
      setShowConfirmDialog(true)
      return
    }

    // If no video generated or deselecting same music, proceed normally
    processMusicSelect(music)
  }

  const handleRowClick = (track) => {
    // If clicking the same track that's currently playing, just toggle the player
    if (currentPlayingTrack?.id === track.id && showGlobalPlayer) {
      setShowGlobalPlayer(false)
      setCurrentPlayingTrack(null)
      // Keep the music selected - don't unselect it
    } else {
      // Otherwise, play the new track and auto-select it
      setCurrentPlayingTrack(track)
      setShowGlobalPlayer(true)
      
      // Auto-select the music when user starts playing it (only if not already selected)
      if (selectedMusic?.id !== track.id) {
        if (hasGeneratedVideo) {
          // If user has generated video, show confirmation for music change
          setPendingAction(() => () => {
            selectMusic(track)
          })
          setShowConfirmDialog(true)
        } else {
          // No video generated, select music directly
          selectMusic(track)
        }
      }
    }
  }

  const handleLikeToggle = async (track, e) => {
    e.stopPropagation() // Prevent row click
    
    const isLiked = userLikes.has(track.filename)
    const action = isLiked ? 'unlike' : 'like'
    
    try {
      const response = await fetch('/api/local-music/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: track.filename,
          action: action
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Update user likes
        const newUserLikes = new Set(userLikes)
        if (action === 'like') {
          newUserLikes.add(track.filename)
        } else {
          newUserLikes.delete(track.filename)
        }
        setUserLikes(newUserLikes)
        
        // Update local music hot count
        setLocalMusic(prevMusic => 
          prevMusic.map(music => 
            music.filename === track.filename 
              ? { ...music, hotCount: data.hotCount }
              : music
          )
        )
      }
    } catch (error) {
      console.error('Like toggle error:', error)
    }
  }

  const handleConfirmAction = async () => {
    setShowConfirmDialog(false)
    if (pendingAction) {
      await cleanupAndReset() // Clear all data including video
      await pendingAction()
      setPendingAction(null)
    }
  }

  const handleCancelAction = () => {
    setShowConfirmDialog(false)
    setPendingAction(null)
  }

  const tabs = [
    { id: 'local', label: 'Library', icon: '🎵' },
    { id: 'upload', label: t('uploadMusic'), icon: '📁' }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <motion.div 
        className="inline-flex bg-gray-800/80 rounded-full p-1 border border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              // Check if user has generated a video and is switching tabs with music change
              if (hasGeneratedVideo && tab.id === 'local' && selectedMusic && selectedMusic.type === 'uploaded') {
                setPendingAction(() => () => {
                  setActiveTab(tab.id)
                  selectMusic(null)
                })
                setShowConfirmDialog(true)
                return
              }
              
              setActiveTab(tab.id)
              // Clear uploaded music when switching to music library
              if (tab.id === 'local' && selectedMusic && selectedMusic.type === 'uploaded') {
                selectMusic(null)
              }
            }}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? (tab.id === 'local' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg')
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'local' && (
          <motion.div
            key="local"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoadingLocal ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <span className="ml-3 text-purple-300">{t('loadingMusicLibrary')}</span>
              </div>
            ) : localMusic.length > 0 ? (
              <div className="space-y-4">
                {/* Modern Music Table (Similar to Spotify) */}
                <div className={`bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden ${showGlobalPlayer ? 'mb-4' : ''}`}>
                  {/* Table Title Header */}
                  <div className="px-4 py-3 border-b border-white/10 bg-gray-800/40">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <span className="mr-2">🎶</span>
                      Musics
                    </h4>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="divide-y divide-white/5">
                    {localMusic.map((track, index) => {
                      // More robust selection check - compare by ID, filename, or URL
                      const isSelected = selectedMusic && (
                        selectedMusic.id === track.id ||
                        selectedMusic.filename === track.filename ||
                        selectedMusic.url === track.url ||
                        (selectedMusic.originalname && selectedMusic.originalname === track.filename)
                      );
                      const isCurrentPlaying = currentPlayingTrack?.id === track.id;
                      const isLiked = userLikes.has(track.filename);
                      
                      return (
                        <motion.div
                          key={track.id}
                          onClick={() => handleRowClick(track)}
                          className={`grid grid-cols-12 gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                            isSelected ? 'bg-purple-500/20 border-l-4 border-l-purple-400' : ''
                          } ${isCurrentPlaying ? 'bg-green-500/10' : ''}`}
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                          {/* Track Info */}
                          <div className="col-span-6 flex items-center min-w-0">
                            {isCurrentPlaying && (
                              <motion.div className="flex space-x-1 mr-2">
                                <motion.div 
                                  className="w-1 bg-green-400 rounded-full"
                                  animate={{ height: [4, 12, 4] }}
                                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                />
                                <motion.div 
                                  className="w-1 bg-green-400 rounded-full"
                                  animate={{ height: [8, 4, 8] }}
                                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
                                />
                                <motion.div 
                                  className="w-1 bg-green-400 rounded-full"
                                  animate={{ height: [4, 10, 4] }}
                                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 0.4 }}
                                />
                              </motion.div>
                            )}
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded flex items-center justify-center mr-2 flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-xs font-medium truncate">{track.title}</p>
                            </div>
                          </div>
                          
                          {/* Duration */}
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="text-xs text-gray-400">{track.durationFormatted}</span>
                          </div>
                          
                          {/* Hot Count with Heart */}
                          <div className="col-span-1 flex items-center justify-center space-x-1">
                            <motion.button
                              onClick={(e) => handleLikeToggle(track, e)}
                              className="p-0.5 rounded-full transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg 
                                className={`w-3 h-3 transition-colors ${
                                  isLiked ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'
                                }`} 
                                fill={isLiked ? "currentColor" : "none"}
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </motion.button>
                            <span className="text-xs text-gray-400 min-w-[1.5rem] text-center">
                              {track.hotCount}
                            </span>
                          </div>
                          
                          {/* Modern Icon Select Button */}
                          <div className="col-span-3 flex items-center justify-end pr-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMusicSelect(track);
                              }}
                              className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
                                  : 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 hover:from-purple-600 hover:via-purple-500 hover:to-blue-500 shadow-md hover:shadow-lg hover:shadow-purple-500/20'
                              }`}
                              whileHover={{ 
                                scale: 1.1,
                                rotate: isSelected ? 0 : 5
                              }}
                              whileTap={{ scale: 0.9 }}
                              title={isSelected ? t('musicSelected') : t('selectMusic')}
                            >
                              <AnimatePresence mode="wait">
                                {isSelected ? (
                                  <motion.div
                                    key="selected"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ duration: 0.3, type: "spring" }}
                                    className="relative"
                                  >
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                    <motion.div
                                      className="absolute inset-0 rounded-full bg-white/20"
                                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="unselected"
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: -180 }}
                                    transition={{ duration: 0.3, type: "spring" }}
                                  >
                                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              
                              {/* Hover ring effect */}
                              <motion.div
                                className="absolute inset-0 rounded-lg border-2 border-transparent"
                                whileHover={{
                                  borderColor: isSelected ? "rgba(34, 197, 94, 0.6)" : "rgba(147, 51, 234, 0.6)",
                                  boxShadow: isSelected 
                                    ? "0 0 20px rgba(34, 197, 94, 0.3)" 
                                    : "0 0 20px rgba(147, 51, 234, 0.3)"
                                }}
                                transition={{ duration: 0.2 }}
                              />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                {showGlobalPlayer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 relative z-10"
                  >
                    <GlobalMusicPlayer
                      currentTrack={currentPlayingTrack}
                      isVisible={showGlobalPlayer}
                      inline={true}
                    />
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎵</div>
                <h4 className="text-lg font-semibold text-white mb-2">{t('noLocalMusicFound')}</h4>
                <p className="text-gray-400">{t('addMusicFiles')}</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Show uploaded music if one is selected */}
            {selectedMusic && selectedMusic.type === 'uploaded' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-900/30 via-emerald-800/20 to-teal-900/30 backdrop-blur-xl border border-green-300/20 rounded-2xl p-4 mb-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">✅ {selectedMusic.originalname} ({(selectedMusic.size / (1024 * 1024)).toFixed(2)} MB)</h4>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => {
                      if (hasGeneratedVideo) {
                        setPendingAction(() => () => selectMusic(null))
                        setShowConfirmDialog(true)
                        return
                      }
                      selectMusic(null)
                    }}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-md text-red-300 text-xs transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('remove')}
                  </motion.button>
                </div>
              </motion.div>
            ) : null}

            {/* Upload area */}
            <motion.div 
              className="border-2 border-dashed border-purple-400/50 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-400/5 transition-all duration-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="h-6 w-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </motion.div>
                  <h4 className="text-sm font-semibold text-white">
                    {selectedMusic && selectedMusic.type === 'uploaded' ? t('uploadDifferentMusic') : t('uploadYourMusic')}
                  </h4>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input 
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-300 
                      file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 
                      file:text-sm file:font-semibold file:bg-gradient-to-r 
                      file:from-purple-600 file:to-pink-600 file:text-white 
                      file:shadow-lg file:cursor-pointer
                      hover:file:from-purple-700 hover:file:to-pink-700 
                      file:transition-all file:duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                      cursor-pointer"
                  />
                </motion.div>
                
                <AnimatePresence mode="wait">
                  {isUploading && (
                    <motion.p 
                      key="uploading"
                      className="text-sm text-purple-300 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        🎵 {t('uploadingTrack')}
                      </motion.span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        type="warning"
        title="Clear Current Data?"
        message="You have a generated video that will be lost. This action will clear all your current photos, music, and generated video.

Are you sure you want to continue?"
        confirmText="Yes, Clear Data"
        cancelText="Cancel"
      />
    </div>
  )
}

export default MusicSelector