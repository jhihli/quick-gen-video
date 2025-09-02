import React, { useState } from 'react'
import { motion } from 'framer-motion'

const YouTubeVideo = ({ videoId, title = "Watch Tutorial" }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url) => {
    if (!url) return videoId

    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : videoId
  }

  const finalVideoId = extractVideoId(videoId)
  const thumbnailUrl = `https://img.youtube.com/vi/${finalVideoId}/maxresdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${finalVideoId}?autoplay=1&rel=0&modestbranding=1`

  const handlePlayClick = () => {
    setIsPlaying(true)
    setIsLoaded(true)
  }

  return (
    <motion.div
      className="relative bg-gradient-to-br from-red-900/20 via-orange-800/10 to-red-900/20 backdrop-blur-sm border border-red-300/20 rounded-xl p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.01,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)"
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-0 right-0 w-20 h-20 bg-red-400/30 rounded-full blur-2xl"
          animate={{
            x: [0, -15, 0],
            y: [0, 8, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/20 rounded-full blur-xl"
          animate={{
            x: [0, 10, 0],
            y: [0, -5, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white mr-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <span className="text-red-300 text-sm font-semibold uppercase tracking-wider mr-2">
                Video Reference
              </span>
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-red-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">
              {title}
            </h3>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative z-10">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 border border-red-300/30">
          {!isPlaying ? (
            // Thumbnail with Play Button
            <div className="relative w-full h-full cursor-pointer group" onClick={handlePlayClick}>
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${finalVideoId}/hqdefault.jpg`
                }}
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                <motion.div
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-red-500 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.4)",
                      "0 0 0 20px rgba(239, 68, 68, 0)",
                      "0 0 0 0 rgba(239, 68, 68, 0)"
                    ]
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                >
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>

              {/* Video Duration Badge (Optional) */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                Tutorial
              </div>
            </div>
          ) : (
            // YouTube Embed
            <iframe
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => setIsLoaded(true)}
            />
          )}
        </div>

        {/* Video Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-red-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V4a1 1 0 00-1-1H4a1 1 0 00-1 1v5h4v6a1 1 0 001 1h8a1 1 0 001-1v-6h4z" />
            </svg>
            Learn by Watching
          </div>
          <motion.a
            href={`https://www.youtube.com/watch?v=${finalVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-1">📺</span>
            Watch on YouTube
          </motion.a>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-16 h-16">
        <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-red-400/50 rounded-tl"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16">
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-red-400/50 rounded-br"></div>
      </div>
    </motion.div>
  )
}

export default YouTubeVideo