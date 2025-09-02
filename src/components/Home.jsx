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

{/* Comments Section */}
        <motion.section ref={feedbackSectionRef} variants={itemVariants} className="mb-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-900/30 via-purple-800/20 to-fuchsia-900/30 backdrop-blur-xl border border-violet-300/20 rounded-3xl p-8 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-15">
              <motion.div
                className="absolute top-0 right-0 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl"
                animate={{
                  x: [0, -80, 0],
                  y: [0, 60, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-xl"
                animate={{
                  x: [0, 90, 0],
                  y: [0, -40, 0],
                  rotate: [0, 270, 360],
                }}
                transition={{
                  duration: 11,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-400/15 rounded-full blur-lg"
                animate={{
                  x: [0, -30, 30, 0],
                  y: [0, 20, -20, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div className="relative z-10">

              {/* Modern UserComments Component */}
              {sessionId && (
                <UserComments
                  sessionId={sessionId}
                  onCommentSubmit={(comments) => {
                    console.log('💬 Home page comments updated:', comments.length, 'total comments');
                  }}
                />
              )}
            </div>
          </div>
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