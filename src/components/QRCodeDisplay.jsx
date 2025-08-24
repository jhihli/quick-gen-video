import React from 'react'
import { motion } from 'framer-motion'

function QRCodeDisplay({ tempUrl, qrCodeDataUrl, expiresAt, onClose }) {
  if (!tempUrl || !qrCodeDataUrl) return null

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempUrl)
      .then(() => {
        // Could add a toast notification here
        console.log('URL copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy URL:', err)
      })
  }

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4z"/>
            <path d="M15 19h2v2h-2zM19 19h2v2h-2zM17 17h2v2h-2zM15 15h2v2h-2zM17 21h2v2h-2z"/>
          </svg>
          <h4 className="font-semibold text-white">Mobile QR Code</h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-xl p-4 inline-block mb-4">
        <img 
          src={qrCodeDataUrl} 
          alt="QR Code for video download" 
          className="w-48 h-48 mx-auto"
        />
      </div>
      
      <p className="text-sm text-gray-300 mb-2">
        Scan with your phone to download the video
      </p>
      
      <p className="text-xs text-gray-400 mb-4">
        Expires: {new Date(expiresAt).toLocaleString()}
      </p>

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          <span>Copy Link</span>
        </button>
        
        <a
          href={tempUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          <span>Download</span>
        </a>
      </div>
    </motion.div>
  )
}

export default QRCodeDisplay