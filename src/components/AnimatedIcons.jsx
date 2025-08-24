import React from 'react'
import { motion } from 'framer-motion'

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
      type: "spring",
      stiffness: 200
    }
  },
  hover: {
    scale: 1.1,
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.3,
      rotate: {
        duration: 0.6,
        repeat: 2
      }
    }
  }
}

export const PhotoUploadIcon = ({ size = 24, className = "" }) => (
  <motion.div
    variants={iconVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className={`w-${size} h-${size} ${className}`}
  >
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="w-full h-full"
    >
      <motion.path
        d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />
      <motion.circle
        cx="8.5"
        cy="10.5"
        r="1.5"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      <motion.path
        d="m3 16 4-4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />
      <motion.path
        d="M16 19h6m-3-3v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, rotate: -90 }}
        animate={{ pathLength: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      />
    </svg>
  </motion.div>
)

export const MusicIcon = ({ size = 24, className = "" }) => (
  <motion.div
    variants={iconVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className={`w-${size} h-${size} ${className}`}
  >
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="w-full h-full"
    >
      <motion.path
        d="M9 18V5l12-2v13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      <motion.circle
        cx="6"
        cy="18"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: 1,
          rotate: 360
        }}
        transition={{ 
          duration: 1,
          delay: 1,
          type: "spring",
          stiffness: 200
        }}
      />
      <motion.circle
        cx="18"
        cy="16"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: 1,
          rotate: -360
        }}
        transition={{ 
          duration: 1,
          delay: 1.2,
          type: "spring",
          stiffness: 200
        }}
      />
      {/* Sound waves */}
      <motion.path
        d="M22 12c0-2-1-3-1-3m0 6s1-1 1-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ opacity: 0, x: -10 }}
        animate={{ 
          opacity: 1,
          x: 0
        }}
        transition={{ 
          duration: 1,
          delay: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
    </svg>
  </motion.div>
)

export const VideoIcon = ({ size = 24, className = "" }) => (
  <motion.div
    variants={iconVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className={`w-${size} h-${size} ${className}`}
  >
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="w-full h-full"
    >
      <motion.path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />
      <motion.polyline
        points="14,2 14,8 20,8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      />
      <motion.polygon
        points="10,12 16,15 10,18"
        fill="currentColor"
        initial={{ scale: 0, rotate: 45 }}
        animate={{ 
          scale: 1, 
          rotate: 0
        }}
        transition={{ 
          duration: 1,
          delay: 1.5,
          type: "spring",
          stiffness: 200
        }}
      />
      {/* Sparkle effects */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.circle
          key={i}
          cx={18 - i * 2}
          cy={6 + i * 1.5}
          r="0.5"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1
          }}
          transition={{ 
            duration: 0.5,
            delay: 2 + i * 0.2,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1
          }}
        />
      ))}
    </svg>
  </motion.div>
)

export const LogoIcon = ({ size = 32, className = "" }) => (
  <motion.div
    className={`w-${size} h-${size} ${className}`}
    initial={{ scale: 0, rotate: -180 }}
    animate={{ 
      scale: 1, 
      rotate: 0,
    }}
    transition={{ 
      duration: 1,
      type: "spring",
      stiffness: 200,
      damping: 10
    }}
    whileHover={{ 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.5 }
    }}
  >
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      className="w-full h-full"
    >
      {/* Main camera body */}
      <motion.rect
        x="4"
        y="10"
        width="24"
        height="16"
        rx="3"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
      {/* Lens */}
      <motion.circle
        cx="16"
        cy="18"
        r="5"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
      />
      <motion.circle
        cx="16"
        cy="18"
        r="2"
        fill="url(#logoGradient)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      />
      {/* Flash */}
      <motion.rect
        x="8"
        y="6"
        width="4"
        height="4"
        rx="1"
        fill="url(#logoGradient)"
        initial={{ y: 2, opacity: 0 }}
        animate={{ y: 6, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      />
      {/* Film strip decoration */}
      <motion.rect
        x="1"
        y="12"
        width="2"
        height="1"
        fill="url(#logoGradient)"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.5, duration: 0.3 }}
      />
      <motion.rect
        x="1"
        y="15"
        width="2"
        height="1"
        fill="url(#logoGradient)"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.6, duration: 0.3 }}
      />
      <motion.rect
        x="1"
        y="18"
        width="2"
        height="1"
        fill="url(#logoGradient)"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.7, duration: 0.3 }}
      />
      <motion.rect
        x="1"
        y="21"
        width="2"
        height="1"
        fill="url(#logoGradient)"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.8, duration: 0.3 }}
      />
      
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
)