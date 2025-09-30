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
    slideAvatarSettings,
    photos
  } = useAppContext()

  const [isDragging, setIsDragging] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [animationError, setAnimationError] = useState(false)

  const containerRef = useRef(null)
  const constraintRef = useRef(null)
  const dragControls = useDragControls()
  const isUpdatingPositionRef = useRef(false)

  // Motion values for drag position
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Get current avatar data - prioritize per-slide data over legacy single avatar
  const currentAvatar = slideAvatars[currentSlideIndex] || selectedAvatar;
  const currentPosition = slideAvatarPositions[currentSlideIndex] || avatarPosition;
  const currentSettings = slideAvatarSettings[currentSlideIndex] || avatarSettings;

  // Direct coordinate mapping without letterboxing offsets (matches backend exactly)
  const letterboxOffsets = { offsetX: 0, offsetY: 0 };

  // Initialize position based on context - SIMPLIFIED to match backend exactly
  useEffect(() => {
    if (currentPosition && !isUpdatingPositionRef.current) {
      // Convert percentage directly to absolute coordinates (matching backend exactly)
      const absoluteX = (currentPosition.x / 100) * frameWidth
      const absoluteY = (currentPosition.y / 100) * frameHeight

      // Calculate final position including centering offset (matching backend FFmpeg logic)
      // Backend: centerCoords - avatarSize/2 = top-left coordinates
      // Frontend: centerCoords - avatarSize/2 = motion position (no CSS left/top conflicts)
      const motionX = absoluteX - (avatarSize / 2)
      const motionY = absoluteY - (avatarSize / 2)

      console.log(`🎯 PREVIEW COORDINATES [${Date.now()}]: Input: ${currentPosition.x}%, ${currentPosition.y}% → Center: ${absoluteX}px, ${absoluteY}px → Motion: ${motionX}px, ${motionY}px`);
      console.log(`🎯 PREVIEW FRAME [${Date.now()}]: ${frameWidth}x${frameHeight}, Avatar size: ${avatarSize}px, Motion positioning`);

      x.set(motionX)
      y.set(motionY)
    }
  }, [currentPosition, frameWidth, frameHeight])

  // Handle drag end - convert top-left position back to center percentage
  const handleDragEnd = () => {
    const currentX = x.get()
    const currentY = y.get()

    // Motion values are now top-left coordinates, convert back to center coordinates
    const centerX = currentX + (avatarSize / 2)
    const centerY = currentY + (avatarSize / 2)

    // Convert center coordinates to percentage (matching video processors exactly)
    const percentageX = (centerX / frameWidth) * 100
    const percentageY = (centerY / frameHeight) * 100

    console.log(`🎯 DRAG END: Motion: ${currentX}px, ${currentY}px → Center: ${centerX}px, ${centerY}px → Output: ${percentageX.toFixed(2)}%, ${percentageY.toFixed(2)}%`);

    // Handle boundary cases - keep avatar center within frame bounds
    let clampedX = percentageX
    let clampedY = percentageY

    // Calculate valid percentage range for avatar center
    const minValidX = ((avatarSize / 2) / frameWidth) * 100; // Left edge: avatar half-width from left
    const maxValidX = ((frameWidth - avatarSize / 2) / frameWidth) * 100; // Right edge: avatar half-width from right
    const minValidY = ((avatarSize / 2) / frameHeight) * 100; // Top edge: avatar half-height from top
    const maxValidY = ((frameHeight - avatarSize / 2) / frameHeight) * 100; // Bottom edge: avatar half-height from bottom

    // Clamp to valid ranges
    clampedX = Math.max(minValidX, Math.min(maxValidX, percentageX))
    clampedY = Math.max(minValidY, Math.min(maxValidY, percentageY))

    // Convert clamped percentage back to center coordinates, then to top-left motion coordinates
    const clampedCenterX = (clampedX / 100) * frameWidth
    const clampedCenterY = (clampedY / 100) * frameHeight

    // Convert center to top-left coordinates for motion positioning
    const clampedMotionX = clampedCenterX - (avatarSize / 2)
    const clampedMotionY = clampedCenterY - (avatarSize / 2)

    // Set visual position immediately (top-left motion coordinates)
    x.set(clampedMotionX)
    y.set(clampedMotionY)

    // Block useEffect temporarily to prevent interference
    isUpdatingPositionRef.current = true

    // Update context
    updateAvatarPosition({ x: clampedX, y: clampedY })
    setIsDragging(false)

    // Unblock useEffect after context update is processed
    setTimeout(() => {
      isUpdatingPositionRef.current = false
    }, 100)
  }

  // Avatar size calculation - MUST MATCH video processors exactly
  // Video processors use: baseAvatarSize * currentSettings.scale
  // Preview must use the same calculation to ensure WYSIWYG accuracy
  const baseAvatarSize = currentAvatar?.type === 'webm' ? 160 : 80
  const videoScaleFactor = 1080 / frameWidth // 3.75 for default 288px frame

  // Match video processor calculation exactly, then scale down for preview frame
  const videoAvatarSize = Math.round(baseAvatarSize * (currentSettings?.scale || 1))
  const avatarSize = Math.round(videoAvatarSize / videoScaleFactor)


  // Calculate constraint dimensions - use full frame to match video processor
  // The video processor places avatars anywhere within the full 1080x1920 frame
  // Preview should match this behavior for accurate WYSIWYG positioning
  const constraintWidth = frameWidth;
  const constraintHeight = frameHeight;

  console.log(`🎯 CONSTRAINT - Full frame: ${constraintWidth}x${constraintHeight}px`);

  return (
    <div className="absolute inset-0">
      {!currentAvatar ? null : (
        <>
      {/* Constraint Container - simplified absolute positioning */}
      <div
        ref={constraintRef}
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: constraintWidth,
          height: constraintHeight,
        }}
      >
        {/* Avatar Container - pure motion positioning (no CSS conflicts) */}
        <motion.div
          ref={containerRef}
          className="absolute pointer-events-auto"
          style={{
            x,
            y,
            left: 0,  // No CSS offset - positioning handled by motion values
            top: 0,   // No CSS offset - positioning handled by motion values
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
        animate={{
          scale: isDragging ? 1.1 : 1.0,
          rotate: isDragging ? [0, 5, -5, 0] : 0
        }}
        transition={{
          scale: { duration: 0.2 },
          rotate: { duration: 0.5, repeat: isDragging ? Infinity : 0 }
        }}
      >
        {/* Avatar Visual */}
        <div className="relative w-full h-full">
          {/* Main Avatar Display */}
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
            {/* WebM Avatar - Video */}
            {currentAvatar.type === 'webm' ? (
              <video
                src={currentAvatar.source}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  animationError ? 'opacity-50' : 'opacity-100'
                }`}
                muted
                loop
                autoPlay
                onError={() => setAnimationError(true)}
                onLoadedData={() => setAnimationError(false)}
              />
            ) : currentAvatar.thumbnail ? (
              /* Static Avatar - Thumbnail */
              <img
                src={currentAvatar.thumbnail}
                alt={currentAvatar.name}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  animationError ? 'opacity-50' : 'opacity-100'
                }`}
                onError={() => setAnimationError(true)}
                onLoad={() => setAnimationError(false)}
              />
            ) : (
              /* Fallback Avatar - Color with Icon */
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: currentAvatar.color + '40' }}
              >
                <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
            )}

            {/* Animation Indicator - Only for non-WebM avatars */}
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

        {/* Control Panel Based on Avatar Type */}
        {currentAvatar.type === 'webm' ? (
          // Horizontal Size Control under Avatar for WebM Avatars
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
            {/* Horizontal size control */}
            <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-md rounded-lg border border-cyan-400/20 p-2 shadow-xl">
              {/* Down arrow button */}
              <button
                onClick={() => {
                  const newScale = Math.max(0.5, currentSettings.scale - 0.1);
                  updateAvatarSettings({ scale: parseFloat(newScale.toFixed(1)) });
                }}
                className="w-6 h-6 flex items-center justify-center text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>

              {/* Size percentage */}
              <span className="text-cyan-400 text-xs font-medium leading-none min-w-[32px] text-center">
                {Math.round(currentSettings.scale * 100)}%
              </span>

              {/* Up arrow button */}
              <button
                onClick={() => {
                  const newScale = Math.min(4.0, currentSettings.scale + 0.1);
                  updateAvatarSettings({ scale: parseFloat(newScale.toFixed(1)) });
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
          // Full control panel for other avatar types
          showControls && !isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 p-3 shadow-2xl z-50 min-w-[200px]"
            >
              {/* Avatar Info */}
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
                  style={{
                    background: `linear-gradient(to right, ${currentAvatar.color} 0%, ${currentAvatar.color} ${((currentSettings.scale - 0.5) / 3.5) * 100}%, #4b5563 ${((currentSettings.scale - 0.5) / 3.5) * 100}%, #4b5563 100%)`
                  }}
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

              {/* Sync to Music Toggle */}
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

              {/* Position Info */}
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <p className="text-gray-400 text-xs">
                  Position: {Math.round(currentPosition.x)}%, {Math.round(currentPosition.y)}%
                </p>
              </div>
            </motion.div>
          )
        )}

      </motion.div>

      </div> {/* Close constraint container */}

      {/* Positioning Guidelines (only when dragging) */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Center Guidelines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-400 transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-400 transform -translate-y-1/2" />

          {/* Grid Lines */}
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