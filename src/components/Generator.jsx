import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

// Import new components
import PreviewFrame from './PreviewFrame'
import BottomButtonBar from './BottomButtonBar'
import BottomSheetDrawer from './BottomSheetDrawer'
import SearchBar from './SearchBar'
import Footer from './Footer'

// Import existing components (will be used in two-column layout)
import UploadPhotos from './UploadPhotos'
import LoadingFallback from './LoadingFallback'
import { LogoIcon } from './AnimatedIcons'

// Lazy load heavy components
const MusicSelector = React.lazy(() => import('./MusicSelector'))
const AvatarSelector = React.lazy(() => import('./AvatarSelector'))
const VideoExportSidebar = React.lazy(() => import('./VideoExportSidebar'))

const Generator = () => {
  const {
    hasGeneratedVideo,
    cleanupAndReset,
    photos,
    selectedMusic,
    generatedVideo,
    isProcessing,
    selectedAvatar,
    slideAvatars
  } = useAppContext()
  const navigate = useNavigate()

  // State management for drawer
  const [activeMode, setActiveMode] = useState('preview') // 'preview', 'upload', 'music', 'avatar', 'generate'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(window.innerWidth < 768)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Auto-close drawer when processing starts, reopen when video is ready
  useEffect(() => {
    if (isProcessing && isDrawerOpen && activeMode === 'generate') {
      // Close drawer when processing starts
      setIsDrawerOpen(false)
      setActiveMode('preview')
    } else if (!isProcessing && generatedVideo && activeMode === 'preview') {
      // Reopen drawer when video is ready
      setActiveMode('generate')
      setIsDrawerOpen(true)
    }
  }, [isProcessing, generatedVideo])

  // Navigation handlers
  const handleNavigateToHome = (e) => {
    e.preventDefault()
    navigate('/')
  }

  // Button handlers for bottom sheet
  const handlePhotosClick = () => {
    // Prevent opening during generation
    if (isProcessing) return

    if (activeMode === 'upload' && isDrawerOpen) {
      // Close if already open
      setIsDrawerOpen(false)
      setActiveMode('preview')
    } else {
      // Open photos drawer
      setActiveMode('upload')
      setIsDrawerOpen(true)
    }
  }

  const handleMusicClick = () => {
    // Prevent opening during generation
    if (isProcessing) return

    if (activeMode === 'music' && isDrawerOpen) {
      // Close if already open
      setIsDrawerOpen(false)
      setActiveMode('preview')
    } else {
      // Open music drawer
      setActiveMode('music')
      setIsDrawerOpen(true)
    }
  }

  const handleAvatarClick = () => {
    if (activeMode === 'avatar' && isDrawerOpen) {
      // Close if already open
      setIsDrawerOpen(false)
      setActiveMode('preview')
    } else {
      // Open avatar selector
      setActiveMode('avatar')
      setIsDrawerOpen(true)
    }
  }

  const handleGenerateClick = () => {
    if (photos.length > 0 && selectedMusic) {
      if (activeMode === 'generate' && isDrawerOpen) {
        // Close if already open
        setIsDrawerOpen(false)
        setActiveMode('preview')
      } else if (generatedVideo) {
        // Video exists - open drawer to show download options
        setActiveMode('generate')
        setIsDrawerOpen(true)
      } else {
        // No video yet - don't open drawer, start generation directly
        // Set mode but keep drawer closed
        setActiveMode('generate')
        setIsDrawerOpen(false)
        // Trigger generation through a ref or direct call
        // For now, we'll rely on mounting VideoExportSidebar to handle it
      }
    }
  }

  // Close handler for drawer
  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setActiveMode('preview')
  }

  // Determine preview frame mode
  const getPreviewMode = () => {
    if (generatedVideo && generatedVideo.url) return 'video'
    if (photos.length > 0) return 'photos'
    return 'default'
  }

  // Check if generation can proceed
  const canGenerate = photos.length > 0 && selectedMusic && !isProcessing

  // Get modal width based on active mode
  const getModalWidth = () => {
    switch (activeMode) {
      case 'avatar':
        return 'wide'
      case 'upload':
        return 'medium'
      case 'music':
        return 'medium'
      case 'generate':
        return 'default'
      default:
        return 'default'
    }
  }

  // Render content for two-column layouts
  const renderLeftContent = () => {
    switch (activeMode) {
      case 'upload':
        return <UploadPhotos />
      case 'music':
        return (
          <Suspense fallback={<LoadingFallback message="Loading music library..." />}>
            <MusicSelector />
          </Suspense>
        )
      case 'avatar':
        return (
          <Suspense fallback={<LoadingFallback message="Loading avatars..." />}>
            <AvatarSelector />
          </Suspense>
        )
      case 'generate':
        return (
          <Suspense fallback={<LoadingFallback message="Loading..." />}>
            <VideoExportSidebar
              onNewVideo={() => {
                cleanupAndReset()
                handleDrawerClose()
              }}
            />
          </Suspense>
        )
      default:
        return null
    }
  }

  const renderRightContent = () => {
    return (
      <PreviewFrame
        mode={getPreviewMode()}
        photos={photos}
        videoData={generatedVideo}
        selectedMusic={selectedMusic}
      />
    )
  }

  const getLeftTitle = () => {
    switch (activeMode) {
      case 'upload':
        return 'Upload Photos'
      case 'music':
        return 'Music Library'
      case 'avatar':
        return 'Select Avatar'
      case 'generate':
        return 'Ready'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <motion.header
        className="bg-white/10 backdrop-blur-md border-b border-white/20 relative z-50"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 gap-2 sm:gap-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-2 sm:space-x-4"
            >
              <LogoIcon size={8} className="hidden sm:block" />
              <motion.h1
                className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-pointer relative"
                whileHover={{ scale: 1.05 }}
                transition={{ scale: { duration: 0.3 } }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent bg-clip-text text-transparent"
                  initial={{ backgroundPosition: "-200% 0" }}
                  whileHover={{
                    backgroundPosition: ["200% 0", "-200% 0"],
                    transition: {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                  style={{
                    backgroundSize: "200% 100%"
                  }}
                >
                  QWimgenv
                </motion.span>
                QWimgenv
              </motion.h1>
            </motion.div>

            {/* Search Bar - Hidden on small screens */}
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar />
            </div>

            <nav className="flex items-center space-x-0.5 sm:space-x-2">
              <motion.a
                href="/"
                onClick={handleNavigateToHome}
                className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  <span className="hidden sm:inline">Home</span>
                  <span className="sm:hidden">HOME</span>
                </span>
              </motion.a>

              <motion.a
                href="/generator"
                className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group bg-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  <span className="hidden sm:inline">Generator</span>
                  <span className="sm:hidden">TOOL</span>
                </span>
              </motion.a>

              <motion.a
                href="/help"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/help')
                }}
                className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  <span className="hidden sm:inline">Help</span>
                  <span className="sm:hidden">HELP</span>
                </span>
              </motion.a>

              <motion.a
                href="/news"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/news')
                }}
                className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  <span className="hidden sm:inline">News</span>
                  <span className="sm:hidden">NEWS</span>
                </span>
              </motion.a>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Single Column Layout - Always Visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full flex flex-col items-center justify-center"
        >
          {/* Centered Content Container */}
          <div className="flex flex-col items-center justify-center space-y pt-4">
            {/* Preview Frame */}
            <div className="flex items-center justify-center">
              <PreviewFrame
                mode={getPreviewMode()}
                photos={photos}
                videoData={generatedVideo}
                selectedMusic={selectedMusic}
              />
            </div>

            {/* Bottom Button Bar */}
            <div className="flex-shrink-0">
              <BottomButtonBar
                onPhotosClick={handlePhotosClick}
                onMusicClick={handleMusicClick}
                onAvatarClick={handleAvatarClick}
                onGenerateClick={handleGenerateClick}
                hasPhotos={photos.length > 0}
                hasMusic={!!selectedMusic}
                hasAvatar={!!selectedAvatar}
                canGenerate={canGenerate}
                isGenerating={isProcessing}
                hasVideo={!!generatedVideo}
              />
            </div>
          </div>
        </motion.div>

        {/* Hidden VideoExportSidebar - renders in background to handle generation */}
        {activeMode === 'generate' && !isDrawerOpen && (
          <div style={{ display: 'none' }}>
            <Suspense fallback={null}>
              <VideoExportSidebar
                onNewVideo={() => {
                  cleanupAndReset()
                  handleDrawerClose()
                }}
              />
            </Suspense>
          </div>
        )}

        {/* Bottom Sheet Drawer */}
        <BottomSheetDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          title={getLeftTitle()}
          modalWidth={getModalWidth()}
        >
          {renderLeftContent()}
        </BottomSheetDrawer>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Generator