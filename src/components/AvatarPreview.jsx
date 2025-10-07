import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useDragControls } from 'framer-motion'
import { useAppContext } from '../context/AppContext'

function AvatarPreview({
  frameWidth = 288,
  frameHeight = 576
}) {
  const {
    selectedAvatar,
    avatarPosition,
    updateAvatarPosition,
    avatarSettings,
    updateAvatarSettings,
    currentSlideIndex,
    slideAvatars,
    slideAvatarPositions,
    slideAvatarSettings
  } = useAppContext()

  const [isDragging, setIsDragging] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [animationError, setAnimationError] = useState(false)

  const containerRef = useRef(null)
  const constraintRef = useRef(null)
  const dragControls = useDragControls()
  const isUpdatingPositionRef = useRef(false)

  // Motion values for drag position (top-left corner)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Get current avatar data - prioritize per-slide data
  const currentAvatar = slideAvatars[currentSlideIndex] || selectedAvatar
  const currentPosition = slideAvatarPositions[currentSlideIndex] || avatarPosition
  const currentSettings = slideAvatarSettings[currentSlideIndex] || avatarSettings

  // Avatar size calculation - MUST MATCH backend exactly
  const baseAvatarSize = currentAvatar?.type === 'webm' ? 160 : 80
  const videoScaleFactor = 1080 / frameWidth
  const videoAvatarSize = Math.round(baseAvatarSize * (currentSettings?.scale || 1))
  const avatarSize = Math.round(videoAvatarSize / videoScaleFactor)

  // Load position from context - FRAME-RELATIVE PERCENTAGES
  useEffect(() => {
    if (currentPosition && !isUpdatingPositionRef.current) {
      // Convert frame-relative percentage to pixel coordinates
      const centerX = (currentPosition.x / 100) * frameWidth
      const centerY = (currentPosition.y / 100) * frameHeight

      // Convert center to top-left for motion positioning
      const motionX = centerX - (avatarSize / 2)
      const motionY = centerY - (avatarSize / 2)

      x.set(motionX)
      y.set(motionY)
    }
  }, [currentPosition, frameWidth, frameHeight, avatarSize])

  // Save position to context - FRAME-RELATIVE PERCENTAGES
  const handleDragEnd = () => {
    const currentX = x.get()
    const currentY = y.get()

    // Motion values are top-left, convert to center
    const centerX = currentX + (avatarSize / 2)
    const centerY = currentY + (avatarSize / 2)

    // Clamp to frame bounds
    const minValid = avatarSize / 2
    const maxValidX = frameWidth - avatarSize / 2
    const maxValidY = frameHeight - avatarSize / 2

    const clampedCenterX = Math.max(minValid, Math.min(maxValidX, centerX))
    const clampedCenterY = Math.max(minValid, Math.min(maxValidY, centerY))

    // ROUND to integer pixels to avoid sub-pixel positioning issues
    const roundedCenterX = Math.round(clampedCenterX)
    const roundedCenterY = Math.round(clampedCenterY)

    // Convert to frame-relative percentages (SIMPLE!)
    const percentageX = (roundedCenterX / frameWidth) * 100
    const percentageY = (roundedCenterY / frameHeight) * 100

    // Update visual position with rounded values
    x.set(roundedCenterX - (avatarSize / 2))
    y.set(roundedCenterY - (avatarSize / 2))

    // Save to context
    isUpdatingPositionRef.current = true
    updateAvatarPosition({ x: percentageX, y: percentageY })
    setIsDragging(false)

    setTimeout(() => {
      isUpdatingPositionRef.current = false
    }, 100)
  }

  return (
    <div className="absolute inset-0">
      {!currentAvatar ? null : (
        <>
          {/* Constraint Container - full frame */}
          <div
            ref={constraintRef}
            className="absolute inset-0"
          >
            {/* Avatar Container */}
            <motion.div
              ref={containerRef}
              className="absolute pointer-events-auto"
              style={{
                x,
                y,
                left: 0,
                top: 0,
                width: avatarSize,
                height: avatarSize,
              }}
              drag
              dragControls={dragControls}
              dragMomentum={false}
              dragConstraints={constraintRef}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
            >
              {/* Avatar Visual */}
              <div className="relative w-full h-full">
                <div
                  className={`w-full h-full overflow-hidden shadow-2xl transition-all duration-200 ${
                    currentAvatar.type === 'webm' ? 'rounded-lg' : 'rounded-full border-2'
                  } ${
                    isDragging ? 'border-orange-400 shadow-orange-500/50' : 'border-white/30 shadow-black/50'
                  }`}
                  style={{
                    backgroundColor: currentAvatar.type === 'webm' ? 'transparent' : currentAvatar.color + '20',
                    backdropFilter: currentAvatar.type === 'webm' ? 'none' : 'blur(4px)'
                  }}
                >
                  {/* WebM Avatar */}
                  {currentAvatar.type === 'webm' ? (
                    <video
                      src={currentAvatar.source}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      onError={() => setAnimationError(true)}
                      onLoadedData={() => setAnimationError(false)}
                    />
                  ) : currentAvatar.thumbnail ? (
                    <img
                      src={currentAvatar.thumbnail}
                      alt={currentAvatar.name}
                      className="w-full h-full object-cover"
                      onError={() => setAnimationError(true)}
                      onLoad={() => setAnimationError(false)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: currentAvatar.color + '40' }}
                    >
                      <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                  )}

                  {/* Animation Indicator */}
                  {currentAvatar.type !== 'webm' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1">
                      <div className="flex items-center justify-center space-x-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: currentAvatar.color }}
                        />
                        <span className="text-white text-xs font-medium">
                          {currentSettings.animation?.toUpperCase() || 'IDLE'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Indicator */}
                {animationError && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                )}
              </div>

              {/* Control Panel for WebM */}
              {currentAvatar.type === 'webm' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: showControls || isDragging ? 1 : 0.3,
                    scale: showControls || isDragging ? 1 : 0.9
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-50"
                  style={{
                    bottom: '-56px',
                    left: '0px',
                    right: '0px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-md rounded-lg border border-cyan-400/20 p-2 shadow-xl">
                    <button
                      onClick={() => {
                        const newScale = Math.max(0.5, currentSettings.scale - 0.1)
                        updateAvatarSettings({ scale: parseFloat(newScale.toFixed(1)) })
                      }}
                      className="w-6 h-6 flex items-center justify-center text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13H5v-2h14v2z"/>
                      </svg>
                    </button>
                    <span className="text-cyan-400 text-xs font-medium leading-none min-w-[32px] text-center">
                      {Math.round(currentSettings.scale * 100)}%
                    </span>
                    <button
                      onClick={() => {
                        const newScale = Math.min(4.0, currentSettings.scale + 0.1)
                        updateAvatarSettings({ scale: parseFloat(newScale.toFixed(1)) })
                      }}
                      className="w-6 h-6 flex items-center justify-center text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Full control panel for other avatars */
                showControls && !isDragging && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 p-3 shadow-2xl z-50 min-w-[200px]"
                  >
                    <div className="text-center mb-3">
                      <h4 className="text-white font-medium text-sm">{currentAvatar.name}</h4>
                      <p className="text-gray-300 text-xs">{currentAvatar.category}</p>
                    </div>

                    {/* Scale Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs">Size:</span>
                        <span className="text-orange-400 text-xs">{Math.round(currentSettings.scale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={currentSettings.scale}
                        onChange={(e) => updateAvatarSettings({ scale: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Animation Control */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs">Animation:</span>
                      </div>
                      <select
                        value={currentSettings.animation}
                        onChange={(e) => updateAvatarSettings({ animation: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-400"
                      >
                        <option value="idle">🧘 Idle</option>
                        <option value="dance">💃 Dance</option>
                        <option value="clap">👏 Clap</option>
                        <option value="lipsync">🎤 Lip Sync</option>
                      </select>
                    </div>

                    {/* Sync to Music */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSettings.syncToMusic}
                          onChange={(e) => updateAvatarSettings({ syncToMusic: e.target.checked })}
                          className="rounded border-gray-600 text-orange-500 focus:ring-orange-400 focus:ring-offset-0"
                        />
                        <span className="text-white text-xs">🎵 Sync to Music</span>
                      </label>
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>
          </div>

          {/* Positioning Guidelines */}
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-400 transform -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-400 transform -translate-y-1/2" />
              {[25, 75].map(percent => (
                <React.Fragment key={percent}>
                  <div
                    className="absolute left-0 right-0 h-px bg-orange-400/30"
                    style={{ top: `${percent}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-orange-400/30"
                    style={{ left: `${percent}%` }}
                  />
                </React.Fragment>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default AvatarPreview
