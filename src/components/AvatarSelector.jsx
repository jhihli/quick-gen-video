import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import ConfirmationDialog from './ConfirmationDialog'

function AvatarSelector() {
  const {
    selectedAvatar,
    selectAvatar,
    hasGeneratedVideo,
    cleanupAndReset,
    avatarSettings,
    updateAvatarSettings,
    currentSlideIndex,
    photos
  } = useAppContext()
  const { t } = useLanguage()

  const [avatars, setAvatars] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Animated Avatar')
  const [hoveredAvatar, setHoveredAvatar] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [error, setError] = useState(null)

  // Fetch avatar data on component mount
  useEffect(() => {
    fetchAvatars()
  }, [])

  const fetchAvatars = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/avatars/avatars.json')

      if (!response.ok) {
        throw new Error(`Failed to load avatars: ${response.status}`)
      }

      const data = await response.json()
      setAvatars(data.avatars || [])
      setError(null)
    } catch (error) {
      console.error('Failed to fetch avatars:', error)
      setError(error.message)
      setAvatars([]) // Fallback to empty array
    } finally {
      setIsLoading(false)
    }
  }

  const processAvatarSelection = (avatar) => {
    const isAvatarSelected = selectedAvatar && selectedAvatar.id === avatar.id

    if (isAvatarSelected) {
      // Deselect avatar from current slide
      selectAvatar(null, currentSlideIndex)
    } else {
      // Select new avatar for current slide
      selectAvatar(avatar, currentSlideIndex)
    }
  }

  const handleAvatarSelect = (avatar) => {
    // Check if user has generated a video and is changing avatar selection
    if (hasGeneratedVideo && selectedAvatar?.id !== avatar.id) {
      setPendingAction(() => () => processAvatarSelection(avatar))
      setShowConfirmDialog(true)
      return
    }

    // If no video generated or deselecting same avatar, proceed normally
    processAvatarSelection(avatar)
  }

  const handleRemoveAvatar = () => {
    if (hasGeneratedVideo) {
      setPendingAction(() => () => selectAvatar(null, currentSlideIndex))
      setShowConfirmDialog(true)
      return
    }
    selectAvatar(null, currentSlideIndex)
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

  const getFilteredAvatars = () => {
    return avatars.filter(avatar => avatar.category === 'Animated Avatar')
  }

  return (
    <div className="space-y-6 w-full max-w-none mx-auto px-2 md:px-6 lg:px-8">

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Avatar Loading Error</h4>
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchAvatars}
                  className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-md text-red-300 text-xs transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="w-8 h-8 border-2 border-orange-400/30 border-t-orange-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="ml-3 text-orange-300">Loading avatars...</span>
        </div>
      )}

      {/* Avatar Grid */}
      <AnimatePresence mode="wait">
        {!isLoading && !error && (
          <motion.div
            key={`${activeCategory}-avatars`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getFilteredAvatars().length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
                {getFilteredAvatars().map((avatar, index) => {
                  const isSelected = selectedAvatar && selectedAvatar.id === avatar.id
                  const isHovered = hoveredAvatar === avatar.id

                  return (
                    <motion.div
                      key={avatar.id}
                      className="relative group cursor-pointer w-full"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05, type: "spring" }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      onMouseEnter={() => setHoveredAvatar(avatar.id)}
                      onMouseLeave={() => setHoveredAvatar(null)}
                    >
                      {/* Avatar Container - Redesigned for Desktop */}
                      <div
                        className={`relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl transition-all duration-300 transform w-full h-auto ${
                          isSelected
                            ? 'ring-4 ring-blue-400/60 shadow-blue-500/40 scale-[1.02]'
                            : 'hover:shadow-2xl hover:shadow-purple-500/20'
                        } backdrop-blur-sm border border-white/10`}
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${avatar.color}30, ${avatar.color}10, rgba(59, 130, 246, 0.1))`
                            : `linear-gradient(135deg, ${avatar.color}20, rgba(0,0,0,0.4))`
                        }}
                      >
                        {/* Avatar Preview - Minimal Padding */}
                        <div className="aspect-square bg-gray-800/50 flex items-center justify-center p-2 md:p-3 lg:p-3">
                          {avatar.type === 'webm' ? (
                            <div className="w-full h-full rounded-lg md:rounded-xl overflow-hidden relative bg-gray-700/50 flex items-center justify-center">
                              <video
                                src={avatar.source}
                                className="w-full h-full object-contain"
                                muted
                                loop
                                autoPlay
                                onError={(e) => {
                                  console.warn(`WebM preview failed for ${avatar.name}, using fallback`)
                                  e.target.style.display = 'none'
                                  const placeholder = document.createElement('div')
                                  placeholder.className = 'w-full h-full flex items-center justify-center rounded-lg'
                                  placeholder.style.background = avatar.color + '40'
                                  placeholder.innerHTML = `
                                    <div class="text-center p-2">
                                      <svg class="w-8 h-8 md:w-12 md:h-12 text-white/60 mx-auto mb-1 md:mb-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                      <div class="text-xs text-white/60">WebM Avatar</div>
                                    </div>
                                  `
                                  e.target.parentNode.appendChild(placeholder)
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full rounded-lg md:rounded-xl overflow-hidden relative bg-gray-700/50 flex items-center justify-center">
                              <img
                                src={avatar.thumbnail}
                                alt={avatar.name}
                                className="w-full h-full object-contain rounded-lg md:rounded-xl"
                              onError={(e) => {
                                // Fallback to colored placeholder
                                e.target.style.display = 'none'
                                const placeholder = document.createElement('div')
                                placeholder.className = 'w-full h-full flex items-center justify-center rounded-lg p-2'
                                placeholder.style.background = avatar.color + '40'
                                placeholder.innerHTML = `
                                  <svg class="w-8 h-8 md:w-12 md:h-12 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                  </svg>
                                `
                                e.target.parentNode.appendChild(placeholder)
                              }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Avatar Info - Optimized Text Layout */}
                        <div className="p-2 md:p-3 lg:p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent backdrop-blur-md border-t border-white/10 min-h-[3.5rem] md:min-h-[4rem] flex flex-col justify-center">
                          <h3 className="text-white font-semibold text-xs md:text-sm lg:text-sm mb-1 line-clamp-2 leading-tight" title="{avatar.name}">{avatar.name}</h3>
                          <p className="text-gray-300/70 text-xs md:text-xs lg:text-sm line-clamp-1 md:line-clamp-2 leading-tight opacity-90" title="{avatar.description}">{avatar.description}</p>
                        </div>

                        {/* Hover Effects - Improved */}
                        <motion.div
                          className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none"
                          whileHover={{
                            borderColor: avatar.color + '60',
                            boxShadow: `0 0 30px ${avatar.color}30`
                          }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Selection Indicator - Desktop Optimized */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
                          >
                            <svg className="w-4 h-4 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}

                        {/* Hover Glow Effect */}
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 rounded-2xl"
                            style={{
                              background: `radial-gradient(circle at center, ${avatar.color}15, transparent 70%)`
                            }}
                          />
                        )}

                        {/* Click Handler */}
                        <button
                          onClick={() => handleAvatarSelect(avatar)}
                          className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black rounded-xl"
                          aria-label={`Select ${avatar.name} avatar`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <h4 className="text-lg font-semibold text-white mb-2">No avatars available</h4>
                <p className="text-gray-400">Check back later for more avatar options.</p>
              </div>
            )}
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

export default AvatarSelector