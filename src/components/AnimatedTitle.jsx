import React, { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'

const AnimatedTitle = ({ 
  children, 
  variant = "default",
  className = "",
  delay = 0,
  icon = null,
  particles = false 
}) => {
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { 
    once: true,
    amount: 0.1
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const titleVariants = {
    default: {
      hidden: { 
        opacity: 0, 
        y: 50,
        scale: 0.8 
      },
      visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: { 
          duration: 0.8, 
          delay,
          type: "spring",
          stiffness: 100,
          damping: 10
        }
      }
    },
    typewriter: {
      hidden: { 
        opacity: 0,
        width: 0 
      },
      visible: { 
        opacity: 1,
        width: "auto",
        transition: { 
          duration: 1.5, 
          delay,
          ease: "easeOut"
        }
      }
    },
    glow: {
      hidden: { 
        opacity: 0,
        textShadow: "0 0 0px rgba(59, 130, 246, 0)" 
      },
      visible: { 
        opacity: 1,
        textShadow: "0 0 20px rgba(59, 130, 246, 0.8)",
        transition: { 
          duration: 1, 
          delay,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 2
        }
      }
    },
    morphing: {
      hidden: { 
        opacity: 0,
        rotateX: -90,
        transformPerspective: 1000
      },
      visible: { 
        opacity: 1,
        rotateX: 0,
        transition: { 
          duration: 1, 
          delay,
          type: "spring",
          stiffness: 200,
          damping: 15
        }
      }
    },
    floating: {
      hidden: { 
        opacity: 0, 
        y: 100 
      },
      visible: { 
        opacity: 1, 
        y: -10,
        transition: { 
          duration: 0.8, 
          delay,
          y: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }
      }
    },
    stagger: {
      hidden: { 
        opacity: 0 
      },
      visible: { 
        opacity: 1,
        transition: { 
          duration: 0.5, 
          delay: delay 
        }
      }
    }
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: delay + i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  }

  const iconVariants = {
    hidden: { 
      scale: 0, 
      rotate: -180,
      opacity: 0 
    },
    visible: { 
      scale: 1, 
      rotate: 0,
      opacity: 1,
      transition: { 
        duration: 0.6, 
        delay: delay + 0.3,
        type: "spring",
        stiffness: 200
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { 
        duration: 0.5 
      }
    }
  }

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      transition: {
        duration: 1.5,
        delay: delay + Math.random() * 2,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: Math.random() * 3
      }
    })
  }

  const renderStaggeredText = (text) => {
    return text.split('').map((letter, i) => (
      <motion.span
        key={i}
        custom={i}
        variants={letterVariants}
        initial="hidden"
        animate={controls}
        className="inline-block bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent font-bold"
        style={{ 
          transformOrigin: "50% 50%",
          transformStyle: "preserve-3d"
        }}
      >
        {letter === ' ' ? '\u00A0' : letter}
      </motion.span>
    ))
  }

  const renderParticles = () => {
    if (!particles) return null
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={particleVariants}
            initial="hidden"
            animate={controls}
            className="absolute w-2 h-2 bg-blue-400 rounded-full blur-sm"
            style={{
              left: '50%',
              top: '50%'
            }}
          />
        ))}
      </div>
    )
  }

  const baseClasses = `relative inline-block font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent ${className}`

  return (
    <motion.div
      ref={ref}
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {renderParticles()}
      
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="flex items-center justify-center">
            {icon}
          </div>
        )}

        {variant === "stagger" ? (
          <motion.h1 
            className={baseClasses}
            style={{ 
              transformStyle: "preserve-3d",
              perspective: 1000
            }}
          >
            {renderStaggeredText(children)}
          </motion.h1>
        ) : variant === "typewriter" ? (
          <motion.h1
            variants={titleVariants.typewriter}
            initial="hidden"
            animate={controls}
            className={`${baseClasses} overflow-hidden whitespace-nowrap border-r-2 border-blue-500`}
          >
            {children}
          </motion.h1>
        ) : (
          <motion.h1
            variants={titleVariants[variant] || titleVariants.default}
            initial="hidden"
            animate={controls}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            className={baseClasses}
            style={variant === "morphing" ? { 
              transformStyle: "preserve-3d",
              perspective: 1000
            } : {}}
          >
            {children}
          </motion.h1>
        )}
      </div>

      {/* Animated underline */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={controls}
        transition={{ delay: delay + 0.5, duration: 0.8 }}
        className="h-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full mt-2 origin-left"
      />

      {/* Hover effect overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg blur-xl -z-10"
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default AnimatedTitle