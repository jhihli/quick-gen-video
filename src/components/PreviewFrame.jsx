import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAppContext } from '../context/AppContext';
import AvatarPreview from './AvatarPreview';
import { calculateLetterbox } from '../lib/letterboxUtils';

const PreviewFrame = ({
  mode = 'default', // 'default', 'photos', 'video'
  photos = [],
  videoData = null,
  selectedMusic = null
}) => {
  const { t } = useLanguage();
  const { selectedAvatar, currentSlideIndex, slideAvatars, setCurrentSlide, isProcessing, generationProgress } = useAppContext();

  // Slideshow state - moved to top level to follow Rules of Hooks
  const [autoSlideshow, setAutoSlideshow] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto slideshow for multiple photos
  useEffect(() => {
    if (photos.length > 1 && autoSlideshow) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % photos.length);
      }, 3000); // 3 second intervals
      setSlideshowInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        setSlideshowInterval(null);
      }
    }
  }, [photos.length, autoSlideshow, setCurrentSlide, slideshowInterval]);

  // Navigation functions
  const goToPreviousSlide = () => {
    if (autoSlideshow) setAutoSlideshow(false);
    setCurrentSlide(currentSlideIndex > 0 ? currentSlideIndex - 1 : photos.length - 1);
  };

  const goToNextSlide = () => {
    if (autoSlideshow) setAutoSlideshow(false);
    setCurrentSlide((currentSlideIndex + 1) % photos.length);
  };

  const goToSlide = (index) => {
    if (autoSlideshow) setAutoSlideshow(false);
    setCurrentSlide(index);
  };

  const toggleAutoSlideshow = () => {
    setAutoSlideshow(!autoSlideshow);
  };

  // Default frame state - moved to top level to follow Rules of Hooks
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const isVideoFile = (photo) => {
    if (!photo) return false;

    // Check originalname first
    if (photo.originalname) {
      const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.flv'];
      return videoExtensions.some(ext => photo.originalname.toLowerCase().includes(ext));
    }

    // Check URL path
    if (photo.url && photo.url.includes('videos')) {
      return true;
    }

    // Check validation result
    if (photo.validationResult && photo.validationResult.typeValidation &&
      photo.validationResult.typeValidation.detectedType &&
      typeof photo.validationResult.typeValidation.detectedType === 'string' &&
      photo.validationResult.typeValidation.detectedType.startsWith('video/')) {
      return true;
    }

    // Check if it's a File object with video type
    if (photo instanceof File && photo.type.startsWith('video/')) {
      return true;
    }

    return false;
  };

  const renderDefaultFrame = () => {

    return (
      <motion.div
        className="relative w-full max-w-none mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* iPhone Frame for Default Mode */}
        <div className="flex items-center justify-center">
          <div className="bg-black rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative mx-auto shadow-2xl" style={{ width: '360px', height: '640px' }}>
            <div
              className="aspect-none bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center relative overflow-hidden group w-full h-full cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Animated Video Background Effect */}
              <div className="absolute inset-0">
                {/* Moving gradient waves */}
                <motion.div
                  className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-20' : 'opacity-10'}`}
                  animate={{
                    background: isHovered ? [
                      'linear-gradient(45deg, rgba(59, 130, 246, 0.4) 0%, transparent 20%, rgba(168, 85, 247, 0.4) 60%, transparent 100%)',
                      'linear-gradient(45deg, transparent 0%, rgba(168, 85, 247, 0.4) 20%, transparent 60%, rgba(59, 130, 246, 0.4) 100%)',
                      'linear-gradient(45deg, rgba(59, 130, 246, 0.4) 0%, transparent 20%, rgba(168, 85, 247, 0.4) 60%, transparent 100%)'
                    ] : [
                      'linear-gradient(45deg, rgba(59, 130, 246, 0.2) 0%, transparent 30%, rgba(168, 85, 247, 0.2) 70%, transparent 100%)',
                      'linear-gradient(45deg, transparent 0%, rgba(168, 85, 247, 0.2) 30%, transparent 70%, rgba(59, 130, 246, 0.2) 100%)',
                      'linear-gradient(45deg, rgba(59, 130, 246, 0.2) 0%, transparent 30%, rgba(168, 85, 247, 0.2) 70%, transparent 100%)'
                    ]
                  }}
                  transition={{
                    duration: isHovered ? 4 : 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Interactive Mouse Ripples */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute pointer-events-none"
                      style={{
                        left: mouseX,
                        top: mouseY,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Ripple Effects */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={`ripple-${i}`}
                          className="absolute border border-blue-400/20 rounded-full"
                          animate={{
                            scale: [0, 2, 0],
                            opacity: [0.8, 0.2, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeOut",
                          }}
                          style={{
                            width: '40px',
                            height: '40px',
                            left: '-20px',
                            top: '-20px',
                          }}
                        />
                      ))}

                      {/* Mouse Glow */}
                      <motion.div
                        className="absolute w-20 h-20 rounded-full blur-2xl"
                        style={{
                          left: '-40px',
                          top: '-40px',
                        }}
                        animate={{
                          background: [
                            'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Realistic Meteor Shower Animation */}
                <AnimatePresence mode="wait">
                  {isHovered && (
                    <motion.div
                      key="meteor-shower"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                    >
                      {[...Array(15)].map((_, i) => (
                        <span
                          key={`meteor-${i}-${Date.now()}`}
                          className="animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-full bg-slate-300 shadow-[0_0_0_1px_#ffffff20] rotate-[215deg] before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-slate-300 before:to-transparent"
                          style={{
                            top: Math.random() * 100 + '%',
                            left: Math.floor(Math.random() * (400 - (-400)) + (-400)) + 'px',
                            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
                            animationDuration: Math.floor(Math.random() * (6 - 2) + 2) + 's',
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interactive Particles */}
                {[...Array(15)].map((_, i) => {
                  const initialX = Math.random() * 400;
                  const initialY = Math.random() * 300;

                  return (
                    <motion.div
                      key={`particle-${i}`}
                      className={`absolute w-1 h-1 rounded-full ${isHovered ? 'bg-blue-400/60' : 'bg-blue-400/30'}`}
                      style={{
                        left: `${initialX}px`,
                        top: `${initialY}px`,
                      }}
                      animate={isHovered ? {
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 1, 0.6],
                      } : {
                        x: [0, Math.random() * 20 - 10, 0],
                        y: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: isHovered ? 2 : 4 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                    />
                  );
                })}

                {/* Animated mesh pattern */}
                <motion.div
                  className="absolute inset-0 opacity-5"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 1px, transparent 1px),
                                   radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                      backgroundSize: '40px 40px, 60px 60px'
                    }}
                  />
                </motion.div>
              </div>

              {/* Central Video Icon with Enhanced Animation */}
              <div className="relative z-20 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Pulsing outer ring */}
                  <motion.div
                    className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-blue-400/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />

                  {/* Enhanced Icon Container */}
                  <motion.div
                    className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.3)',
                        '0 0 40px rgba(168, 85, 247, 0.3)',
                        '0 0 20px rgba(59, 130, 246, 0.3)'
                      ]
                    }}
                    transition={{
                      boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      scale: { duration: 0.2 }
                    }}
                  >
                    <motion.svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </motion.svg>
                  </motion.div>

                  {/* Dynamic glow effect */}
                  <motion.div
                    className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl blur-xl"
                    animate={{
                      background: [
                        'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                        'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                        'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </motion.div>
              </div>

              {/* Enhanced Ambient Effects */}
              <motion.div
                className="absolute top-8 left-8 w-24 h-24 rounded-full blur-3xl"
                animate={{
                  background: [
                    'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                  ]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-8 right-8 w-20 h-20 rounded-full blur-2xl"
                animate={{
                  background: [
                    'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)'
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />

              {/* Interactive hover effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-all duration-700"
                whileHover={{ opacity: 1 }}
              />

              {/* Avatar Preview Overlay - Show in default mode when avatar is selected */}
              {(selectedAvatar || (slideAvatars && slideAvatars[currentSlideIndex])) && (
                <div className="absolute inset-0">
                  <AvatarPreview
                    frameWidth={360} // Divides 1080 evenly (scale factor 3.0)
                    frameHeight={640} // Divides 1920 evenly (scale factor 3.0)
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPhotoFrame = () => (
    <div className="relative w-full max-w-none mx-auto">
      {/* iPhone Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Dynamic Island */}
        <div className="relative">
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-20"></div>
        </div>

        {/* Container for iPhone frame and external navigation */}
        <div className="relative flex items-center justify-center">
          {/* Previous Button - Desktop Only, Outside Frame */}
          {photos.length > 1 && (
            <motion.button
              onClick={goToPreviousSlide}
              className="hidden md:flex absolute left-[-4rem] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white/20 transition-all z-20 border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}

          <div className="bg-black rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative mx-auto shadow-2xl" style={{ width: '360px', height: '640px' }}>
            {photos.length > 0 ? (
              /* Current Media Preview - Video or Image */
              <AnimatePresence mode="wait">
                <motion.div
                  key={`slide-${currentSlideIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(event, info) => {
                    // Only enable swipe on mobile (when navigation buttons are hidden)
                    const isMobile = window.innerWidth < 768;
                    if (isMobile && photos.length > 1) {
                      if (info.offset.x > 50) {
                        goToPreviousSlide();
                      } else if (info.offset.x < -50) {
                        goToNextSlide();
                      }
                    }
                  }}
                >
                  {/* FFmpeg-exact letterboxing wrapper */}
                  {(() => {
                    const currentPhoto = photos[currentSlideIndex];
                    const letterbox = calculateLetterbox(
                      currentPhoto?.width,
                      currentPhoto?.height,
                      360, // frame width (divides 1080 evenly)
                      640 // frame height (divides 1920 evenly)
                    );

                    return (
                      <div className="relative w-full h-full bg-black">
                        {isVideoFile(photos[currentSlideIndex]) ? (
                          <video
                            key={`video-${currentSlideIndex}`}
                            src={photos[currentSlideIndex] instanceof File ? URL.createObjectURL(photos[currentSlideIndex]) : (photos[currentSlideIndex].url || photos[currentSlideIndex])}
                            className="absolute"
                            style={{
                              width: `${letterbox.width}px`,
                              height: `${letterbox.height}px`,
                              left: `${letterbox.left}px`,
                              top: `${letterbox.top}px`,
                              objectFit: 'fill'
                            }}
                            muted
                            preload="metadata"
                      onError={(e) => {
                        console.error('Video load error:', e);
                        // Fallback to showing error message
                        e.target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'w-full h-full flex items-center justify-center bg-gray-800';
                        errorDiv.innerHTML = `
                          <div class="text-center text-gray-400">
                            <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                            <p class="text-sm">Video Preview Unavailable</p>
                          </div>
                        `;
                        e.target.parentNode.appendChild(errorDiv);
                      }}
                            />
                          ) : (
                            <img
                              key={`image-${currentSlideIndex}`}
                              src={photos[currentSlideIndex] instanceof File ? URL.createObjectURL(photos[currentSlideIndex]) : (photos[currentSlideIndex].url || photos[currentSlideIndex])}
                              alt={`Preview ${currentSlideIndex + 1}`}
                              className="absolute"
                              style={{
                                width: `${letterbox.width}px`,
                                height: `${letterbox.height}px`,
                                left: `${letterbox.left}px`,
                                top: `${letterbox.top}px`,
                                objectFit: 'fill'
                              }}
                      onError={(e) => {
                        console.error('Image load error:', e);
                        // Try as video if image fails
                        const videoElement = document.createElement('video');
                        videoElement.src = photos[currentSlideIndex] instanceof File ? URL.createObjectURL(photos[currentSlideIndex]) : (photos[currentSlideIndex].url || photos[currentSlideIndex]);
                        videoElement.className = 'w-full h-full object-contain bg-black';
                        videoElement.muted = true;
                        videoElement.preload = 'metadata';

                        // Replace img with video
                        const container = e.target.parentNode;
                        e.target.style.display = 'none';
                        container.appendChild(videoElement);

                        // If video also fails, show error
                        videoElement.onerror = () => {
                          console.error('Both image and video failed');
                          videoElement.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'w-full h-full flex items-center justify-center bg-gray-800';
                          errorDiv.innerHTML = `
                            <div class="text-center text-gray-400">
                              <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                              </svg>
                              <p class="text-sm">Media Preview Unavailable</p>
                            </div>
                          `;
                          container.appendChild(errorDiv);
                        };
                              }}
                            />
                          )}
                        </div>
                      );
                    })()}

                  {/* Avatar Preview Overlay - Now per-slide */}
                  {(selectedAvatar || (slideAvatars && slideAvatars[currentSlideIndex])) && (
                    <div className="absolute inset-0">
                      <AvatarPreview
                        frameWidth={360} // Divides 1080 evenly (scale factor 3.0)
                        frameHeight={640} // Divides 1920 evenly (scale factor 3.0)
                      />
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-sm">{t('noPhotosSelected')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Next Button - Desktop Only, Outside Frame */}
          {photos.length > 1 && (
            <motion.button
              onClick={goToNextSlide}
              className="hidden md:flex absolute right-[-4rem] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white/20 transition-all z-20 border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Slide Indicators - Desktop Only, Below Frame */}
        {photos.length > 1 && (
          <div className="hidden md:flex justify-center mt-4">
            <div className="flex space-x-2">
              {photos.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentSlideIndex
                    ? 'bg-white'
                    : 'bg-white/40 hover:bg-white/60'
                    }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Status Indicators - Music and File Count */}
      <AnimatePresence>
        {(selectedMusic || photos.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 text-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Music Indicator */}
              {selectedMusic && (
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-sm font-medium">
                    {t('musicAdded')}: {selectedMusic.name || t('selectedTrack')}
                  </span>
                </div>
              )}

              {/* File Count Indicator */}
              {photos.length > 1 && (
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <svg className="w-4 h-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-sm font-medium">
                    {(() => {
                      const videoCount = photos.filter(photo => isVideoFile(photo)).length;
                      const photoCount = photos.length - videoCount;

                      if (videoCount > 0 && photoCount > 0) {
                        return `${photos.length} Media Files`;
                      } else if (videoCount === photos.length) {
                        return `${photos.length} Video${photos.length > 1 ? 's' : ''}`;
                      } else {
                        return `${photos.length} Photo${photos.length > 1 ? 's' : ''}`;
                      }
                    })()}
                  </span>
                </div>
              )}

              {/* Inline Circular Progress - Show during processing (in same row on desktop, below on mobile) */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex"
                >
                  <div className={`relative ${isMobile ? 'w-20 h-20' : 'w-12 h-12'}`}>
                    <svg className={`${isMobile ? 'w-20 h-20' : 'w-12 h-12'} transform -rotate-90`}>
                      <circle
                        cx={isMobile ? "40" : "24"}
                        cy={isMobile ? "40" : "24"}
                        r={isMobile ? "32" : "20"}
                        stroke="currentColor"
                        strokeWidth={isMobile ? "6" : "4"}
                        fill="none"
                        className="text-gray-700"
                      />
                      <motion.circle
                        cx={isMobile ? "40" : "24"}
                        cy={isMobile ? "40" : "24"}
                        r={isMobile ? "32" : "20"}
                        stroke="currentColor"
                        strokeWidth={isMobile ? "6" : "4"}
                        fill="none"
                        strokeLinecap="round"
                        className="text-blue-500"
                        style={{
                          strokeDasharray: isMobile ? "201" : "126",
                          strokeDashoffset: isMobile
                            ? 201 - (201 * (generationProgress || 0)) / 100
                            : 126 - (126 * (generationProgress || 0)) / 100
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-white font-semibold ${isMobile ? 'text-sm' : 'text-xs'}`}>
                        {Math.round(generationProgress || 0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderVideoFrame = () => (
    <motion.div
      className="relative w-full max-w-lg mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* iPhone Frame */}
      {/* Dynamic Island */}
      <div className="relative">
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-20"></div>
      </div>

      <div className="bg-black rounded-[2rem] overflow-hidden relative mx-auto shadow-2xl" style={{ width: '21em', height: '37rem' }}>
        {videoData && videoData.url ? (
          <video
            controls
            className="w-full h-full object-cover"
            preload="metadata"
            poster={photos.length > 0 && photos[0] instanceof File ? URL.createObjectURL(photos[0]) : undefined}
          >
            <source src={videoData.url} type="video/mp4" />
            {t('yourBrowserDoesNotSupport')}
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white/60 text-sm">{t('videoGenerating')}</p>
            </div>
          </div>
        )}

        {/* Avatar Preview Overlay - Show during video generation or when no video yet */}
        {!videoData?.url && (selectedAvatar || (slideAvatars && slideAvatars[currentSlideIndex])) && (
          <div className="absolute inset-0">
            <AvatarPreview
              frameWidth={288} // iPhone preview frame width
              frameHeight={512} // 288 / 0.5625 = 512 (matches 1080/1920 video ratio)
            />
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-2">
      <AnimatePresence mode="wait">
        {mode === 'default' && (
          <motion.div key="default">
            {renderDefaultFrame()}
          </motion.div>
        )}
        {mode === 'photos' && (
          <motion.div key="photos">
            {renderPhotoFrame()}
          </motion.div>
        )}
        {mode === 'video' && (
          <motion.div key="video">
            {renderVideoFrame()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreviewFrame;