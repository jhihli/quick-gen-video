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
      className="bg-white/10 backdrop-blur-sm rounded-md p-3 border border-white/20 text-center"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between space-x-3">
        {/* QR Code */}
        <div className="bg-white rounded-md p-1.5 flex-shrink-0">
          <img 
            src={qrCodeDataUrl} 
            alt="QR Code for video download" 
            className="w-24 h-24"
          />
        </div>
        
        {/* Info and Button Column */}
        <div className="flex flex-col space-y-2 flex-1 min-w-0">
          <p className="text-xs text-gray-400 text-left">
            Expires: {new Date(expiresAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </p>
          
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors flex items-center justify-center space-x-1.5 w-full"
          >
            <svg className="w-3 h-3" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default QRCodeDisplay