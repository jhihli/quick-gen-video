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
  showCloseButton = true 
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
                  className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-white text-xl font-semibold">{title}</h2>
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