import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

function DownloadOptions({ videoData, tempUrl, qrCodeDataUrl, expiresAt, onDownload, onGenerateQR, loadingQR, showQR }) {
  const { t } = useLanguage()

  if (!videoData) return null

  const handleQRToggle = async () => {
    if (onGenerateQR) {
      await onGenerateQR()
    }
  }


  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Download Button */}
        <motion.button
          onClick={onDownload}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.4)" }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          <span className="hidden sm:inline">Download</span>
          <span className="sm:hidden">Save Video</span>
        </motion.button>

        {/* QR Code Button */}
        <motion.button
          onClick={handleQRToggle}
          disabled={loadingQR}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
          whileHover={!loadingQR ? { scale: 1.02, boxShadow: "0 10px 30px -10px rgba(34, 197, 94, 0.4)" } : {}}
          whileTap={!loadingQR ? { scale: 0.98 } : {}}
        >
          {loadingQR ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="hidden sm:inline">Loading...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4z"/>
                <path d="M15 19h2v2h-2zM19 19h2v2h-2zM17 17h2v2h-2zM15 15h2v2h-2zM17 21h2v2h-2z"/>
              </svg>
              <span className="hidden sm:inline">{showQR ? t('hideQR') : t('qrCode')}</span>
              <span className="sm:hidden">{showQR ? t('hideQRCode') : t('showQRCode')}</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default DownloadOptions