import React, { useState, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { useSessionHeartbeat } from '../hooks/useSessionHeartbeat'
import DownloadOptions from './DownloadOptions'

function VideoExport({ onNewVideo }) {
  const { photos, selectedMusic, cleanupAndReset, setVideo, generatedVideo } = useContext(AppContext)
  const { t } = useLanguage()
  const { sessionId } = useSessionHeartbeat()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoData, setVideoData] = useState(null)
  const [error, setError] = useState(null)
  const [showError, setShowError] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showReadyMessage, setShowReadyMessage] = useState(true)

  const showErrorMessage = (message) => {
    setError(message)
    setShowError(true)
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowError(false)
      setTimeout(() => setError(null), 500) // Clear message after fade out
    }, 3000)
  }
  const [qrCodeData, setQrCodeData] = useState(null)
  const [loadingQrCode, setLoadingQrCode] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [tempUrl, setTempUrl] = useState(null)
  const [videoId, setVideoId] = useState(null)
  const [rateLimitStatus, setRateLimitStatus] = useState(null)

  // Fetch rate limit status
  const fetchRateLimitStatus = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/rate-limit-status?sessionId=${sessionId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRateLimitStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch rate limit status:', error);
    }
  };

  // Fetch rate limit status on component mount and when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchRateLimitStatus();
    }
  }, [sessionId]);

  // Sync local video state with global video state
  useEffect(() => {
    if (generatedVideo && !videoData) {
      // Global video exists but local state is empty (after navigation), restore from global state
      setVideoData(generatedVideo)
      setProgress(100)
      setError(null)
      setShowError(false)
      setShowSuccessMessage(false) // Don't show success message when restoring from global state
      setShowReadyMessage(false) // Don't show ready message when restoring from global state
    } else if (!generatedVideo && videoData) {
      // Global video was cleared (likely from confirmation dialog), reset local state
      setVideoData(null)
      setProgress(0)
      setError(null)
      setQrCodeData(null)
      setShowQrCode(false)
      setTempUrl(null)
      setVideoId(null)
      setShowError(false)
      setShowSuccessMessage(false)
      setShowReadyMessage(true) // Show ready message again when resetting
    }
  }, [generatedVideo, videoData])

  // Check if we have the required inputs and music
  const canGenerate = photos.length > 0 && selectedMusic
  
  // Auto-hide ready message after 5 seconds
  useEffect(() => {
    if (canGenerate && !videoData && showReadyMessage) {
      const timer = setTimeout(() => {
        setShowReadyMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [canGenerate, videoData, showReadyMessage])
    
  // Debug logging
  console.log('Generate button state:', {
    hasPhotos: photos.length > 0,
    hasMusic: !!selectedMusic,
    musicType: selectedMusic?.type,
    musicUrl: selectedMusic?.url,
    canGenerate
  })

  const generateVideo = async () => {
    if (!canGenerate) {
      setError(t('pleaseFillRequirements'))
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setVideoData(null)
    setShowReadyMessage(false) // Hide ready message when starting generation

    try {
      console.log('Starting video generation...')
      console.log('Photos:', photos)
      console.log('Selected Music:', selectedMusic)

      // Calculate duration - minimum 10 seconds per photo, minimum 30 seconds total
      const minTimePerPhoto = 10;
      const minTotalDuration = 30;
      const calculatedDuration = photos.length * minTimePerPhoto;
      const actualDuration = Math.max(calculatedDuration, minTotalDuration);

      console.log(`Using ${actualDuration} seconds duration for ${photos.length} photos`);

      // Start video generation and get job ID
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photos: photos,
          music: selectedMusic,
          sessionId: sessionId,
          settings: {
            duration: actualDuration,
            fps: 25,
            resolution: '1280x720'
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting errors specifically
        if (response.status === 429 && data.error === 'Rate limit exceeded') {
          const rateLimitMessage = `🚫 ${data.message}\n\n` +
            `📊 Usage: ${data.hourlyAttempts}/${data.hourlyLimit} per hour, ${data.dailyAttempts}/${data.dailyLimit} per day\n\n` +
            `${data.nextReset ? `⏰ Next available: ${new Date(data.nextReset).toLocaleString()}` : ''}`;
          showErrorMessage(rateLimitMessage);
          return; // Don't throw, just show error and return
        }
        
        // Handle video duration validation errors specifically
        if (data.invalidFiles) {
          const errorMessage = `❌ ${data.message}\n\nInvalid files:\n${data.invalidFiles.join('\n')}\n\n${data.details}`;
          showErrorMessage(errorMessage);
          return; // Don't throw, just show error and return
        }
        
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success && data.jobId) {
        console.log('Video generation started, job ID:', data.jobId)
        
        // Start polling for progress
        const pollProgress = async () => {
          try {
            const progressResponse = await fetch(`/api/video-progress/${data.jobId}`, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
            const progressData = await progressResponse.json()

            if (progressResponse.ok) {
              console.log('Progress update:', progressData)
              setProgress(progressData.progress || 0)

              if (progressData.status === 'completed' && progressData.videoData) {
                setVideoData(progressData.videoData)
                setVideo(progressData.videoData) // Mark video as generated in context
                setProgress(100)
                setIsProcessing(false)
                setShowSuccessMessage(true)
                console.log('Video generated successfully:', progressData.videoData)
                
                // Refresh rate limit status after successful generation
                fetchRateLimitStatus()
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                  setShowSuccessMessage(false)
                }, 5000)
                // Generate QR code for mobile users
                if (progressData.videoData && progressData.videoData.tempUrl) {
                  // Use environment variable for base URL or fallback to current origin
                  const baseUrl = import.meta.env.REACT_APP_BASE_URL || window.location.origin
                  
                  const fullTempUrl = `${baseUrl}${progressData.videoData.tempUrl}?mobile=true&qr=true&t=${Date.now()}`
                  
                  console.log('QR Code URL:', fullTempUrl) // Debug log
                  setTempUrl(fullTempUrl)
                  setVideoId(progressData.videoData.tempUrlId)
                  await generateQrCodeForUrl(fullTempUrl, progressData.videoData.expiresAt)
                }
              } else if (progressData.status === 'error') {
                throw new Error(progressData.error || t('videoProcessingFailed'))
              } else if (progressData.status === 'processing' || progressData.status === 'initializing') {
                // Continue polling
                setTimeout(pollProgress, 1000) // Poll every second
              }
            } else {
              throw new Error(progressData.error || t('failedToGetProgress'))
            }
          } catch (pollError) {
            console.error('Progress polling error:', pollError)
            setError(pollError.message)
            setIsProcessing(false)
          }
        }

        // Start polling immediately
        setTimeout(pollProgress, 500)
        
      } else {
        throw new Error(data.error || t('unknownErrorOccurred'))
      }

    } catch (err) {
      console.error('Video generation failed:', err)
      
      // Show more helpful error messages
      if (err.message.includes('Demo music cannot be used')) {
        showErrorMessage('Demo music cannot be used for video generation. Please either:\n1. Upload your own music file, or\n2. Set up Jamendo API for real music tracks')
      } else {
        showErrorMessage(err.message)
      }
      setIsProcessing(false)
    }
  }

  const downloadVideo = async () => {
    if (!videoData) return

    try {
      // Mobile-friendly download approach
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        // For mobile devices, try multiple approaches
        await downloadVideoMobile()
      } else {
        // Desktop download
        await downloadVideoDesktop()
      }

      // Cleanup files after download
      try {
        await fetch('/api/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            photos: photos,
            videos: [videoData],
            music: selectedMusic ? [selectedMusic] : []
          })
        })
        console.log('Files cleaned up after download')
      } catch (error) {
        console.error('Cleanup after download failed:', error)
      }
    } catch (error) {
      console.error('Download failed:', error)
      setError('Download failed: ' + error.message)
    }
  }

  const downloadVideoDesktop = async () => {
    // Standard desktop download
    try {
      const filename = videoData.filename || 'tkvgen-video.mp4'
      
      // Try using the temp URL with download parameter if available (better for direct downloads)
      if (tempUrl) {
        const tempDownloadUrl = `${tempUrl}?download=true`
        const link = document.createElement('a')
        link.href = tempDownloadUrl
        link.download = filename
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Fallback to regular video URL with download parameter
        const link = document.createElement('a')
        link.href = `${videoData.url}?download=true`
        link.download = filename
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Desktop download failed:', error)
      // Final fallback
      window.open(videoData.url, '_blank')
    }
  }

  const downloadVideoMobile = async () => {
    // Mobile-optimized download methods
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const filename = videoData.filename || 'tkvgen-video.mp4'

      // For iOS Safari - use temp URL with download parameter for better compatibility
      if (isIOS && tempUrl) {
        // Try to use the temporary URL with download parameter for better iOS compatibility
        const tempDownloadUrl = `${tempUrl}?download=true`
        window.open(tempDownloadUrl, '_blank')
        return
      }

      // Method 1: Try native sharing API first (iOS Safari, Android Chrome)
      if (navigator.share) {
        try {
          const response = await fetch(videoData.url, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          if (response.ok) {
            const blob = await response.blob()
            const file = new File([blob], filename, { type: 'video/mp4' })
            
            // For iOS, check canShare with files only (no text/title due to iOS limitations)
            const shareData = isIOS ? { files: [file] } : {
              title: 'TKVGen Video',
              text: 'Generated slideshow video',
              files: [file]
            }
            
            if (navigator.canShare && navigator.canShare(shareData)) {
              console.log('Using Web Share API for iOS video sharing')
              await navigator.share(shareData)
              return
            }
          }
        } catch (shareError) {
          console.log('Native sharing failed, trying download methods:', shareError)
        }
      }

      // Method 2: Fetch as blob and create download
      const response = await fetch(videoData.url, {
        headers: {
          'Range': 'bytes=0-'  // Important for mobile video downloads
        }
      })
      
      if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`)
      
      const blob = await response.blob()
      
      // Method 3: Blob URL download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.setAttribute('download', filename)
      link.style.display = 'none'
      
      document.body.appendChild(link)
      
      // For mobile, trigger the download
      if (isMobile) {
        // Use setTimeout to ensure link is in DOM
        setTimeout(() => {
          link.click()
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link)
            }
            URL.revokeObjectURL(blobUrl)
          }, 1000)
        }, 100)
      } else {
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }

    } catch (error) {
      console.error('Mobile download method failed:', error)
      
      // Fallback: Use temp URL with download parameter if available
      if (tempUrl) {
        const tempDownloadUrl = `${tempUrl}?download=true`
        window.open(tempDownloadUrl, '_blank')
      } else {
        window.open(`${videoData.url}?download=true`, '_blank')
      }
      
      // Removed iOS download instructions as requested
    }
  }


  const generateQrCodeForUrl = async (url, expiresAt) => {
    try {
      // Use qrcode library directly instead of backend generation
      const QRCode = await import('qrcode')
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      })
      
      setQrCodeData({
        qrCodeDataUrl: qrCodeDataUrl,
        videoUrl: url,
        expiresAt: expiresAt
      })
      
    } catch (error) {
      console.error('QR code generation failed:', error)
      setError('Failed to generate QR code: ' + error.message)
    }
  }

  const generateQrCode = async (tempUrlId) => {
    if (!tempUrlId) {
      console.error('No temp URL ID provided for QR code generation')
      return
    }

    setLoadingQrCode(true)
    try {
      const response = await fetch(`/api/qr-code/${tempUrlId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code')
      }

      setQrCodeData(data)
      console.log('QR code generated successfully:', data)
    } catch (err) {
      console.error('QR code generation failed:', err)
      setError('Failed to generate QR code: ' + err.message)
    } finally {
      setLoadingQrCode(false)
    }
  }

  const toggleQrCode = () => {
    setShowQrCode(!showQrCode)
  }


  return (
    <div className="space-y-4">
      <AnimatePresence>
        {showError && error && (
          <motion.div 
            className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <h4 className="font-semibold text-red-300">Error</h4>
            </div>
            <pre className="text-sm text-red-200 mt-2 whitespace-pre-wrap">{error}</pre>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!canGenerate && (
          <motion.div 
            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-xs">⚠</span>
              </motion.div>
              <p className="text-sm text-amber-200 font-medium">
                {t('pleaseFillRequirements')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combined Status Dialog */}
      <AnimatePresence>
        {((canGenerate && !videoData && showReadyMessage) || showSuccessMessage) && (() => {
          const minTimePerPhoto = 3;
          const maxTotalDuration = 30;
          const calculatedDuration = Math.min(photos.length * minTimePerPhoto, maxTotalDuration);
          const actualDuration = Math.max(calculatedDuration, 10);
          const timePerPhoto = actualDuration / photos.length;
          
          // Determine current status
          const isReady = canGenerate && !videoData;
          const isCompleted = videoData;
          
          return (
            <motion.div 
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-3 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                  animate={isCompleted ? { rotate: 360 } : { scale: [1, 1.1, 1] }}
                  transition={isCompleted ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </motion.div>
                <motion.h4 
                  className="font-medium text-green-300 text-sm"
                  layout
                >
                  {isCompleted ? t('videoGeneratedSuccessfully') : t('slideshowReady')}
                </motion.h4>
              </div>
              
              <AnimatePresence mode="wait">
                {isReady && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Just the title, no detailed text */}
                  </motion.div>
                )}
                
                {isCompleted && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-green-200 mb-1">
                      {t('yourVideoIsReady')}
                    </p>
                    <p className="text-xs text-green-400">
                      File: {videoData.filename} ({Math.round(videoData.size / 1024 / 1024 * 100) / 100} MB)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!videoData ? (
          <motion.div 
            key="generate-section"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Rate Limit Status */}
            <AnimatePresence>
              {rateLimitStatus && (
                <motion.div 
                  className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-3 mb-4 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <motion.div 
                      className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <span className="text-white text-xs">📊</span>
                    </motion.div>
                    <p className="text-sm text-blue-300 font-medium">{t('generationLimits')}</p>
                  </div>
                  <div className="text-xs text-blue-200 space-y-1">
                    <div className="flex justify-between">
                      <span>{t('hourly')}:</span>
                      <span className={rateLimitStatus.hourlyAttempts >= rateLimitStatus.hourlyLimit ? 'text-red-400' : 'text-green-400'}>
                        {rateLimitStatus.hourlyAttempts}/{rateLimitStatus.hourlyLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('daily')}:</span>
                      <span className={rateLimitStatus.dailyAttempts >= rateLimitStatus.dailyLimit ? 'text-red-400' : 'text-green-400'}>
                        {rateLimitStatus.dailyAttempts}/{rateLimitStatus.dailyLimit}
                      </span>
                    </div>
                    {!rateLimitStatus.canGenerate && rateLimitStatus.nextHourlyReset && (
                      <div className="text-center mt-2 pt-2 border-t border-blue-500/20">
                        <span className="text-yellow-400">
                          ⏰ Next generation: {new Date(rateLimitStatus.nextHourlyReset).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={generateVideo}
              disabled={isProcessing || !canGenerate || (rateLimitStatus && !rateLimitStatus.canGenerate)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg disabled:shadow-none transition-all duration-300"
              whileHover={!isProcessing && canGenerate ? { scale: 1.02, boxShadow: "0 10px 30px -10px rgba(34, 197, 94, 0.4)" } : {}}
              whileTap={!isProcessing && canGenerate ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-center space-x-2">
                {isProcessing && (
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <span>{isProcessing ? t('generatingVideo') : t('generateVideo')}</span>
              </div>
            </motion.button>

            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-gray-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                    <motion.div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-sm"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <motion.p 
                    className="text-sm text-gray-300 mt-3"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {progress === 0 && t('startingVideoGeneration')}
                    {progress > 0 && progress <= 50 && photos.length > 1 && `${t('creatingClips')} (${progress}%)`}
                    {progress > 0 && progress <= 50 && photos.length === 1 && `${t('processingYourPhoto')} (${progress}%)`}
                    {progress > 50 && progress < 100 && `${t('combiningWithMusic')} (${progress}%)`}
                    {progress === 100 && t('finishingTouches')}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="video-result"
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >

            <motion.div 
              className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              
              {/* Modern iPhone Frame */}
              <div className="flex justify-center items-center">
                <div className="relative">
                  {/* iPhone 15 Pro Frame */}
                  <div className="bg-gradient-to-b from-zinc-800 via-zinc-900 to-black rounded-[3rem] p-1 shadow-2xl border border-zinc-700/50">
                    <div className="bg-black rounded-[2rem] overflow-hidden relative w-64 h-[32rem] sm:w-80 sm:h-[40rem] md:w-72 md:h-[36rem]">
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-6 sm:w-28 sm:h-7 bg-black rounded-full z-20 border border-zinc-800"></div>
                      
                      {/* Status Bar */}
                      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex justify-between items-center text-white text-xs z-10 mt-5 sm:mt-6">
                        <span className="font-medium">9:41</span>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8zm18 0H4v8h16V8z"/>
                            <path d="M6 10h12v4H6z" fill="#22c55e"/>
                          </svg>
                        </div>
                      </div>

                      {/* Video Content */}
                      <video 
                        controls 
                        className="w-full h-full object-cover"
                        preload="metadata"
                        onError={(e) => {
                          console.error('Video playback error:', e);
                          setError(t('unableToLoadVideo'));
                        }}
                      >
                        <source src={videoData.url} type="video/mp4" />
                        {t('yourBrowserDoesNotSupport')}
                      </video>
                    </div>
                  </div>

                  {/* iPhone 15 Pro Side Buttons */}
                  <div className="absolute -left-1 top-12 sm:top-16 flex flex-col space-y-1.5 sm:space-y-2">
                    <div className="w-0.5 h-8 sm:h-12 bg-zinc-600 rounded-full"></div>
                    <div className="w-0.5 h-4 sm:h-6 bg-zinc-600 rounded-full"></div>
                    <div className="w-0.5 h-4 sm:h-6 bg-zinc-600 rounded-full"></div>
                  </div>
                  
                  {/* Power Button */}
                  <div className="absolute -right-1 top-16 sm:top-20">
                    <div className="w-0.5 h-12 sm:h-16 bg-zinc-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* QR Code Display */}
            <AnimatePresence>
              {showQrCode && qrCodeData && (
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center mb-4"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4z"/>
                      <path d="M15 19h2v2h-2zM19 19h2v2h-2zM17 17h2v2h-2zM15 15h2v2h-2zM17 21h2v2h-2z"/>
                    </svg>
                    <h4 className="font-semibold text-white text-sm">{t('mobileQRCode')}</h4>
                  </div>
                  <div className="bg-white rounded-lg p-2 inline-block">
                    <img 
                      src={qrCodeData.qrCodeDataUrl} 
                      alt={t('qrCodeForVideo')} 
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {t('expires')}: {new Date(qrCodeData.expiresAt).toLocaleString()}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Download Options with New Workflow */}
            <DownloadOptions
              videoData={videoData}
              tempUrl={tempUrl}
              qrCodeDataUrl={qrCodeData?.qrCodeDataUrl}
              expiresAt={qrCodeData?.expiresAt}
              onDownload={downloadVideo}
              onGenerateQR={async () => {
                if (!tempUrl && videoData && videoData.tempUrl) {
                  // Use environment variable for base URL or fallback to current origin
                  const baseUrl = import.meta.env.REACT_APP_BASE_URL || window.location.origin
                  
                  const fullTempUrl = `${baseUrl}${videoData.tempUrl}?mobile=true&qr=true&t=${Date.now()}`
                  
                  console.log('Manual QR Code URL:', fullTempUrl) // Debug log
                  setTempUrl(fullTempUrl)
                  setVideoId(videoData.tempUrlId)
                  await generateQrCodeForUrl(fullTempUrl, videoData.expiresAt)
                }
              }}
              loadingQR={loadingQrCode}
            />


            {/* Action Buttons */}
            <motion.div 
              className="text-center mt-4 space-y-3"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {/* New Video Button */}
              <motion.button
                onClick={async () => {
                  // Cleanup files and reset state
                  await cleanupAndReset()
                  
                  // Reset local component state
                  setVideoData(null)
                  setProgress(0)
                  setError(null)
                  setQrCodeData(null)
                  setShowQrCode(false)
                  setTempUrl(null)
                  setVideoId(null)
                  setShowReadyMessage(true) // Show ready message again when creating new video
                  
                  // Navigate back to step 1 if callback is provided
                  if (onNewVideo) {
                    onNewVideo()
                  }
                }}
                className="w-full bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                <span>{t('createNewVideo')}</span>
              </motion.button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="text-xs text-gray-400 text-center space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Removed: videoWillBeGenerated, processingMayTake, ready status texts */}
        {videoData && qrCodeData && (
          <p>{t('qrCodeAvailable')}</p>
        )}
      </motion.div>
    </div>
  )
}

export default VideoExport