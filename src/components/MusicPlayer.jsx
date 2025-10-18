import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

function MusicPlayer({ track, onSelect, isSelected }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
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

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [track.url])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-lg border rounded-xl p-4 transition-all duration-300 ${
        isSelected 
          ? 'border-purple-400 bg-purple-500/20' 
          : 'border-white/20 hover:border-purple-400/50 hover:bg-white/15'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <audio ref={audioRef} src={track.url} preload="metadata" />
      
      <div className="flex items-center space-x-3">
        {/* Play/Stop Button */}
        <motion.button
          onClick={togglePlay}
          disabled={isLoading}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : isPlaying 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-purple-500 hover:bg-purple-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
            </svg>
          )}
        </motion.button>

        {/* Track Info and Progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-white truncate">
              {track.title || track.originalname}
            </h4>
            <span className="text-xs text-purple-300">
              {duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)}` : '--:-- / --:--'}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div 
            className="w-full bg-gray-700 rounded-full h-2 cursor-pointer relative overflow-hidden"
            onClick={handleProgressClick}
          >
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full" />
          </div>
        </div>

        {/* Select/Remove Button */}
        <motion.button
          onClick={() => onSelect(track)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
            isSelected
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSelected ? 'Remove' : 'Select'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default MusicPlayer