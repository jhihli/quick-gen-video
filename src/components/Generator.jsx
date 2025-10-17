import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAppContext } from '../context/AppContext'

// Import new components
import PreviewFrame from './PreviewFrame'
import BottomButtonBar from './BottomButtonBar'
import BottomSheetDrawer from './BottomSheetDrawer'
import SearchBar from './SearchBar'

// Import existing components (will be used in two-column layout)
import UploadPhotos from './UploadPhotos'
import LoadingFallback from './LoadingFallback'
import { LogoIcon } from './AnimatedIcons'

// Lazy load heavy components
const MusicSelector = React.lazy(() => import('./MusicSelector'))
const AvatarSelector = React.lazy(() => import('./AvatarSelector'))
const VideoExportSidebar = React.lazy(() => import('./VideoExportSidebar'))

const Generator = () => {
  const { t } = useLanguage()
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
          <Suspense fallback={<LoadingFallback message={t('loadingMusicLibrary')} />}>
            <MusicSelector />
          </Suspense>
        )
      case 'avatar':
        return (
          <Suspense fallback={<LoadingFallback message={t('loadingAvatars')} />}>
            <AvatarSelector />
          </Suspense>
        )
      case 'generate':
        return (
          <Suspense fallback={<LoadingFallback message={t('loading')} />}>
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
        return t('uploadPhotos')
      case 'music':
        return t('musicLibrary')
      case 'avatar':
        return 'Select Avatar'
      case 'generate':
        return t('ready')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 gap-4">
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

            {/* Search Bar - Hidden on small screens */}
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar />
            </div>

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
              <Link
                to="/help"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Help</span>
                <span className="sm:hidden font-bold">HELP</span>
              </Link>
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
    </div>
  )
}

export default Generator