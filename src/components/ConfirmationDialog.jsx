import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning' // 'warning', 'danger', 'info'
}) {

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'from-red-500 to-rose-500',
          icon: '⚠️',
          confirmBtn: 'from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
          border: 'border-red-500/30'
        }
      case 'info':
        return {
          iconBg: 'from-blue-500 to-cyan-500',
          icon: 'ℹ️',
          confirmBtn: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
          border: 'border-blue-500/30'
        }
      default: // warning
        return {
          iconBg: 'from-amber-500 to-orange-500',
          icon: '⚠️',
          confirmBtn: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
          border: 'border-amber-500/30'
        }
    }
  }

  const styles = getTypeStyles()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className={`bg-gray-900/95 backdrop-blur-lg border ${styles.border} rounded-2xl max-w-md w-full shadow-2xl`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header with Icon */}
            <div className="flex items-center space-x-4 mb-4">
              <motion.div 
                className={`w-12 h-12 bg-gradient-to-r ${styles.iconBg} rounded-full flex items-center justify-center`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">{styles.icon}</span>
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{message}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText || 'Cancel'}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${styles.confirmBtn} text-white font-medium rounded-xl transition-all duration-200 shadow-lg`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {confirmText || 'Confirm'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConfirmationDialog