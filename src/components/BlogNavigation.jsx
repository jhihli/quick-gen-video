import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BlogNavigation = ({ sections, activeSection, setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide navigation when scrolling down, show when scrolling up
  useEffect(() => {
    let lastScrollY = window.scrollY
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track active section based on scroll position
  useEffect(() => {
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, observerOptions)

    // Observe all sections
    sections.forEach(section => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [sections, setActiveSection])

  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  if (isMobile) {
    return (
      <>
        {/* Side Edge Trigger */}
        <motion.div 
          className="fixed left-0 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-r-full z-50 cursor-pointer"
          onClick={() => setIsExpanded(true)}
          animate={{
            opacity: isVisible ? 1 : 0,
            x: isVisible ? 0 : -10
          }}
          whileHover={{ width: 6 }}
          whileTap={{ scale: 1.1 }}
        />
        
        {/* Side Panel Overlay */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            >
              <motion.div
                className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-slate-900/95 via-gray-800/90 to-slate-900/95 backdrop-blur-xl border-r border-white/20 overflow-y-auto"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <div className="flex justify-end p-4">
                  <motion.button
                    onClick={() => setIsExpanded(false)}
                    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Header */}
                <div className="px-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Quick Navigation</h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                </div>
                
                {/* Navigation Items */}
                <div className="px-4 space-y-2 pb-4">
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      onClick={() => handleNavClick(section.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 group ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center min-h-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 transition-all duration-300 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white scale-110'
                            : 'bg-gray-600/50 text-gray-300 group-hover:bg-gray-500/50'
                        }`}>
                          {section.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium text-sm transition-colors duration-300 leading-tight line-clamp-1 ${
                            activeSection === section.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {section.title}
                          </span>
                        </div>
                        <div className={`flex-shrink-0 ml-2 transition-transform duration-300 ${
                          activeSection === section.id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-400'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="px-6 pb-6">
                  <motion.a
                    href="/generator"
                    className="block w-full text-center py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-2">🚀</span>
                    Try QWGenv Now
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Desktop Navigation
  return (
    <motion.nav
      className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 w-80"
      animate={{
        opacity: isVisible ? 1 : 0,
        x: isVisible ? 0 : 20
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-br from-slate-800/90 via-gray-800/80 to-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Quick Navigation</h3>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mx-auto"></div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50'
                  : 'hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
              whileHover={{ x: 4 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white scale-110'
                    : 'bg-gray-600 text-gray-300 group-hover:bg-gray-500'
                }`}>
                  {section.number}
                </div>
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === section.id 
                    ? 'text-white' 
                    : 'text-gray-300 group-hover:text-white'
                }`}>
                  {section.title}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          className="mt-6 pt-4 border-t border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <a
            href="/generator"
            className="block w-full text-center py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white font-bold text-sm rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">🚀</span>
            Try QWGenv Now
          </a>
        </motion.div>
      </div>
    </motion.nav>
  )
}

export default BlogNavigation