import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import UploadPhotos from './UploadPhotos'
import AnimatedTitle from './AnimatedTitle'
import Modal from './Modal'
import LoadingFallback from './LoadingFallback'
import { LogoIcon, PhotoUploadIcon, MusicIcon, VideoIcon } from './AnimatedIcons'
import { useLanguage } from '../context/LanguageContext'
import { useAppContext } from '../context/AppContext'

// Lazy load heavy components that are only used in specific steps
const MusicSelector = React.lazy(() => import('./MusicSelector'))
const VideoExport = React.lazy(() => import('./VideoExport'))
const LanguageSelector = React.lazy(() => import('./LanguageSelector'))

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

const Generator = () => {
  const { t } = useLanguage()
  const { hasGeneratedVideo, cleanupAndReset, photos, selectedMusic } = useAppContext()
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 400)
  const carouselRef = useRef(null)

  // Motion values for carousel
  const x = useMotionValue(0)
  const dragX = useSpring(x, { damping: 30, stiffness: 400, restSpeed: 0.1, restDelta: 0.1 })
  const dragProgress = useTransform(dragX, [-100, 0, 100], [1, 0, -1])

  // Calculate responsive dimensions
  const getItemWidth = () => {
    return viewportWidth // Full width, margins handled by inner content
  }

  // Steps configuration
  const steps = [
    { id: 'upload', title: t('uploadPhotos'), icon: PhotoUploadIcon, color: 'cyan' },
    { id: 'music', title: t('musicLibrary'), icon: MusicIcon, color: 'purple' },
    { id: 'export', title: t('generateVideo'), icon: VideoIcon, color: 'green' }
  ]

  // Mobile detection and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(window.innerWidth < 768)
      setViewportWidth(window.innerWidth)
    }

    const handleResize = () => {
      updateDimensions()
      // Update carousel position on resize
      if (isMobile) {
        const itemWidth = getItemWidth()
        const newX = -currentStep * itemWidth
        x.set(newX)
      }
    }

    updateDimensions()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentStep, isMobile, x])

  // Initialize carousel position
  useEffect(() => {
    if (isMobile) {
      const itemWidth = getItemWidth()
      const newX = -currentStep * itemWidth
      x.set(newX, false) // Set without animation to ensure immediate positioning
    }
  }, [isMobile, currentStep, viewportWidth, x])

  // Auto-navigation disabled - users can freely navigate between steps

  const handleNavigateToHome = (e) => {
    e.preventDefault()
    // Navigate directly to home without confirmation, preserving app state
    navigate('/')
  }

  const navigateToStep = (stepIndex) => {
    if (!isMobile) return
    const clampedStep = Math.max(0, Math.min(steps.length - 1, stepIndex))
    setCurrentStep(clampedStep)
    const itemWidth = getItemWidth()
    const newX = -clampedStep * itemWidth
    x.start(newX)
  }

  const handleDragEnd = (event, info) => {
    const itemWidth = getItemWidth()
    const threshold = itemWidth * 0.25 // 25% of item width
    const velocity = info.velocity.x
    const offset = info.offset.x

    let newStep = currentStep

    // Determine direction based on drag distance and velocity
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 || velocity > 500) {
        // Dragged right (go to previous step)
        newStep = Math.max(0, currentStep - 1)
      } else if (offset < 0 || velocity < -500) {
        // Dragged left (go to next step)
        newStep = Math.min(steps.length - 1, currentStep + 1)
      }
    }

    navigateToStep(newStep)
  }

  const comingSoonContent = (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-gray-300 text-sm sm:text-lg">
          🌟 {t('excitingNewFeatures')}
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-3 sm:p-4">
          <h4 className="text-base sm:text-lg font-semibold text-purple-300 mb-1 sm:mb-2">{t('flipPhotosFeature')}</h4>
          <p className="text-gray-300 text-sm sm:text-base">{t('flipPhotosDesc')}</p>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-3 sm:p-4">
          <h4 className="text-base sm:text-lg font-semibold text-cyan-300 mb-1 sm:mb-2">{t('gridLayoutFeature')}</h4>
          <p className="text-gray-300 text-sm sm:text-base">{t('gridLayoutDesc')}</p>
        </div>
      </div>

      <div className="text-center mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-400/30">
        <p className="text-blue-200 font-medium text-base sm:text-lg">✨ {t('stayTuned')} ✨</p>
      </div>
    </div>
  )


  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Navigation and Title */}
      <motion.header
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="flex justify-between items-center py-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <LogoIcon size={8} className="hidden sm:block" />
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                QWGenv
              </h1>
            </motion.div>

            <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              <a
                href="/"
                onClick={handleNavigateToHome}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">{t('home')}</span>
                <span className="sm:hidden font-bold">HOME</span>
              </a>
              <Link
                to="/generator"
                className="text-white font-medium border-b-2 border-purple-400 pb-1 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">{t('generator')}</span>
                <span className="sm:hidden font-bold">TOOL</span>
              </Link>
              <Suspense fallback={<div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}>
                <LanguageSelector />
              </Suspense>
            </nav>
          </div>

        </div>
      </motion.header>

{/* Generator Content */}
      <main className={`flex-grow ${isMobile ? 'h-full' : 'max-w-7xl mx-auto py-8 sm:px-6 lg:px-8'
        }`}>
        <div className={isMobile ? 'h-full py-2' : 'px-4 py-6 sm:px-0'}>
          {/* Mobile Carousel */}
          {isMobile ? (
            <div className="relative w-full h-full flex flex-col">

              {/* Carousel Container */}
              <div className="flex-1 overflow-hidden relative">
                <motion.div
                  ref={carouselRef}
                  className="flex cursor-grab active:cursor-grabbing"
                  style={{ x }}
                  drag="x"
                  dragConstraints={{
                    left: -(steps.length - 1) * getItemWidth(),
                    right: 0
                  }}
                  dragElastic={0.15}
                  dragMomentum={false}
                  whileDrag={{ cursor: "grabbing" }}
                  onDragStart={() => {
                    document.body.style.userSelect = 'none'
                  }}
                  onDragEnd={(event, info) => {
                    document.body.style.userSelect = ''
                    handleDragEnd(event, info)
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                >
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className="flex-shrink-0"
                      style={{
                        width: `${getItemWidth()}px`
                      }}
                    >
                      <motion.div
                        className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl shadow-2xl transition-all duration-300 h-full mx-4 ${step.color === 'cyan'
                          ? 'bg-gradient-to-br from-cyan-900/30 via-blue-800/20 to-indigo-900/30 border-cyan-300/20'
                          : step.color === 'purple'
                            ? 'bg-gradient-to-br from-purple-900/30 via-violet-800/20 to-fuchsia-900/30 border-purple-300/20'
                            : 'bg-gradient-to-br from-emerald-900/30 via-green-800/20 to-teal-900/30 border-emerald-300/20'
                          }`}
                        style={{
                          height: `${Math.min(viewportWidth * 1.4, 720)}px`,
                          minHeight: '520px'
                        }}
                        animate={{
                          scale: index === currentStep ? 1 : 0.96,
                          opacity: index === currentStep ? 1 : 0.75
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {/* Animated background elements */}
                        <div className="absolute inset-0 opacity-20">
                          <motion.div
                            className={`absolute top-0 left-0 w-24 h-24 rounded-full blur-xl ${step.color === 'cyan'
                              ? 'bg-cyan-400/30'
                              : step.color === 'purple'
                                ? 'bg-purple-400/30'
                                : 'bg-green-400/30'
                              }`}
                            animate={{
                              x: [0, 60, 0],
                              y: [0, 40, 0],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className={`absolute bottom-0 right-0 w-32 h-32 rounded-full blur-2xl ${step.color === 'cyan'
                              ? 'bg-blue-400/20'
                              : step.color === 'purple'
                                ? 'bg-violet-400/20'
                                : 'bg-teal-400/20'
                              }`}
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 180, 360],
                            }}
                            transition={{
                              duration: 12,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </div>

                        <div className="relative z-10 p-4 h-full flex flex-col">

                          <div className="mb-2 flex-shrink-0 mt-2">
                            <AnimatedTitle
                              variant="morphing"
                              className="text-lg sm:text-xl"
                              delay={0.3}
                              icon={<step.icon size={6} className={`${step.color === 'cyan'
                                ? 'text-cyan-400'
                                : step.color === 'purple'
                                  ? 'text-purple-400'
                                  : 'text-green-400'
                                }`} />}
                            >
                              {step.title}
                            </AnimatedTitle>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 overflow-y-auto pr-2">
                            {index === 0 && <UploadPhotos />}
                            {index === 1 && (
                              <Suspense fallback={<LoadingFallback message="Loading music selector..." />}>
                                <MusicSelector />
                              </Suspense>
                            )}
                            {index === 2 && (
                              <Suspense fallback={<LoadingFallback message="Loading video export..." />}>
                                <VideoExport onNewVideo={() => navigateToStep(0)} />
                              </Suspense>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

{/* Compact Swipe Hint & Navigation */}
              <div className="relative mt-3 px-3 flex-shrink-0">
                {/* Minimal Background Guide */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 rounded-lg border border-white/5 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                />

                <div className="relative flex justify-between items-center py-1">
                  {/* Compact Left Arrow */}
                  <motion.button
                    onClick={() => navigateToStep(currentStep - 1)}
                    disabled={currentStep === 0}
                    className={`relative p-2 rounded-xl transition-all duration-300 shadow-md ${currentStep === 0
                      ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed border border-gray-700/30'
                      : 'bg-gradient-to-r from-purple-600/80 to-purple-500/80 text-white hover:from-purple-500/90 hover:to-purple-400/90 active:scale-95 border border-purple-400/30'
                      }`}
                    whileHover={currentStep > 0 ? {
                      scale: 1.05,
                      boxShadow: "0 5px 15px rgba(147, 51, 234, 0.3)"
                    } : {}}
                    whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
                    animate={currentStep > 0 ? {
                      boxShadow: [
                        "0 0 10px rgba(147, 51, 234, 0.3)",
                        "0 0 15px rgba(147, 51, 234, 0.4)",
                        "0 0 10px rgba(147, 51, 234, 0.3)"
                      ]
                    } : {}}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    {currentStep > 0 && (
                      <motion.div
                        className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-purple-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>

                  {/* Compact Swipe Instructions */}
                  <motion.div
                    className="flex items-center justify-center px-1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    {/* Minimal Swipe Instructions with Horizontal Animation */}
                    <motion.div
                      className="text-center"
                      animate={{
                        x: [-10, 10, -10],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="text-lg text-white">👈 SWIPE 👉</div>
                    </motion.div>
                  </motion.div>

                  {/* Compact Right Arrow */}
                  <motion.button
                    onClick={() => navigateToStep(currentStep + 1)}
                    disabled={currentStep === steps.length - 1}
                    className={`relative p-2 rounded-xl transition-all duration-300 shadow-md ${currentStep === steps.length - 1
                      ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed border border-gray-700/30'
                      : 'bg-gradient-to-r from-cyan-600/80 to-cyan-500/80 text-white hover:from-cyan-500/90 hover:to-cyan-400/90 active:scale-95 border border-cyan-400/30'
                      }`}
                    whileHover={currentStep < steps.length - 1 ? {
                      scale: 1.05,
                      boxShadow: "0 5px 15px rgba(6, 182, 212, 0.3)"
                    } : {}}
                    whileTap={currentStep < steps.length - 1 ? { scale: 0.95 } : {}}
                    animate={currentStep < steps.length - 1 ? {
                      boxShadow: [
                        "0 0 10px rgba(6, 182, 212, 0.3)",
                        "0 0 15px rgba(6, 182, 212, 0.4)",
                        "0 0 10px rgba(6, 182, 212, 0.3)"
                      ]
                    } : {}}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity, delay: 0.5 }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    {currentStep < steps.length - 1 && (
                      <motion.div
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      />
                    )}
                  </motion.button>
                </div>

              </div>
            </div>
          ) : (
            /* Desktop Grid Layout */
            <motion.div
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >

              <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-cyan-900/30 via-blue-800/20 to-indigo-900/30 backdrop-blur-xl border border-cyan-300/20 rounded-3xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    className="absolute top-0 left-0 w-24 h-24 bg-cyan-400/30 rounded-full blur-xl"
                    animate={{
                      x: [0, 60, 0],
                      y: [0, 40, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                <div className="relative z-10 px-6 py-8">
                  <div className="mb-6">
                    <AnimatedTitle
                      variant="morphing"
                      className="text-xl"
                      delay={0.3}
                      icon={<PhotoUploadIcon size={8} className="text-cyan-400" />}
                    >
                      {t('uploadPhotos')}
                    </AnimatedTitle>
                  </div>
                  <UploadPhotos />
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-violet-800/20 to-fuchsia-900/30 backdrop-blur-xl border border-purple-300/20 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    className="absolute top-1/4 right-0 w-28 h-28 bg-purple-400/30 rounded-full blur-xl"
                    animate={{
                      x: [0, -50, 0],
                      y: [0, 30, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-24 h-24 bg-violet-400/25 rounded-full blur-lg"
                    animate={{
                      x: [0, 40, 0],
                      y: [0, -25, 0],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                <div className="relative z-10 px-6 py-8">
                  <div className="mb-6">
                    <AnimatedTitle
                      variant="floating"
                      className="text-xl"
                      delay={0.5}
                      icon={<MusicIcon size={8} className="text-purple-400" />}
                    >
                      {t('musicLibrary')}
                    </AnimatedTitle>
                  </div>
                  <Suspense fallback={<LoadingFallback message="Loading music selector..." />}>
                    <MusicSelector />
                  </Suspense>
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-green-800/20 to-teal-900/30 backdrop-blur-xl border border-emerald-300/20 rounded-3xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    className="absolute top-0 left-1/2 w-30 h-30 bg-emerald-400/30 rounded-full blur-xl"
                    animate={{
                      x: [0, -40, 40, 0],
                      y: [0, 25, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 9,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute bottom-1/4 right-0 w-26 h-26 bg-teal-400/25 rounded-full blur-lg"
                    animate={{
                      x: [0, -30, 0],
                      y: [0, -20, 20, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 11,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                <div className="relative z-10 px-6 py-8">
                  <div className="mb-6">
                    <AnimatedTitle
                      variant="stagger"
                      className="text-xl"
                      delay={0.7}
                      icon={<VideoIcon size={8} className="text-green-400" />}
                    >
                      {t('generateVideo')}
                    </AnimatedTitle>
                  </div>
                  <Suspense fallback={<LoadingFallback message="Loading video export..." />}>
                    <VideoExport onNewVideo={() => setCurrentStep(0)} />
                  </Suspense>
                </div>
              </motion.div>

            </motion.div>
          )}
        </div>
      </main>

{/* Footer */}
      <motion.footer
        className="bg-white/5 backdrop-blur-sm border-t border-white/10 py-6 mt-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center text-gray-300">
            <button
              onClick={() => setActiveModal('comingSoon')}
              className="hover:text-white transition-colors cursor-pointer text-yellow-300 font-medium bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg px-4 py-2 hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20"
            >
              ⭐ {t('comingSoon')}
            </button>
          </div>
          <div className="text-center mt-4 text-gray-400">
            <p>&copy; 2025 QWGenv. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </motion.footer>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        <Modal
          isOpen={activeModal === 'comingSoon'}
          onClose={() => setActiveModal(null)}
          title={t('newFeaturesTitle')}
        >
          {comingSoonContent}
        </Modal>
      </AnimatePresence>

    </div>
  )
}

export default Generator