import React from 'react'
import { motion } from 'framer-motion'

const TipCard = ({ tip, index }) => {
  // Icon mapping for different tip types
  const getIcon = (title) => {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('audience') || lowerTitle.includes('community')) {
      return '👥'
    } else if (lowerTitle.includes('passionate') || lowerTitle.includes('choose') || lowerTitle.includes('idea')) {
      return '💡'
    } else if (lowerTitle.includes('familiar') || lowerTitle.includes('theme') || lowerTitle.includes('stick')) {
      return '🎯'
    } else if (lowerTitle.includes('research') || lowerTitle.includes('trending') || lowerTitle.includes('poll')) {
      return '📊'
    } else if (lowerTitle.includes('plan') || lowerTitle.includes('sequence') || lowerTitle.includes('organize')) {
      return '📋'
    } else if (lowerTitle.includes('file') || lowerTitle.includes('compatibility') || lowerTitle.includes('check')) {
      return '📁'
    } else if (lowerTitle.includes('environment') || lowerTitle.includes('prep') || lowerTitle.includes('setup')) {
      return '⚙️'
    } else if (lowerTitle.includes('clear') || lowerTitle.includes('quality') || lowerTitle.includes('resolution')) {
      return '🔍'
    } else if (lowerTitle.includes('stabilize') || lowerTitle.includes('tripod') || lowerTitle.includes('steady')) {
      return '📷'
    } else if (lowerTitle.includes('frame') || lowerTitle.includes('composition') || lowerTitle.includes('thirds')) {
      return '🖼️'
    } else if (lowerTitle.includes('extra') || lowerTitle.includes('roll') || lowerTitle.includes('variety')) {
      return '🎬'
    } else if (lowerTitle.includes('light') || lowerTitle.includes('natural') || lowerTitle.includes('soft')) {
      return '💡'
    } else if (lowerTitle.includes('point') || lowerTitle.includes('lighting') || lowerTitle.includes('setup')) {
      return '🎭'
    } else if (lowerTitle.includes('soften') || lowerTitle.includes('diffuse') || lowerTitle.includes('household')) {
      return '🏠'
    } else if (lowerTitle.includes('match') || lowerTitle.includes('color') || lowerTitle.includes('tone')) {
      return '🎨'
    } else if (lowerTitle.includes('music') || lowerTitle.includes('audio') || lowerTitle.includes('sound')) {
      return '🎵'
    } else if (lowerTitle.includes('monitor') || lowerTitle.includes('level') || lowerTitle.includes('volume')) {
      return '🔊'
    } else if (lowerTitle.includes('record') || lowerTitle.includes('quiet') || lowerTitle.includes('voice')) {
      return '🎤'
    } else if (lowerTitle.includes('outdoor') || lowerTitle.includes('wind') || lowerTitle.includes('protect')) {
      return '🌬️'
    } else if (lowerTitle.includes('time') || lowerTitle.includes('transition') || lowerTitle.includes('duration')) {
      return '⏱️'
    } else if (lowerTitle.includes('mood') || lowerTitle.includes('match') || lowerTitle.includes('sync')) {
      return '🎭'
    } else if (lowerTitle.includes('color') || lowerTitle.includes('tweak') || lowerTitle.includes('adjust')) {
      return '🎨'
    } else if (lowerTitle.includes('platform') || lowerTitle.includes('optimize') || lowerTitle.includes('upload')) {
      return '🚀'
    } else if (lowerTitle.includes('description') || lowerTitle.includes('write') || lowerTitle.includes('seo')) {
      return '✍️'
    } else if (lowerTitle.includes('qr') || lowerTitle.includes('share') || lowerTitle.includes('mobile')) {
      return '📱'
    } else if (lowerTitle.includes('engagement') || lowerTitle.includes('encourage') || lowerTitle.includes('comment')) {
      return '💬'
    } else {
      return '💡' // Default icon
    }
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 hover:border-white/20 transition-all duration-300 group"
      whileHover={{ 
        scale: 1.01,
        y: -2,
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.25)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {/* Tip Header */}
      <div className="flex items-start mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center text-xl sm:text-2xl mr-3 sm:mr-4 flex-shrink-0 group-hover:from-cyan-400/30 group-hover:to-purple-500/30 transition-all duration-300">
          {getIcon(tip.title)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300 leading-tight">
            <span className="block sm:inline">Tip {index + 1}:</span> <span className="block sm:inline">{tip.title}</span>
          </h4>
        </div>
      </div>

      {/* Tip Content */}
      <p className="text-sm sm:text-base text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
        {tip.content}
      </p>


      {/* Hover Effect Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        initial={false}
      />
    </motion.div>
  )
}

export default TipCard