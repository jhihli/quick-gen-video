import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import ConfirmationDialog from './ConfirmationDialog'

function UploadPhotos() {
  const { photos, addPhotos, removePhoto: removePhotoFromContext, uploadMode, setUploadMode, hasGeneratedVideo, cleanupAndReset } = useAppContext()
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const showErrorMessage = (message) => {
    setErrorMessage(message)
    setShowError(true)

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowError(false)
      setTimeout(() => setErrorMessage(''), 500) // Clear message after fade out
    }, 3000)
  }

  const uploadPhotosToServer = async (files) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('photos', file)
    })

    // Add session ID for file tracking
    const sessionId = sessionStorage.getItem('tkvgen-session-id')
    if (sessionId) {
      formData.append('sessionId', sessionId)
    }

    try {
      const response = await fetch('/api/upload-photos', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        // For video duration errors, pass the full error data
        if (data.invalidFiles) {
          throw new Error('Upload failed: ' + JSON.stringify(data))
        }
        throw new Error(data.error || 'Upload failed')
      }

      return data.photos
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const checkForDuplicates = (files) => {
    const duplicates = []
    const newFiles = []

    files.forEach(file => {
      // Check for duplicates based on name and size
      const isDuplicate = photos.some(existingPhoto =>
        existingPhoto.originalname === file.name &&
        existingPhoto.size === file.size
      )

      if (isDuplicate) {
        duplicates.push(file.name)
      } else {
        newFiles.push(file)
      }
    })

    return { duplicates, newFiles }
  }

  const validateFileTypes = (files) => {
    if (uploadMode === 'photos') {
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      const videoFiles = files.filter(file => file.type.startsWith('video/'))

      if (videoFiles.length > 0) {
        return { valid: false, error: 'Photo mode selected. Please upload image files only or switch to Video mode.' }
      }

      if (imageFiles.length === 0) {
        return { valid: false, error: 'No valid image files found.' }
      }

      return { valid: true, files: imageFiles }
    } else {
      const videoFiles = files.filter(file => file.type.startsWith('video/'))
      const imageFiles = files.filter(file => file.type.startsWith('image/'))

      if (imageFiles.length > 0) {
        return { valid: false, error: 'Video mode selected. Please upload video files only or switch to Photo mode.' }
      }

      if (videoFiles.length === 0) {
        return { valid: false, error: 'No valid video files found.' }
      }

      return { valid: true, files: videoFiles }
    }
  }

  const processFileUpload = async (files, inputElement) => {
    // Validate file types
    const validation = validateFileTypes(files)
    if (!validation.valid) {
      showErrorMessage(validation.error)
      if (inputElement) inputElement.value = '' // Clear the input
      return
    }

    // Check for duplicates
    const { duplicates, newFiles } = checkForDuplicates(validation.files)

    // If no new files to upload, just clear input and return (no alert needed)
    if (newFiles.length === 0) {
      if (inputElement) inputElement.value = ''
      return
    }

    setIsUploading(true)
    try {
      const uploadedPhotos = await uploadPhotosToServer(newFiles)
      addPhotos(uploadedPhotos)
    } catch (error) {
      // Check if it's a file validation error (extension, type, etc.)
      if (error.message.includes('extension mismatch') ||
        error.message.includes('File type') ||
        error.message.includes('not allowed') ||
        error.message.includes('validation') ||
        error.message.includes('invalid')) {
        showErrorMessage('The file extension is invalid')
      }
      // Handle video duration validation errors
      else if (error.message.includes('duration limit') || error.message.includes('3 minute')) {
        try {
          const errorData = JSON.parse(error.message.split('Upload failed: ')[1] || '{}');
          if (errorData.invalidFiles && errorData.validFiles) {
            // Show detailed error for video duration validation
            const errorMsg = `❌ ${errorData.message}\n\nInvalid files:\n${errorData.invalidFiles.join('\n')}\n\n${errorData.details}`;
            showErrorMessage(errorMsg);

            // Add any valid files that were uploaded
            if (errorData.validFiles.length > 0) {
              addPhotos(errorData.validFiles);
            }
          } else {
            showErrorMessage('The file extension is invalid');
          }
        } catch (parseError) {
          showErrorMessage('The file extension is invalid');
        }
      } else {
        showErrorMessage('The file extension is invalid')
      }
    } finally {
      setIsUploading(false)
      // Clear the input
      if (inputElement) inputElement.value = ''
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Check if user has generated a video and show confirmation
    if (hasGeneratedVideo) {
      setPendingAction(() => () => processFileUpload(files, e.target))
      setShowConfirmDialog(true)
      return
    }

    // If no video generated, proceed normally
    await processFileUpload(files, e.target)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
  }

  const processDrop = async (files) => {
    const mediaFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))

    if (mediaFiles.length === 0) {
      showErrorMessage(uploadMode === 'photos' ? 'Please drop image files only' : 'Please drop video files only')
      return
    }

    await processFileUpload(mediaFiles, null)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
    const files = Array.from(e.dataTransfer.files)

    // Check if user has generated a video and show confirmation
    if (hasGeneratedVideo) {
      setPendingAction(() => () => processDrop(files))
      setShowConfirmDialog(true)
      return
    }

    // If no video generated, proceed normally
    await processDrop(files)
  }

  const removePhoto = (id) => {
    removePhotoFromContext(id)
  }

  const clearAllFiles = () => {
    photos.forEach(photo => removePhotoFromContext(photo.id))
  }

  const handleClearAll = () => {
    if (hasGeneratedVideo) {
      setPendingAction(() => clearAllFiles)
      setShowConfirmDialog(true)
      return
    }
    clearAllFiles()
  }

  const handleModeChange = (newMode) => {
    if (hasGeneratedVideo) {
      setPendingAction(() => () => {
        if (photos.length > 0) {
          clearAllFiles()
        }
        setUploadMode(newMode)
      })
      setShowConfirmDialog(true)
      return
    }

    if (photos.length > 0) {
      clearAllFiles()
    }
    setUploadMode(newMode)
  }

  const handleConfirmAction = async () => {
    setShowConfirmDialog(false)
    if (pendingAction) {
      await cleanupAndReset() // Clear all data including video
      await pendingAction()
      setPendingAction(null)
    }
  }

  const handleCancelAction = () => {
    setShowConfirmDialog(false)
    setPendingAction(null)
  }

  return (
    <div className="space-y-4 mx-auto" style={{ maxWidth: '48rem' }}>
      {/* Modern Toggle Switch */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="inline-flex bg-gray-800/80 rounded-full p-1 border border-gray-700">
          <button
            onClick={() => handleModeChange('photos')}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${uploadMode === 'photos'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            📸 Photos
          </button>
          <button
            onClick={() => handleModeChange('videos')}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${uploadMode === 'videos'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            🎥 Videos
          </button>
        </div>
      </motion.div>

      {/* Error Message Display */}
      <AnimatePresence>
        {showError && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <pre className="text-sm font-medium whitespace-pre-wrap">{errorMessage}</pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Photos/Videos - At Top */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Preview Grid Only */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden">
              <div className={`grid ${photos.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    className="relative group cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1, type: "spring" }}
                    whileHover={{ y: -8 }}
                  >
                    {/* Media Container */}
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                      {(photo.originalname && (photo.originalname.toLowerCase().includes('.mp4') || photo.originalname.toLowerCase().includes('.mov') || photo.originalname.toLowerCase().includes('.webm') || photo.originalname.toLowerCase().includes('.avi') || photo.originalname.toLowerCase().includes('.mkv') || photo.originalname.toLowerCase().includes('.flv'))) || (photo.url && photo.url.includes('videos')) || (photo.validationResult && photo.validationResult.typeValidation && photo.validationResult.typeValidation.detectedType && typeof photo.validationResult.typeValidation.detectedType === 'string' && photo.validationResult.typeValidation.detectedType.startsWith('video/')) ? (
                        <div className="relative aspect-video">
                          <video
                            src={photo.url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                            onError={(e) => {
                              console.error('Failed to load video:', photo.url);
                            }}
                          />
                          {/* Video Indicator Badge */}
                        </div>
                      ) : (
                        <div className="relative aspect-video">
                          <motion.img
                            src={photo.url}
                            alt="Uploaded media"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', photo.url, 'Trying as video...');
                              // If image fails, try as video
                              const videoElement = document.createElement('video');
                              videoElement.src = photo.url;
                              videoElement.className = 'w-full h-full object-cover';
                              videoElement.muted = true;
                              videoElement.preload = 'metadata';

                              // Add video indicator
                              const indicator = document.createElement('div');
                              indicator.className = 'absolute top-3 right-3';
                              indicator.innerHTML = ``;

                              // Replace the img with video
                              const container = e.target.parentNode;
                              container.innerHTML = '';
                              container.appendChild(videoElement);
                              container.appendChild(indicator);

                              // Fallback if video also fails
                              videoElement.onerror = () => {
                                console.error('Both image and video failed for:', photo.url);
                                container.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center bg-gray-800">
                                    <div class="text-center text-gray-400">
                                      <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                      </svg>
                                      <p class="text-sm">Media Preview Unavailable</p>
                                    </div>
                                  </div>
                                `;
                              };
                            }}
                          />
                          {/* Image Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}

                      {/* Hover Effects Border */}
                      <motion.div
                        className="absolute inset-0 border-2 border-transparent rounded-xl"
                        whileHover={{
                          borderColor: "rgba(34, 197, 94, 0.5)",
                          boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)"
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </motion.button>

                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Upload Area - At bottom */}
      <motion.div
        className={`relative group bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/40 backdrop-blur-sm border-2 border-dashed border-cyan-400/30 rounded-2xl px-4 text-center cursor-pointer transition-all duration-300 hover:border-cyan-400/60 hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 hover:shadow-lg hover:shadow-cyan-500/20 mx-auto flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ maxWidth: '24rem', marginBottom: '12px' }}
        onClick={() => !isUploading && document.getElementById('photo-input').click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={!isUploading ? { scale: 1.02 } : {}}
        whileTap={!isUploading ? { scale: 0.98 } : {}}
      >
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                className="mt-4 text-sm text-cyan-300"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Uploading photos...
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Upload Icon with background */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                    <svg className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {/* Floating dots decoration */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40 group-hover:opacity-80 transition-opacity"></div>
                </div>

                {/* Text content */}
                <div className="space-y-0.5">
                  <h3 className="text-white font-semibold text-sm group-hover:text-cyan-100 transition-colors">
                    {uploadMode === 'photos' ? 'Upload Photos' : 'Upload Videos'}
                  </h3>
                  <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">
                    Click here or drag and drop
                  </p>
                  <p className="text-gray-500 text-xs">
                    {uploadMode === 'photos' ? 'JPG, PNG, GIF up to 10MB' : 'MP4, MOV, AVI up to 10MB'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <input
        id="photo-input"
        type="file"
        multiple
        accept={uploadMode === 'photos' ? 'image/*' : 'video/*'}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />


      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        type="warning"
        title="Clear Current Data?"
        message="You have a generated video that will be lost. This action will clear all your current photos, music, and generated video.

Are you sure you want to continue?"
        confirmText="Yes, Clear Data"
        cancelText="Cancel"
      />

    </div>
  )
}

export default UploadPhotos