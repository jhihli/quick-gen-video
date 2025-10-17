import React, { createContext, useContext, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Drawer } from 'vaul'

// Context for drawer state management
const DrawerContext = createContext(null)

export const useDrawer = () => {
  const context = useContext(DrawerContext)
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider')
  }
  return context
}

const BottomSheetDrawer = ({
  children,
  isOpen = false,
  onOpenChange,
  title = "",
  showCloseButton = true,
  modalWidth = "default" // "default", "wide", "narrow", "medium"
}) => {
  const [isDesktop, setIsDesktop] = useState(false)

  // Detect desktop vs mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleMediaChange = (event) => {
      setIsDesktop(event.matches)
    }

    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  // Desktop: Modal Dialog
  if (isDesktop) {
    return (
      <DrawerContext.Provider value={{ isOpen, onOpenChange }}>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => onOpenChange(false)}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => onOpenChange(false)}
              >
                <div
                  className={`relative w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${modalWidth === "wide"
                    ? "max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl"
                    : modalWidth === "narrow"
                      ? "w-80 max-w-80"
                      : modalWidth === "medium"
                        ? "max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"
                        : "max-w-md md:max-w-md lg:max-w-lg xl:max-w-xl"
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="relative flex items-center justify-between p-4 md:p-6 pb-3 md:pb-4">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      {/* Icon based on title */}
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        {(title === 'Upload Photos' || title.includes('Photos') || title.includes('Upload')) ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (title === 'Music Library' || title.includes('Music')) ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        ) : title.includes('Avatar') ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h2 className="text-white text-lg md:text-xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                          {title}
                        </h2>
                        <p className="text-gray-400 text-xs md:text-sm mt-0.5 hidden md:block">
                          {(title === 'Upload Photos' || title.includes('Photos') || title.includes('Upload')) ? 'Select your photos and videos' :
                           (title === 'Music Library' || title.includes('Music')) ? 'Choose your soundtrack' :
                           title.includes('Avatar') ? 'Pick your virtual companion' :
                           'Create your video'}
                        </p>
                      </div>
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={() => onOpenChange(false)}
                        className="group w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 flex items-center justify-center transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="max-h-[70vh] overflow-y-auto">
                    {children}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DrawerContext.Provider>
    )
  }

  // Mobile: Bottom Sheet Drawer
  return (
    <DrawerContext.Provider value={{ isOpen, onOpenChange }}>
      <Drawer.Root
        open={isOpen}
        onOpenChange={onOpenChange}
        shouldScaleBackground
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Drawer.Content className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 flex flex-col rounded-t-2xl h-fit fixed bottom-0 left-0 right-0 z-50">
            {/* Drag Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mt-4" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <Drawer.Title className="text-white text-xl font-semibold">{title}</Drawer.Title>
              {showCloseButton && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Hidden description for accessibility */}
            <Drawer.Description className="sr-only">
              {title} dialog content
            </Drawer.Description>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[70vh] px-6 pb-8">
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </DrawerContext.Provider>
  )
}

// Content wrapper component for better organization
export const DrawerContent = ({ children, className = "" }) => {
  return <div className={`${className}`}>{children}</div>
}

export default BottomSheetDrawer