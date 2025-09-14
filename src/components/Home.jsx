import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import AnimatedTitle from './AnimatedTitle'
import LanguageSelector from './LanguageSelector'
import Modal from './Modal'
import { useLanguage } from '../context/LanguageContext'
import { useAppContext } from '../context/AppContext'
import UserComments from './UserComments'

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
  const { t, currentLanguage } = useLanguage()
  const { hasGeneratedVideo, cleanupAndReset } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()
  const feedbackSectionRef = useRef(null)

  const [sessionId, setSessionId] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [hoveredImage, setHoveredImage] = useState(null)
  const [imageDialogPosition, setImageDialogPosition] = useState({ x: 0, y: 0 })
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  // Generate session ID for UserComments
  useEffect(() => {
    let storedSessionId = sessionStorage.getItem('tkvgen-home-session-id')
    if (!storedSessionId) {
      storedSessionId = `home-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      sessionStorage.setItem('tkvgen-home-session-id', storedSessionId)
    }
    setSessionId(storedSessionId)
  }, [])

  // Scroll to feedback section if navigated from VideoExport
  useEffect(() => {
    if (location.state?.scrollToFeedback && feedbackSectionRef.current) {
      const timer = setTimeout(() => {
        feedbackSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [location.state])

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
    }
  ]

  // Toggle FAQ expansion
  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  const handleImageHover = (index, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Estimate dialog size (max 384px + padding for decorative frames)
    const dialogWidth = 384 + 32 // max-w-96 + decorative frame padding
    const dialogHeight = 384 + 32

    // Calculate initial position (centered on image)
    let x = rect.left + rect.width / 2
    let y = rect.top + scrollTop + rect.height / 2 - 80

    // Prevent right edge cropping
    if (x + dialogWidth / 2 > viewportWidth) {
      x = viewportWidth - dialogWidth / 2 - 20 // 20px margin from edge
    }

    // Prevent left edge cropping
    if (x - dialogWidth / 2 < 0) {
      x = dialogWidth / 2 + 20 // 20px margin from edge
    }

    // Prevent top edge cropping
    if (y - dialogHeight / 2 < scrollTop) {
      y = scrollTop + dialogHeight / 2 + 20
    }

    // Prevent bottom edge cropping
    if (y + dialogHeight / 2 > scrollTop + viewportHeight) {
      y = scrollTop + viewportHeight - dialogHeight / 2 - 20
    }

    setImageDialogPosition({ x, y })
    setHoveredImage(index)
  }

  const handleImageLeave = () => {
    setHoveredImage(null)
  }

  const handleNavigateToGenerator = (e) => {
    e.preventDefault()
    // Navigate directly to generator without confirmation, preserving app state
    navigate('/generator')
  }


  const stepImages = [
    { step: t('stepUploadMedia'), image: "🖼️", description: t('stepUploadDescription') },
    { step: t('stepSelectMusic'), image: "🎵", description: t('stepMusicDescription') },
    { step: t('stepGenerateVideo'), image: "🎬", description: t('stepVideoDescription') }
  ]

  const modalContent = {
    about: t('aboutContent'),
    contact: (
      <div>
        <p className="text-center text-gray-300 text-base mt-4 leading-relaxed">
          {t('contactModalContent')}
        </p>
        <p className="text-center text-gray-200 text-lg mt-6 font-medium">
          ✨ We'd be delighted to hear from you! ✨
        </p>
      </div>
    ),
    privacy: t('privacyContent'),
    terms: t('termsContent')
  }

  return (
    <>
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
                onClick={(e) => {
                  e.preventDefault()
                  // No confirmation needed - just stay on home page
                }}
                className="text-white font-medium border-b-2 border-purple-400 pb-1 text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">{t('home')}</span>
                <span className="sm:hidden font-bold">HOME</span>
              </a>
              <a
                href="/generator"
                onClick={handleNavigateToGenerator}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base cursor-pointer"
              >
                <span className="hidden sm:inline">{t('generator')}</span>
                <span className="sm:hidden font-bold">TOOL</span>
              </a>
              <Link
                to="/blog"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Blog</span>
                <span className="sm:hidden font-bold">BLOG</span>
              </Link>
              <LanguageSelector />
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
        {/* Introduction Subsection */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:h-auto">
            {/* What is QWGenv */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-indigo-800/20 to-purple-900/30 backdrop-blur-xl border border-blue-300/20 rounded-3xl p-8 shadow-2xl h-full flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
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
                <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">{t('whatIsQWGenv')}</h2>
                <div className="text-gray-200 leading-relaxed h-full flex flex-col">
                  <div className="flex-1">
                    <div className="mb-4">
                      {/* Mobile-optimized shorter content */}
                      <div className="block sm:hidden">
                        <div className="mb-3">
                          <div className="inline-flex items-center gap-2 bg-white/5 text-white px-3 py-1.5 rounded-lg border border-white/20 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            {t('quickWayGenerateVideo')}
                          </div>
                        </div>
                        <p className="text-base text-gray-300 leading-relaxed">
                          QWGenv is a powerful web-based video editor that transforms your photos into stunning slideshow videos with music. Create professional-looking videos in minutes with our easy-to-use interface.
                        </p>
                      </div>
                      {/* Desktop full content */}
                      <div className="hidden sm:block">
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 bg-white/5 text-white px-3 py-1.5 rounded-lg border border-white/20 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            {t('quickWayGenerateVideo')}
                          </div>
                        </div>
                        <p className="text-base text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('qwgenvIntro') }}>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl border border-orange-400/30">
                      <div className="text-center">
                        {/* Mobile-optimized shorter CTA text */}
                        <div className="block sm:hidden">
                          <p className="text-orange-100 font-medium text-sm mb-1.5">
                            ✨ {t('readyToCreateVideo')}
                          </p>
                        </div>
                        {/* Desktop full CTA text */}
                        <div className="hidden sm:block">
                          <p className="text-orange-100 font-medium text-base mb-3">
                            ✨ {t('readyToStart')} {' '} {t('andSeeTheMagic')}
                          </p>
                        </div>
                        <a
                          href="/generator"
                          onClick={handleNavigateToGenerator}
                          className="inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-sm sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-yellow-300 hover:border-yellow-200 cursor-pointer"
                        >
                          <span className="mr-2">🚀</span>
                          {t('tryItNow')}
                          <span className="ml-2">→</span>
                        </a>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="mt-2 sm:mt-4 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl border border-purple-400/30">
                      <div className="text-center">
                        {/* Mobile-optimized shorter feedback text */}
                        <div className="block sm:hidden">
                          <p className="text-purple-100 font-medium text-sm mb-1.5">
                            💬 Share your thoughts!
                          </p>
                        </div>
                        {/* Desktop full feedback text */}
                        <div className="hidden sm:block">
                          <p className="text-purple-100 font-medium text-base mb-3">
                            💬 Share your thoughts about QWGenv and help us improve!
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (feedbackSectionRef.current) {
                              feedbackSectionRef.current.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                              })
                            }
                          }}
                          className="inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-3 bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 text-white font-bold text-sm sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-purple-300 hover:border-purple-200"
                        >
                          <span className="mr-2">💭</span>
                          Give Feedback
                          <span className="ml-2">↓</span>
                        </button>
                      </div>
                    </div>

                    {/* Blog Section */}
                    <div className="mt-1 sm:mt-4 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30">
                      <div className="text-center">
                        {/* Mobile-optimized shorter blog text */}
                        <div className="block sm:hidden">
                          <p className="text-cyan-100 font-medium text-sm mb-1.5">
                            📚 Learn expert tips!
                          </p>
                        </div>
                        {/* Desktop full blog text */}
                        <div className="hidden sm:block">
                          <p className="text-cyan-100 font-medium text-base mb-3">
                            📚 Learn expert video creation strategies and tips!
                          </p>
                        </div>
                        <Link
                          to="/blog"
                          className="inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-sm sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-cyan-300 hover:border-cyan-200"
                        >
                          <span className="mr-2">📖</span>
                          Read Blog
                          <span className="ml-2">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Guide Steps */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-teal-800/20 to-cyan-900/30 backdrop-blur-xl border border-emerald-300/20 rounded-3xl p-8 shadow-2xl h-full flex flex-col"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  className="absolute top-1/4 right-0 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl"
                  animate={{
                    x: [0, -60, 0],
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
                  className="absolute bottom-1/4 left-0 w-20 h-20 bg-teal-400/20 rounded-full blur-lg"
                  animate={{
                    x: [0, 70, 0],
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">{t('guideStepsTitle')}</h2>
                  <p className="text-gray-200 mb-6">
                    {t('guideStepsDescription')}
                  </p>
                </div>

                <div className="flex-1">
                  <div className="max-w-4xl mx-auto">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-center mb-8 px-4">
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        {stepImages.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <motion.div
                              className="relative group cursor-pointer"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                duration: 0.6,
                                delay: index * 0.2,
                                type: "spring",
                                stiffness: 100
                              }}
                              whileHover={{ scale: 1.2 }}
                            >
                              {/* Outer glow ring */}
                              <motion.div
                                className="absolute inset-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-emerald-400/30 via-cyan-400/30 to-teal-400/30 blur-md"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: index * 0.3
                                }}
                              />

                              {/* Main dot */}
                              <motion.div
                                className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-400 shadow-lg border-2 border-white/20 flex items-center justify-center"
                                animate={{
                                  boxShadow: [
                                    "0 0 0 0 rgba(52, 211, 153, 0.4)",
                                    "0 0 0 10px rgba(52, 211, 153, 0)",
                                    "0 0 0 0 rgba(52, 211, 153, 0)"
                                  ]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: index * 0.5
                                }}
                              >
                                {/* Inner sparkle */}
                                <motion.div
                                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/80"
                                  animate={{
                                    scale: [0.8, 1.2, 0.8],
                                    opacity: [0.6, 1, 0.6]
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: index * 0.4
                                  }}
                                />
                              </motion.div>

                              {/* Step number */}
                              <motion.div
                                className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-emerald-300"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 + 0.5 }}
                              >
                                {index + 1}
                              </motion.div>
                            </motion.div>

                            {index < stepImages.length - 1 && (
                              <motion.div
                                className="relative mx-3 sm:mx-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.2 + 0.3 }}
                              >
                                {/* Animated connecting line */}
                                <motion.div
                                  className="w-12 sm:w-20 h-1 bg-gradient-to-r from-emerald-300/30 to-cyan-300/30 rounded-full"
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.8, delay: index * 0.3 + 0.4 }}
                                />

                                {/* Moving particle effect */}
                                <motion.div
                                  className="absolute top-0 w-1 h-1 bg-emerald-400 rounded-full"
                                  animate={{
                                    x: [0, 48, 0],
                                    opacity: [0, 1, 0]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.7 + 1
                                  }}
                                />
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-7xl mx-auto">
                      {stepImages.map((step, index) => {
                        const imageNames = ['upload photo.png', 'select music.png', 'generate video.png'];
                        return (
                          <motion.div
                            key={index}
                            className="group relative"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                          >
                            {/* Step card */}
                            <div className="relative bg-gradient-to-br from-emerald-900/10 to-teal-800/10 rounded-2xl p-6 border border-emerald-300/20 hover:border-emerald-300/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">

                              {/* Image container with frame */}
                              <div className="relative mb-6">
                                {/* Decorative frame */}
                                <div className="absolute -inset-3 bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-teal-400/20 rounded-2xl blur-sm"></div>
                                <div className="absolute -inset-2 bg-gradient-to-br from-white/10 to-white/5 rounded-xl"></div>

                                {/* Main image frame */}
                                <div
                                  className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900/20 to-slate-800/20 border-2 border-emerald-300/40 hover:border-emerald-300/70 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer group/image"
                                  onMouseEnter={(e) => handleImageHover(index, e)}
                                  onMouseLeave={handleImageLeave}
                                >
                                  {/* Inner frame border */}
                                  <div className="absolute inset-2 border border-white/20 rounded-lg pointer-events-none"></div>

                                  <img
                                    src={`/local-img/${imageNames[index]}`}
                                    alt={step.step}
                                    className="w-full h-full object-cover"
                                  />

                                  {/* Corner decorations */}
                                  <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-emerald-400/60 rounded-tl"></div>
                                  <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-emerald-400/60 rounded-tr"></div>
                                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-emerald-400/60 rounded-bl"></div>
                                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-emerald-400/60 rounded-br"></div>
                                </div>
                              </div>

                              {/* Step content */}
                              <div className="text-center mt-4">
                                <h3 className="text-base font-medium text-white mb-1 group-hover:text-emerald-300 transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis">
                                  {step.step}
                                </h3>
                                <div className="w-8 h-0.5 bg-emerald-400 mx-auto rounded-full group-hover:w-12 group-hover:bg-emerald-300 transition-all duration-300"></div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Way Video Generator Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-100/95 via-white/90 to-gray-100/95 backdrop-blur-xl border border-gray-200/40 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black leading-tight">
                Quick Way Video Generator
              </h2>
            </div>

            {/* Section 1: Generate videos with zero complexity */}
            <div className="mb-8 sm:mb-12 lg:mb-16">
              {/* Mobile Layout */}
              <div className="lg:hidden">
                {/* Mobile: Title */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 leading-tight">
                    Generate videos with zero complexity
                  </h3>
                  <p className="text-sm sm:text-base text-black leading-relaxed">
                    Type your idea, add the specifics—like length, platform, voiceover accent, and get AI-generated 
                    high-quality videos that put your ideas into focus.
                  </p>
                </motion.div>
                
                {/* Mobile: Mockup */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl mx-auto max-w-sm">
                    <div className="aspect-video bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="text-center text-white">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <div className="w-0 h-0 border-l-4 border-t-2 border-b-2 border-l-white border-t-transparent border-b-transparent ml-0.5"></div>
                          </div>
                          <p className="text-xs opacity-80 px-2">5 min YouTube video of a man traveling through time</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 right-2">
                        <div className="bg-black/50 backdrop-blur-sm rounded-md px-2 py-1.5 flex items-center justify-between">
                          <span className="text-white text-xs truncate mr-2">5 min YouTube video of a man traveling through time</span>
                          <button className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium flex-shrink-0">
                            Generate
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black/50 backdrop-blur-sm rounded-md px-2 py-1.5">
                          <div className="flex items-center space-x-2">
                            <button className="text-white text-sm">⏸️</button>
                            <div className="flex-1 bg-white/20 rounded-full h-0.5">
                              <div className="bg-white rounded-full h-0.5 w-1/3"></div>
                            </div>
                            <span className="text-white text-xs">01:45 / 05:00</span>
                          </div>
                        </div>
                      </div>
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
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">No video editing experience required</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">AI-powered content generation</span>
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
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                {/* Left Column - Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-3xl xl:text-4xl font-bold text-black mb-6 leading-tight">
                    Generate videos with zero complexity
                  </h3>
                  <p className="text-lg text-black mb-6 leading-relaxed">
                    Type your idea, add the specifics—like length, platform, voiceover accent, and get AI-generated 
                    high-quality videos that put your ideas into focus.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">No video editing experience required</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">AI-powered content generation</span>
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
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Video Player Mockup */}
                    <div className="aspect-video bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative">
                      {/* Video Content Placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="text-center text-white">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <div className="w-0 h-0 border-l-8 border-t-4 border-b-4 border-l-white border-t-transparent border-b-transparent ml-1"></div>
                          </div>
                          <p className="text-sm opacity-80 px-2">5 min YouTube video of a man traveling through time</p>
                        </div>
                      </div>
                      
                      {/* Top Prompt Bar */}
                      <div className="absolute top-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between">
                          <span className="text-white text-sm truncate mr-2">5 min YouTube video of a man traveling through time</span>
                          <button className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium flex-shrink-0">
                            Generate
                          </button>
                        </div>
                      </div>

                      {/* Video Controls */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                          <div className="flex items-center space-x-3">
                            <button className="text-white text-base">⏸️</button>
                            <div className="flex-1 bg-white/20 rounded-full h-1">
                              <div className="bg-white rounded-full h-1 w-1/3"></div>
                            </div>
                            <span className="text-white text-sm">01:45 / 05:00</span>
                          </div>
                        </div>
                      </div>
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
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
                    Edit videos with prefer musics
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Edit your videos with the magic box on QWGenv. Give simple commands like change the accent, 
                    delete scenes or add a funky intro and watch your videos come to life.
                  </p>
                </motion.div>
                
                {/* Mobile: Mockup */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl mx-auto max-w-sm">
                    <div className="aspect-video bg-gradient-to-br from-green-600 via-emerald-600 to-teal-800 relative">
                      <div className="absolute inset-2 bg-black/30 rounded-md">
                        <div className="h-full flex items-center justify-center p-2">
                          <div className="text-center text-white">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                              <span className="text-lg">🎵</span>
                            </div>
                            <p className="text-xs opacity-80 px-1">A video about luxury travel to Europe</p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/95 backdrop-blur-sm rounded-md p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-800 font-medium text-xs truncate mr-2">A video about luxury travel to Europe</span>
                            <button className="bg-green-600 text-white px-2 py-0.5 rounded text-xs flex-shrink-0">Generate</button>
                          </div>
                          <div className="space-y-1 text-xs text-gray-700">
                            <div>• Narrate the video in a British accent</div>
                            <div>• Add scenes, delete scenes</div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-2 top-2 space-y-1">
                        <div className="w-8 h-6 bg-blue-500 rounded-sm"></div>
                        <div className="w-8 h-6 bg-purple-500 rounded-sm"></div>
                        <div className="w-8 h-6 bg-pink-500 rounded-sm"></div>
                      </div>
                    </div>
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
                      <span className="text-sm text-gray-700">Upload your own tracks</span>
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
                  <h3 className="text-3xl xl:text-4xl font-bold text-white mb-6 leading-tight">
                    Edit videos with prefer musics
                  </h3>
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                    Edit your videos with the magic box on QWGenv. Give simple commands like change the accent, 
                    delete scenes or add a funky intro and watch your videos come to life.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Extensive music library</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Upload your own tracks</span>
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

                {/* Right Column - Music Editing Interface Mockup */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Video with Music Interface */}
                    <div className="aspect-video bg-gradient-to-br from-green-600 via-emerald-600 to-teal-800 relative">
                      {/* Main Video Area */}
                      <div className="absolute inset-4 bg-black/30 rounded-lg">
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                              <span className="text-2xl">🎵</span>
                            </div>
                            <p className="text-sm opacity-80">A video about luxury travel to Europe</p>
                          </div>
                        </div>
                      </div>

                      {/* Music Control Panel */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-800 font-medium text-sm">A video about luxury travel to Europe</span>
                            <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">Generate</button>
                          </div>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div>• Narrate the video in a British accent</div>
                            <div>• Add three more scenes with summer destinations</div>
                            <div>• Delete the second scene</div>
                          </div>
                        </div>
                      </div>

                      {/* Music Thumbnails */}
                      <div className="absolute right-4 top-4 space-y-2">
                        <div className="w-16 h-12 bg-blue-500 rounded-md"></div>
                        <div className="w-16 h-12 bg-purple-500 rounded-md"></div>
                        <div className="w-16 h-12 bg-pink-500 rounded-md"></div>
                      </div>
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
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
                    Instantly produced images and videos
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Get professional-quality videos in minutes, not hours. Our advanced processing engine 
                    ensures fast rendering without compromising on quality.
                  </p>
                </motion.div>
                
                {/* Mobile: Mockup */}
                <motion.div
                  className="px-2 mb-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="relative mx-auto max-w-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                        <div className="aspect-video bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative">
                          <div className="absolute inset-0 flex items-center justify-center p-2">
                            <div className="text-center text-white">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                                <span className="text-lg">⚡</span>
                              </div>
                              <p className="text-xs opacity-80">Generated in 2 minutes</p>
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
                              <div className="flex items-center justify-between text-white text-xs">
                                <span>Rendering complete ✓</span>
                                <span>00:45 / 00:45</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-md aspect-video flex items-center justify-center">
                        <span className="text-white text-xs">HD 1080p</span>
                      </div>
                      <div className="bg-gray-800 rounded-md aspect-video flex items-center justify-center">
                        <span className="text-white text-xs">Mobile</span>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⚡ 2 min
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
                      <span className="text-sm text-gray-700">HD quality output</span>
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
                  <h3 className="text-3xl xl:text-4xl font-bold text-white mb-6 leading-tight">
                    Instantly produced images and videos
                  </h3>
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed">
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
                      <span className="text-base text-gray-700">HD quality output</span>
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

                {/* Right Column - Output Showcase Mockup */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="relative">
                    {/* Multiple Video Outputs */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Main Video */}
                      <div className="col-span-2 bg-gray-900 rounded-xl overflow-hidden shadow-xl">
                        <div className="aspect-video bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                <span className="text-2xl">⚡</span>
                              </div>
                              <p className="text-sm opacity-80">Generated in 2 minutes</p>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between text-white text-sm">
                                <span>Rendering complete ✓</span>
                                <span>00:45 / 00:45</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Thumbnail Outputs */}
                      <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                        <span className="text-white text-xs">HD 1080p</span>
                      </div>
                      <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                        <span className="text-white text-xs">Mobile</span>
                      </div>
                    </div>
                    
                    {/* Speed Badge */}
                    <div className="absolute -top-3 -right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ⚡ 2 min
                    </div>
                  </div>
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
                    How to turn your photos and music into videos with Qwgenv
                  </h2>
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    Transform your photos and music into professional videos with our simple 4-step process. No technical skills required.
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
                      <p className="text-gray-300">Upload your photos or videos using our drag-and-drop interface. Mix and match your media files.</p>
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
                      <h3 className="text-xl font-bold text-white mb-2">Build your cast & settings</h3>
                      <p className="text-gray-300">Choose from our curated music library or upload your own soundtrack to set the perfect mood.</p>
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
                      <h3 className="text-xl font-bold text-white mb-2">Perfect your motion</h3>
                      <p className="text-gray-300">Let our AI generate a professional slideshow video with smooth transitions in just minutes.</p>
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
                      <h3 className="text-xl font-bold text-white mb-2">Share your project</h3>
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Explore related posts
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
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/blog#video-topics')}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-purple-500 p-6 flex items-center justify-center">
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
                    <h3 className="text-xl font-bold text-white mb-2">Pick Smarter Video Topics</h3>
                    <p className="text-blue-100 text-sm">Learn strategies to choose engaging topics that resonate with your audience</p>
                  </div>
                </motion.div>

                {/* Card 2: Video Editing Tips */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/blog#generate-edit')}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-green-400 to-teal-500 p-6 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop&crop=center"
                      alt="Video editing workspace"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzk5QTNBRSIvPgo8L3N2Zz4K";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Video Editing Tips for Beginners</h3>
                    <p className="text-green-100 text-sm">Master essential editing techniques to create professional-looking videos</p>
                  </div>
                </motion.div>

                {/* Card 3: Music Selection */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-pink-500 via-rose-600 to-red-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/blog#audio-quality')}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-pink-400 to-red-500 p-6 flex items-center justify-center">
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
                    <h3 className="text-xl font-bold text-white mb-2">Music Selection for Videos</h3>
                    <p className="text-pink-100 text-sm">Choose the perfect soundtrack to enhance your video's emotional impact</p>
                  </div>
                </motion.div>

                {/* Card 4: Thumbnail Creation */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/blog#better-media')}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-yellow-500 p-6 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1586717799252-bd134ad00e26?w=400&h=300&fit=crop&crop=center"
                      alt="Thumbnail design examples"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjgwIiB5PSI4MCIgd2lkdGg9IjI0MCIgaGVpZ2h0PSIxNDAiIGZpbGw9IiM5OUEzQUUiLz4KPHN2Zz4K";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Creating Engaging Thumbnails</h3>
                    <p className="text-orange-100 text-sm">Design eye-catching thumbnails that boost your video click-through rates</p>
                  </div>
                </motion.div>

                {/* Card 5: Video Marketing */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/blog#share-promote')}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-indigo-400 to-cyan-500 p-6 flex items-center justify-center">
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
                    <h3 className="text-xl font-bold text-white mb-2">Video Marketing Strategies</h3>
                    <p className="text-indigo-100 text-sm">Proven tactics to promote your videos and grow your audience effectively</p>
                  </div>
                </motion.div>

                {/* Card 6: Social Media Formats */}
                <motion.div
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/blog#lighting-content')}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-violet-400 to-fuchsia-500 p-6 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop&crop=center"
                      alt="Social media platforms interface"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM5OUEzQUUiLz4KPHJlY3QgeD0iMjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM5OUEzQUUiLz4KPHJlY3QgeD0iMTUwIiB5PSIxNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjOTlBM0FFIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMjAiIGZpbGw9IiM5OUEzQUUiLz4KPHN2Zz4K";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Social Media Video Formats</h3>
                    <p className="text-violet-100 text-sm">Optimize your videos for different social platforms and audiences</p>
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

      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Comments/Feedback Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <UserComments sessionId={sessionId} />
        </motion.section>
      </motion.main>

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
              {t('aboutUs')}
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="hover:text-white transition-colors cursor-pointer mb-2"
            >
              {t('contactUs')}
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer mb-2"
            >
              {t('privacyPolicy')}
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-white transition-colors cursor-pointer mb-2"
            >
              {t('termsOfService')}
            </button>
          </div>
          <div className="text-center mt-8 text-gray-400">
            <p>&copy; 2025 QWGenv. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </motion.footer>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title={t('aboutUs')}
      >
        {modalContent.about}
      </Modal>

      <Modal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title={t('contactUs')}
      >
        {modalContent.contact}
      </Modal>

      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title={t('privacyPolicy')}
      >
        {modalContent.privacy}
      </Modal>

      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title={t('termsOfService')}
      >
        {modalContent.terms}
      </Modal>

      {/* Image Dialog */}
      <AnimatePresence>
        {hoveredImage !== null && (() => {
          const imageNames = ['upload photo.png', 'select music.png', 'generate video.png'];
          return (
            <motion.div
              className="fixed z-50 pointer-events-none"
              style={{
                left: imageDialogPosition.x,
                top: imageDialogPosition.y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative inline-block">
                {/* Photo container that sizes to content */}
                <div className="relative inline-block">
                  <img
                    src={`/local-img/${imageNames[hoveredImage]}`}
                    alt={stepImages[hoveredImage].step}
                    className="max-w-96 max-h-96 w-auto h-auto rounded-2xl shadow-2xl"
                  />

                  {/* Decorative frame overlay that matches image size */}
                  <div className="absolute inset-0 rounded-2xl border-4 border-emerald-300/60 pointer-events-none"></div>

                  {/* Larger decorative frame behind */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/30 via-cyan-400/20 to-teal-400/30 rounded-3xl blur-sm -z-10"></div>
                  <div className="absolute -inset-3 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl -z-10"></div>

                  {/* Inner frame border */}
                  <div className="absolute inset-3 border-2 border-white/30 rounded-xl pointer-events-none"></div>

                  {/* Corner decorations */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-l-4 border-t-4 border-emerald-400/80 rounded-tl"></div>
                  <div className="absolute top-3 right-3 w-4 h-4 border-r-4 border-t-4 border-emerald-400/80 rounded-tr"></div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-l-4 border-b-4 border-emerald-400/80 rounded-bl"></div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-r-4 border-b-4 border-emerald-400/80 rounded-br"></div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </>
  )
}

export default Home