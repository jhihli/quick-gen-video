import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import AnimatedTitle from './AnimatedTitle'
import Modal from './Modal'
import SearchBar from './SearchBar'
import { useAppContext } from '../context/AppContext'

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


const Home = () => {
  const { hasGeneratedVideo, cleanupAndReset } = useAppContext()
  const navigate = useNavigate()

  const [activeModal, setActiveModal] = useState(null)
  const [activeGuideStep, setActiveGuideStep] = useState(0)
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [isVideoMuted, setIsVideoMuted] = useState(true)

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "What photo and video formats does QWGenv support?",
      answer: "QWGenv supports popular image formats including JPEG, PNG, WebP, and video formats like MP4, AVI, MOV. Each file must be under 10MB, and you can upload up to 10 files per project."
    },
    {
      id: 2,
      question: "Is there a limit to how many photos I can use in one video?",
      answer: "Yes, you can upload up to 10 photos or videos per project. This limit ensures optimal processing speed and video quality while keeping file sizes manageable for easy sharing."
    },
    {
      id: 3,
      question: "Can I use my own music in the videos?",
      answer: "Absolutely! You can either choose from our curated music library with pre-loaded tracks, or upload your own music files. Supported audio formats include MP3, WAV, and M4A."
    },
    {
      id: 4,
      question: "How long does it take to generate a video?",
      answer: "Video generation typically takes 1-3 minutes depending on the number of photos, video length, and processing complexity. You'll see real-time progress updates during generation."
    },
    {
      id: 5,
      question: "What video quality and formats are available for download?",
      answer: "All videos are generated in high-quality 1080x1920 portrait format (mobile-optimized) in MP4 format with 192k AAC audio. This ensures compatibility across all devices and social media platforms."
    },
    {
      id: 6,
      question: "Is QWGenv free to use?",
      answer: "Yes! QWGenv is completely free to use. You can create unlimited videos, upload your own music, and download your creations without any cost or subscription fees."
    },
    {
      id: 7,
      question: "Can I edit the video after it's generated?",
      answer: "Currently, QWGenv generates videos in a single process. If you'd like changes, you can create a new video with different photos, music, or settings. We're working on editing features for future updates."
    },
    {
      id: 8,
      question: "Can I add animated avatars to my videos?",
      answer: "Yes! You can add animated avatars to any slide in your video. Choose from 10+ characters, position them anywhere on your photos, adjust their size, and create engaging virtual duets. Each slide can have its own unique avatar with custom placement."
    }
  ]

  // Toggle FAQ expansion
  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  // Keyboard navigation for Guide Steps
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && activeGuideStep > 0) {
        setActiveGuideStep(activeGuideStep - 1)
      } else if (e.key === 'ArrowRight' && activeGuideStep < 3) {
        setActiveGuideStep(activeGuideStep + 1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [activeGuideStep])

  const handleNavigateToGenerator = (e) => {
    e.preventDefault()
    // Navigate directly to generator without confirmation, preserving app state
    navigate('/generator')
  }


  const stepImages = [
    { step: 'Upload Media', image: "🖼️", description: 'Drag and drop up to 10 photos or videos. Each file can be up to 10MB. Supports JPG, PNG, MP4 formats. Create beautiful slideshows with your favorite memories.' },
    { step: 'Select Music', image: "🎵", description: 'Choose from our curated music library or upload your own soundtrack. Customize the duration and set the perfect mood for your video creation.' },
    { step: 'Add Avatar', image: "🎭", description: 'Select from 10+ animated characters. Position and resize your avatar on each slide to create engaging virtual duets. Bring your photos to life with personality.' },
    { step: 'Generate Video', image: "🎬", description: 'Click generate and watch your photos transform into a professional video with music and avatars. Download instantly and share with friends and family.' }
  ]

  const modalContent = {
    about: 'QWGenv is a powerful video creation tool that transforms your photos into stunning videos with custom music. Our mission is to make video creation accessible, fast, and enjoyable for everyone.',
    contact: (
      <div>
        <p className="text-center text-gray-300 text-base mt-4 leading-relaxed">
          If you have any questions, suggestions, or just want to share your experience with our video generator, please feel free to leave your feedback. Your thoughts are incredibly valuable to us and help us make QWGenv even better for everyone.
        </p>
        <p className="text-center text-gray-200 text-lg mt-6 font-medium">
          ✨ We'd be delighted to hear from you! ✨
        </p>
      </div>
    ),
    privacy: 'Your privacy is important to us. We do not store your photos or personal data permanently. All uploads are automatically deleted after processing to ensure your privacy and security.',
    terms: 'By using QWGenv, you agree to our terms of service and acceptable use policy. Please use our service responsibly and do not upload copyrighted material without permission.'
  }

  return (
    <>
      {/* Header with Navigation and Title */}
      <motion.header
        className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
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
                onClick={(e) => {
                  e.preventDefault()
                  // No confirmation needed - just stay on home page
                }}
                className="text-white font-medium border-b-2 border-purple-400 pb-1 text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden font-bold">HOME</span>
              </a>
              <a
                href="/generator"
                onClick={handleNavigateToGenerator}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">Generator</span>
                <span className="sm:hidden font-bold">TOOL</span>
              </a>
              <a
                href="/help"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/help')
                }}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">Help</span>
                <span className="sm:hidden font-bold">HELP</span>
              </a>
            </nav>
          </div>

        </div>
      </motion.header>

      {/* Body Section */}
      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Combined Introduction Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-indigo-800/20 to-purple-900/30 backdrop-blur-xl border border-blue-300/20 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"
                animate={{
                  x: [0, 100, 0],
                  y: [0, 50, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-24 h-24 bg-purple-400/20 rounded-full blur-lg"
                animate={{
                  x: [0, -80, 0],
                  y: [0, -40, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div className="relative z-10">
              {/* Powerful gradient title */}
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Transform your photos
                  </span>{' '}
                  <span className="text-white">
                    into stunning videos
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Create professional slideshow videos with music and animated avatars. No editing experience required.
                </p>
              </div>

              {/* Guide Steps - Interactive Tab System */}
              <div className="mb-8">
                <div className="max-w-5xl mx-auto">
                  {/* Interactive Tab Bar */}
                  <div className="flex items-center justify-center mb-8 sm:mb-12 px-4" role="tablist" aria-label="Video creation steps">
                    <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                      {stepImages.map((step, index) => {
                        const isActive = activeGuideStep === index
                        const isAvatarStep = index === 2
                        return (
                          <div key={index} className="flex flex-col items-center">
                            {/* Tab Button */}
                            <button
                              role="tab"
                              aria-selected={isActive}
                              aria-controls={`step-panel-${index}`}
                              id={`step-tab-${index}`}
                              onClick={() => setActiveGuideStep(index)}
                              onMouseEnter={() => setActiveGuideStep(index)}
                              className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
                            >
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{
                                  scale: isActive ? 1.3 : 1,
                                  rotate: 0
                                }}
                                transition={{
                                  duration: 0.6,
                                  delay: index * 0.2,
                                  type: "spring",
                                  stiffness: 100
                                }}
                                whileHover={{ scale: isActive ? 1.4 : 1.2 }}
                              >
                                {/* Outer glow ring */}
                                <motion.div
                                  className={`absolute inset-0 rounded-full blur-md ${isActive
                                    ? isAvatarStep
                                      ? 'bg-gradient-to-r from-purple-400/60 via-fuchsia-400/60 to-purple-400/60 w-9 h-9 sm:w-10 sm:h-10'
                                      : 'bg-gradient-to-r from-blue-400/60 via-purple-400/60 to-pink-400/60 w-9 h-9 sm:w-10 sm:h-10'
                                    : 'bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 w-7 h-7 sm:w-8 sm:h-8'
                                    }`}
                                  animate={{
                                    scale: isActive ? [1, 1.3, 1] : [1, 1.1, 1],
                                    opacity: isActive ? [0.6, 1, 0.6] : [0.2, 0.4, 0.2]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.3
                                  }}
                                />

                                {/* Main dot */}
                                <motion.div
                                  className={`relative rounded-full shadow-lg border-2 flex items-center justify-center ${isActive
                                    ? isAvatarStep
                                      ? 'w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 via-fuchsia-400 to-purple-400 border-purple-200/40'
                                      : 'w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 border-white/40'
                                    : 'w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-600/60 via-purple-600/60 to-pink-600/60 border-white/20 opacity-60'
                                    }`}
                                  animate={isActive ? {
                                    boxShadow: isAvatarStep
                                      ? [
                                        "0 0 0 0 rgba(168, 85, 247, 0.6)",
                                        "0 0 0 12px rgba(168, 85, 247, 0)",
                                        "0 0 0 0 rgba(168, 85, 247, 0)"
                                      ]
                                      : [
                                        "0 0 0 0 rgba(147, 51, 234, 0.6)",
                                        "0 0 0 12px rgba(147, 51, 234, 0)",
                                        "0 0 0 0 rgba(147, 51, 234, 0)"
                                      ]
                                  } : {}}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: index * 0.5
                                  }}
                                >
                                  {/* Inner sparkle */}
                                  <motion.div
                                    className={`rounded-full ${isActive
                                      ? 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/90'
                                      : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60'
                                      }`}
                                    animate={{
                                      scale: isActive ? [0.8, 1.3, 0.8] : [0.8, 1.1, 0.8],
                                      opacity: isActive ? [0.7, 1, 0.7] : [0.4, 0.7, 0.4]
                                    }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                      delay: index * 0.4
                                    }}
                                  />
                                </motion.div>
                              </motion.div>
                            </button>

                            {/* Step Label */}
                            <motion.div
                              className={`mt-2 sm:mt-3 text-center whitespace-nowrap text-xs sm:text-sm font-medium transition-all duration-300 ${isActive
                                ? isAvatarStep
                                  ? 'text-purple-300 font-bold'
                                  : 'text-blue-300 font-bold'
                                : 'text-gray-400 opacity-70'
                                }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: isActive ? 1 : 0.7,
                                y: 0,
                                scale: isActive ? 1.05 : 1
                              }}
                              transition={{ delay: index * 0.2 + 0.5 }}
                            >
                              <span className="hidden sm:inline">{step.step}</span>
                              <span className="sm:hidden">{index + 1}</span>
                            </motion.div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Content Display Area */}
                  <div className="relative max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                      {(() => {
                        const imageNames = ['upload photo.png', 'select music.png', 'add avatar.png', 'generate video.png']
                        const currentStep = stepImages[activeGuideStep]
                        const isAvatarStep = activeGuideStep === 2

                        return (
                          <motion.div
                            key={activeGuideStep}
                            role="tabpanel"
                            id={`step-panel-${activeGuideStep}`}
                            aria-labelledby={`step-tab-${activeGuideStep}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset, velocity }) => {
                              const swipeThreshold = 50
                              if (offset.x > swipeThreshold && activeGuideStep > 0) {
                                setActiveGuideStep(activeGuideStep - 1)
                              } else if (offset.x < -swipeThreshold && activeGuideStep < 3) {
                                setActiveGuideStep(activeGuideStep + 1)
                              }
                            }}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            {/* Large Image Container */}
                            <div className="relative mb-6">
                              {/* Decorative frame */}
                              <div className={`absolute -inset-4 rounded-3xl blur-2xl ${isAvatarStep
                                ? 'bg-gradient-to-br from-purple-400/30 via-fuchsia-400/20 to-purple-400/30'
                                : 'bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30'
                                }`}></div>
                              <div className="absolute -inset-3 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl"></div>

                              {/* Main Image Frame */}
                              <motion.div
                                className={`relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-900 border-3 shadow-2xl ${isAvatarStep
                                  ? 'border-purple-300/50 shadow-purple-500/30'
                                  : 'border-blue-300/50 shadow-blue-500/30'
                                  }`}
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                              >
                                {/* Inner decorative border */}
                                <div className="absolute inset-3 border-2 border-white/20 rounded-xl pointer-events-none"></div>

                                {/* Image */}
                                <img
                                  src={`/local-img/${imageNames[activeGuideStep]}`}
                                  alt={currentStep.step}
                                  className="w-full h-full object-contain"
                                />

                                {/* Corner Decorations */}
                                <div className={`absolute top-3 left-3 w-4 h-4 border-l-3 border-t-3 rounded-tl ${isAvatarStep ? 'border-purple-400/70' : 'border-blue-400/70'
                                  }`}></div>
                                <div className={`absolute top-3 right-3 w-4 h-4 border-r-3 border-t-3 rounded-tr ${isAvatarStep ? 'border-purple-400/70' : 'border-blue-400/70'
                                  }`}></div>
                                <div className={`absolute bottom-3 left-3 w-4 h-4 border-l-3 border-b-3 rounded-bl ${isAvatarStep ? 'border-purple-400/70' : 'border-blue-400/70'
                                  }`}></div>
                                <div className={`absolute bottom-3 right-3 w-4 h-4 border-r-3 border-b-3 rounded-br ${isAvatarStep ? 'border-purple-400/70' : 'border-blue-400/70'
                                  }`}></div>
                              </motion.div>
                            </div>
                          </motion.div>
                        )
                      })()}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center mt-8">
                <a
                  href="/generator"
                  onClick={handleNavigateToGenerator}
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl cursor-pointer"
                >
                  <span className="mr-2">🚀</span>
                  Try it now
                  <span className="ml-2">→</span>
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Way Video Generator Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50 backdrop-blur-xl border border-indigo-100/60 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Quick Way
                </span>{' '}
                <span className="text-black">
                  Video Generator
                </span>
              </h2>
            </div>

            {/* Section 1: Generate videos with zero complexity */}
            <div className="mb-6 sm:mb-8 lg:mb-10">
              {/* Mobile Layout */}
              <div className="lg:hidden">
                {/* Mobile: Title */}
                <motion.div
                  className="px-2 mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 leading-tight">
                    Generate videos with zero complexity
                  </h3>
                  <p className="text-sm sm:text-base text-black leading-relaxed">
                    Create your idea, add the specifics—like photos, video, music, and get animated avatar
                    high-quality videos that put your ideas into focus.
                  </p>
                </motion.div>

                {/* Mobile: iPhone Mockup */}
                <motion.div
                  className="px-2 mb-3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {/* iPhone 17 Mockup Frame */}
                  <div className="relative mx-auto" style={{ maxWidth: '240px' }}>
                    {/* iPhone 17 Device Frame - Slimmer bezels and modern design */}
                    <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3rem] p-1.5 shadow-2xl border-[3px] border-gray-700">
                      {/* Dynamic Island - Wider for iPhone 17 */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-[1.5rem] z-10 shadow-lg border border-gray-800/50"></div>

                      {/* Screen Container - Thinner bezels */}
                      <div
                        className="relative bg-black rounded-[2.5rem] overflow-hidden"
                        style={{ aspectRatio: '9/19.5' }}
                      >
                        {/* Video Player */}
                        <video
                          id="preview-video-mobile"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          preload="metadata"
                          playsInline
                          muted
                          loop
                          autoPlay
                        >
                          <source src="/sample-video/Generate videos with zero complexity.mp4?v=2" type="video/mp4" />
                        </video>

                        {/* Sound Toggle Button - Inside Frame */}
                        <button
                          onClick={() => {
                            const video = document.getElementById('preview-video-mobile');
                            if (video) {
                              video.muted = !video.muted;
                              setIsVideoMuted(video.muted);
                            }
                          }}
                          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-lg ${isVideoMuted
                            ? 'bg-white/90 text-gray-800 hover:bg-white'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-xl'
                            }`}
                        >
                          {isVideoMuted ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-[10px]">OFF</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                              </svg>
                              <span className="text-[10px]">ON</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* iPhone 17 Side Buttons - More refined */}
                      <div className="absolute right-0 top-20 w-0.5 h-16 bg-gray-600 rounded-l-md shadow-inner"></div>
                      <div className="absolute right-0 top-40 w-0.5 h-12 bg-gray-600 rounded-l-md shadow-inner"></div>
                      <div className="absolute left-0 top-28 w-0.5 h-8 bg-gray-600 rounded-r-md shadow-inner"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Mobile: Features & Button */}
                <motion.div
                  className="px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">No video editing experience required</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Add animated avatars to bring photos to life</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Professional quality output</span>
                    </div>
                  </div>
                  <a
                    href="/generator"
                    onClick={handleNavigateToGenerator}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Create now
                    <span className="ml-2">→</span>
                  </a>
                </motion.div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                {/* Left Column - Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-3xl xl:text-4xl font-bold text-black mb-4 leading-tight">
                    Generate videos with zero complexity
                  </h3>
                  <p className="text-lg text-black mb-5 leading-relaxed">
                    Create your idea, add the specifics—like photos, video, music, and get animated avatar
                    high-quality videos that put your ideas into focus.
                  </p>
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">No video editing experience required</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Add animated avatars to bring photos to life</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Professional quality output</span>
                    </div>
                  </div>
                  <a
                    href="/generator"
                    onClick={handleNavigateToGenerator}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Create now
                    <span className="ml-2">→</span>
                  </a>
                </motion.div>

                {/* Right Column - Video Preview Mockup */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {/* iPhone 17 Mockup Frame */}
                  <div className="relative mx-auto" style={{ maxWidth: '280px' }}>
                    {/* iPhone 17 Device Frame - Slimmer bezels and modern design */}
                    <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3.5rem] p-2 shadow-2xl border-4 border-gray-700">
                      {/* Dynamic Island - Wider for iPhone 17 */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-[2rem] z-10 shadow-lg border border-gray-800/50"></div>

                      {/* Screen Container - Thinner bezels */}
                      <div
                        className="relative bg-black rounded-[3rem] overflow-hidden"
                        style={{ aspectRatio: '9/19.5' }}
                      >
                        {/* Video Player */}
                        <video
                          id="preview-video-desktop"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          preload="metadata"
                          playsInline
                          muted
                          loop
                          autoPlay
                        >
                          <source src="/sample-video/Generate videos with zero complexity.mp4?v=2" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>

                        {/* Sound Toggle Button - Inside Frame */}
                        <button
                          onClick={() => {
                            const video = document.getElementById('preview-video-desktop');
                            if (video) {
                              video.muted = !video.muted;
                              setIsVideoMuted(video.muted);
                            }
                          }}
                          className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${isVideoMuted
                            ? 'bg-white/90 text-gray-800 hover:bg-white'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-xl'
                            }`}
                        >
                          {isVideoMuted ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span>OFF</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                              </svg>
                              <span>ON</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* iPhone 17 Side Buttons - More refined */}
                      <div className="absolute right-0 top-28 w-1 h-20 bg-gray-600 rounded-l-md shadow-inner"></div>
                      <div className="absolute right-0 top-52 w-1 h-14 bg-gray-600 rounded-l-md shadow-inner"></div>
                      <div className="absolute left-0 top-36 w-1 h-10 bg-gray-600 rounded-r-md shadow-inner"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Animated Divider */}
            <motion.div
              className="flex items-center justify-center my-8 sm:my-10 lg:my-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div
                className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-blue-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
              ></motion.div>
              <motion.div
                className="mx-6 relative"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-75"></div>
              </motion.div>
              <motion.div
                className="flex-1 h-0.5 bg-gradient-to-r from-purple-600 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
              ></motion.div>
            </motion.div>

            {/* Section 2: Edit videos with prefer musics */}
            <div className="mb-8 sm:mb-12 lg:mb-16">
              {/* Mobile Layout */}
              <div className="lg:hidden">
                {/* Mobile: Title */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 leading-tight">
                    Edit videos with prefer meterial
                  </h3>
                  <p className="text-sm sm:text-base text-black leading-relaxed">
                    Edit your video with the magic box on QWGenv. Give simple options like change the photos,
                    music, add animated avatars and share your videos to life.
                  </p>
                </motion.div>

                {/* Mobile: Image */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl mx-auto max-w-sm">
                    <img
                      src="/local-img/edit video.png"
                      alt="Edit Video Interface"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </motion.div>

                {/* Mobile: Features & Button */}
                <motion.div
                  className="px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Extensive music library</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Customize each slide with unique animated characters</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Perfect sync with video timing</span>
                    </div>
                  </div>
                  <a
                    href="/generator"
                    onClick={handleNavigateToGenerator}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Create now
                    <span className="ml-2">→</span>
                  </a>
                </motion.div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                {/* Left Column - Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3 className="text-3xl xl:text-4xl font-bold text-black mb-6 leading-tight">
                    Edit videos with prefer meterial
                  </h3>
                  <p className="text-lg text-black mb-6 leading-relaxed">
                    Edit your video with the magic box on QWGenv. Give simple options like change the photos,
                    music, add animated avatars and share your videos to life.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Extensive music library</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Customize each slide with unique animated characters</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Perfect sync with video timing</span>
                    </div>
                  </div>
                  <a
                    href="/generator"
                    onClick={handleNavigateToGenerator}
                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium text-base rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Create now
                    <span className="ml-2">→</span>
                  </a>
                </motion.div>

                {/* Right Column - Edit Video Image */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="/local-img/edit video.png"
                      alt="Edit Video Interface"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Animated Divider */}
            <motion.div
              className="flex items-center justify-center my-8 sm:my-10 lg:my-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <motion.div
                className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-green-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              ></motion.div>
              <motion.div
                className="mx-6 relative"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-purple-500 rounded-full shadow-lg"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-purple-400 rounded-full animate-ping opacity-75"></div>
              </motion.div>
              <motion.div
                className="flex-1 h-0.5 bg-gradient-to-r from-purple-600 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              ></motion.div>
            </motion.div>

            {/* Section 3: Instantly produced images and videos */}
            <div>
              {/* Mobile Layout */}
              <div className="lg:hidden">
                {/* Mobile: Title */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 leading-tight">
                    Instantly create vibrant videos with animated avatars, photos, and music
                  </h3>
                  <p className="text-sm sm:text-base text-black leading-relaxed">
                    Get professional-quality videos in minutes, not hours. Our advanced processing engine
                    ensures fast rendering without compromising on quality.
                  </p>
                </motion.div>

                {/* Mobile: Three Images */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="flex items-center justify-center gap-3">
                    {/* Left Image - Avatar Walk Tree (smaller) */}
                    <div className="w-24 flex-shrink-0">
                      <img
                        src="/local-img/avatar walk tree.png"
                        alt="Avatar walking animation"
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>

                    {/* Center Image - Hand Love (larger) */}
                    <div className="w-36 flex-shrink-0">
                      <img
                        src="/local-img/hand love.png"
                        alt="Hand love gesture"
                        className="w-full h-auto rounded-lg shadow-xl"
                      />
                    </div>

                    {/* Right Image - Camera (smaller) */}
                    <div className="w-24 flex-shrink-0">
                      <img
                        src="/local-img/camera.png"
                        alt="Camera feature"
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Mobile: Features & Button */}
                <motion.div
                  className="px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Lightning-fast processing</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Beat-synchronized avatar animations included</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">Multiple format support</span>
                    </div>
                  </div>
                  <a
                    href="/generator"
                    onClick={handleNavigateToGenerator}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Create now
                    <span className="ml-2">→</span>
                  </a>
                </motion.div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                {/* Left Column - Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <h3 className="text-3xl xl:text-4xl font-bold text-black mb-6 leading-tight">
                    Instantly create vibrant videos with animated avatars, photos, and music.
                  </h3>
                  <p className="text-lg text-black mb-6 leading-relaxed">
                    Get professional-quality videos in minutes, not hours. Our advanced processing engine
                    ensures fast rendering without compromising on quality.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Lightning-fast processing</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Beat-synchronized avatar animations included</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Multiple format support</span>
                    </div>
                  </div>
                  <a
                    href="/generator"
                    onClick={handleNavigateToGenerator}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-base rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Create now
                    <span className="ml-2">→</span>
                  </a>
                </motion.div>

                {/* Right Column - Image Mockup */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="flex items-center justify-center gap-4"
                >
                  {/* Left Image - Avatar Walk Tree (smaller) */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-32 xl:w-40 flex-shrink-0"
                  >
                    <img
                      src="/local-img/avatar walk tree.png"
                      alt="Avatar walking animation"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </motion.div>

                  {/* Center Image - Hand Love (larger) */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-48 xl:w-56 flex-shrink-0"
                  >
                    <img
                      src="/local-img/hand love.png"
                      alt="Hand love gesture"
                      className="w-full h-auto rounded-lg shadow-xl"
                    />
                  </motion.div>

                  {/* Right Image - Camera (smaller) */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-32 xl:w-40 flex-shrink-0"
                  >
                    <img
                      src="/local-img/camera.png"
                      alt="Camera feature"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </motion.div>
                </motion.div>

              </div>
            </div>
          </div>
        </motion.section>

      </motion.main>

      {/* How to turn your photos and music into videos Section */}
      <motion.section variants={itemVariants} className="w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row min-h-[500px]">
              {/* Left Side - Dark Background with Main Content */}
              <div className="flex-1 bg-gradient-to-br from-gray-900 via-slate-900 to-black p-8 sm:p-10 lg:p-12 rounded-l-3xl">
                <div className="max-w-xl">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    How to turn your <span className="text-blue-400 font-extrabold">photos</span>, <span className="text-green-400 font-extrabold">music</span> and <span className="text-purple-400 font-extrabold">avatars</span> into video with QWgenv
                  </h2>
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    Transform your photos, music and avatars into professional videos with our simple 4-step process. No technical skills required.
                  </p>
                  <motion.button
                    className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/generator')}
                  >
                    START FOR FREE
                  </motion.button>
                </div>
              </div>

              {/* Right Side - Dark Background with Steps */}
              <div className="flex-1 bg-gradient-to-br from-gray-900 via-slate-900 to-black p-8 sm:p-10 lg:p-12 rounded-r-3xl flex flex-col justify-center">
                <div className="space-y-8">
                  {/* Step 01 */}
                  <motion.div
                    className="flex items-start space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">01</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Start with an idea</h3>
                      <p className="text-gray-300">Upload your photos or videos using our interface. Mix and match your media files.</p>
                    </div>
                  </motion.div>

                  {/* Step 02 */}
                  <motion.div
                    className="flex items-start space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">02</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Build your music & avatars</h3>
                      <p className="text-gray-300">Choose from our free music library or upload your own. Add animated avatars to personalize each slide with unique characters.</p>
                    </div>
                  </motion.div>

                  {/* Step 03 */}
                  <motion.div
                    className="flex items-start space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">03</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Generate your slideshow</h3>
                      <p className="text-gray-300">Let our tool generate a professional slideshow video with smooth transitions in just minutes.</p>
                    </div>
                  </motion.div>

                  {/* Step 04 */}
                  <motion.div
                    className="flex items-start space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">04</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Share your video</h3>
                      <p className="text-gray-300">Download your video or share it instantly via QR code for easy mobile access and social sharing.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQs Section */}
      <motion.section variants={itemVariants} className="w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50/95 via-white/90 to-slate-50/95 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                FAQs
              </h2>
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <motion.button
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <span className="text-lg font-semibold text-black pr-4">
                      {faq.question}
                    </span>
                    <motion.div
                      className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      animate={{ rotate: expandedFAQ === faq.id ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {expandedFAQ === faq.id && (
                      <motion.div
                        className="px-6 pb-6"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-black leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Explore Related Posts Section */}
      <motion.section variants={itemVariants} className="w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/95 via-white/90 to-gray-50/95 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Section Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 leading-tight">
                <span className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Bring your idea
                </span>{' '}
                <span className="text-gray-900">
                  to life with QWgenv
                </span>
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Discover expert tips and strategies to enhance your video creation journey
              </p>
            </div>

            {/* Card Carousel */}
            <div className="relative">
              {/* Navigation Arrows */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hidden sm:flex"
                onClick={() => {
                  const container = document.getElementById('posts-carousel');
                  container.scrollBy({ left: -300, behavior: 'smooth' });
                }}
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hidden sm:flex"
                onClick={() => {
                  const container = document.getElementById('posts-carousel');
                  container.scrollBy({ left: 300, behavior: 'smooth' });
                }}
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Scrollable Card Container */}
              <div
                id="posts-carousel"
                className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-4 sm:px-12"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Card 1: Pick Smarter Video Topics */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border border-blue-100"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 p-6 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&crop=center"
                      alt="Video topics strategy"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE2MCAyMDBIMjQwTDIwMCAxNTBaIiBmaWxsPSIjOTlBM0FFIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE2MCAyMDBIMjQwTDIwMCAxNTBaIiBmaWxsPSIjOTlBM0FFIi8+CjxjaXJjbGUgY3g9IjE3MCIgY3k9IjEzMCIgcj0iMTAiIGZpbGw9IiM5OUEzQUUiLz4KPHN2Zz4K";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pick Smarter Media Topics</h3>
                    <p className="text-gray-900 text-sm leading-relaxed">Choose the right photos and videos for your slideshows. Learn how to select compelling visuals that tell your story and keep viewers engaged from start to finish.</p>
                  </div>
                </motion.div>

                {/* Card 3: Music Selection */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border border-pink-100"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-red-100 p-6 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center"
                      alt="Audio waveform and music"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM5OUEzQUUiLz4KPHN2Zz4K";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Music Selection for Videos</h3>
                    <p className="text-gray-900 text-sm leading-relaxed">Upload your own music or choose from our library to match your video's mood. Discover how the right soundtrack transforms your slideshow into an emotional experience.</p>
                  </div>
                </motion.div>

                {/* Card 5: Video Marketing */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border border-indigo-100"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 to-cyan-100 p-6 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
                      alt="Marketing analytics dashboard"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMjAwTDE2MCAyMDBMMjAwIDE1MEwyNDAgMTgwTDMwMCAxMDAiIHN0cm9rZT0iIzk5QTNBRSIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjIwMCIgcj0iNCIgZmlsbD0iIzk5QTNBRSIvPgo8Y2lyY2xlIGN4PSIxNjAiIGN5PSIyMDAiIHI9IjQiIGZpbGw9IiM5OUEzQUUiLz4KPHN2Zz4K";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Video Marketing Strategies</h3>
                    <p className="text-gray-900 text-sm leading-relaxed">Export your videos in mobile-optimized format and share via QR code. Learn proven tactics to distribute your content across social platforms and reach wider audiences.</p>
                  </div>
                </motion.div>

                {/* Card 7: Animated Avatars */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border border-cyan-100"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-cyan-100 to-blue-100 p-6 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&h=300&fit=crop&crop=center"
                      alt="Animated avatars and AI characters"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNTAiIGZpbGw9IiM5OUEzQUUiLz4KPGNpcmNsZSBjeD0iMTgwIiBjeT0iMTQwIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIyMjAiIGN5PSIxNDAiIHI9IjUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMTcwIFEyMDAgMTgwIDIyMCAxNzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Using Animated Avatars in Videos</h3>
                    <p className="text-gray-900 text-sm leading-relaxed">Add animated avatars to your photo slideshows. Position characters anywhere on your slides to create engaging, dynamic content with personality and movement.</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Mobile Scroll Indicator */}
            <div className="flex justify-center mt-6 sm:hidden">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Start Creating Videos for Free Section */}
      <motion.section variants={itemVariants} className="w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 backdrop-blur-xl shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/30 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl"
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            {/* Content Container */}
            <div className="text-center">
              {/* Main Title with Gradient */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-6"
              >
                <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Start creating videos
                </span>{' '}
                <span className="text-white">
                  for free
                </span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl sm:text-2xl lg:text-3xl text-gray-200 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Experience powerful generator and create your video today.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <a
                  href="/generator"
                  onClick={handleNavigateToGenerator}
                  className="inline-flex items-center px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 text-white font-bold text-lg sm:text-xl rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/50 cursor-pointer group"
                >
                  <span className="mr-3 text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                  Try for Free
                  <motion.span
                    className="ml-3 text-2xl"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-white/5 backdrop-blur-sm border-t border-white/10 py-12"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-8 text-gray-300">
            <button
              onClick={() => setActiveModal('about')}
              className="hover:text-white transition-colors cursor-pointer mb-2"
            >
              About Us
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="hover:text-white transition-colors cursor-pointer mb-2"
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer mb-2"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-white transition-colors cursor-pointer mb-2"
            >
              Terms of Service
            </button>
          </div>
          <div className="text-center mt-8 text-gray-400">
            <p>&copy; 2025 QWGenv. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title="About Us"
      >
        {modalContent.about}
      </Modal>

      <Modal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title="Contact Us"
      >
        {modalContent.contact}
      </Modal>

      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
      >
        {modalContent.privacy}
      </Modal>

      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
      >
        {modalContent.terms}
      </Modal>

    </>
  )
}

export default Home