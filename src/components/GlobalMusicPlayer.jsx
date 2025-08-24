import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function GlobalMusicPlayer({ currentTrack, isVisible, inline = false }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => {
      setIsLoading(false)
      // Auto-play when new track loads
      setIsPlaying(true)
      audio.play()
    }
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    const handleError = () => {
      setIsLoading(false)
      console.error('Audio loading error')
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Set volume
    audio.volume = volume

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [currentTrack?.url, volume])

  // Auto-play when track changes
  useEffect(() => {
    if (currentTrack) {
      setProgress(0)
      setCurrentTime(0)
      setIsPlaying(true)
    }
  }, [currentTrack?.url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
    setProgress((newTime / duration) * 100)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isVisible || !currentTrack) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: inline ? 20 : 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: inline ? -20 : 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={inline ? "relative" : "fixed bottom-0 left-0 right-0 z-50"}
      >
        {/* Single row Context7-inspired player with animated background */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-black border border-gray-800 rounded-xl p-3 shadow-2xl relative overflow-hidden">
            <audio ref={audioRef} src={currentTrack?.url} preload="metadata" />
            
            {/* Animated gradient background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-pink-900/30"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.2), rgba(236, 72, 153, 0.3))",
                  "linear-gradient(90deg, rgba(236, 72, 153, 0.3), rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.3))",
                  "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(236, 72, 153, 0.2), rgba(147, 51, 234, 0.3))",
                  "linear-gradient(45deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.2), rgba(236, 72, 153, 0.3))"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Floating orbs animation */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute w-20 h-20 bg-purple-500/10 rounded-full blur-xl"
                animate={{
                  x: ["-10%", "110%"],
                  y: ["20%", "80%", "20%"],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute w-16 h-16 bg-pink-500/10 rounded-full blur-xl"
                animate={{
                  x: ["110%", "-10%"],
                  y: ["60%", "30%", "70%"],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2
                }}
              />
            </div>
            
            <div className="relative z-10 grid grid-cols-12 gap-2 items-center">
              {/* Progress Bar - 8 columns */}
              <div className="col-span-8 flex items-center space-x-2">
                <span className="text-xs text-gray-300 tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 bg-gray-700 rounded-full h-2 cursor-pointer relative overflow-hidden group"
                  onClick={handleProgressClick}
                >
                  <motion.div
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full shadow-sm"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                </div>
                <span className="text-xs text-gray-300 tabular-nums w-8">{formatTime(duration)}</span>
              </div>

              {/* Player Controls - 2 columns */}
              <div className="col-span-2 flex items-center justify-start pl-2">
                <motion.button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 flex items-center justify-center disabled:opacity-50 shadow-lg border border-white/20 backdrop-blur-sm"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={isPlaying ? {
                    boxShadow: [
                      "0 0 15px rgba(147, 51, 234, 0.4)",
                      "0 0 25px rgba(236, 72, 153, 0.6)",
                      "0 0 15px rgba(147, 51, 234, 0.4)"
                    ]
                  } : {}}
                  transition={{ 
                    boxShadow: { duration: 2, repeat: Infinity },
                    scale: { duration: 0.2 }
                  }}
                >
                  {/* Animated ring around button when playing */}
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-white/30"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 0.2, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  {/* Button content */}
                  <div className="relative z-10">
                    {isLoading ? (
                      <motion.div
                        className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : isPlaying ? (
                      <motion.svg 
                        className="w-3 h-3 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </motion.svg>
                    ) : (
                      <motion.svg 
                        className="w-3 h-3 text-white ml-0.5" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path d="M8 5v14l11-7z"/>
                      </motion.svg>
                    )}
                  </div>
                  
                  {/* Pulsing background effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20"
                    animate={isPlaying ? {
                      scale: [1, 1.03, 1],
                      opacity: [0.3, 0.5, 0.3],
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.button>
              </div>

              {/* Volume - 2 columns */}
              <div className="col-span-2 flex items-center justify-center space-x-2">
                <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-12 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, rgba(168, 85, 247, 0.9) 0%, rgba(168, 85, 247, 0.9) ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GlobalMusicPlayer