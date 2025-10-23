import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const NewsModal = ({ article, isOpen, onClose }) => {
  if (!article) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleReadMore = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer')
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-gradient-to-br from-slate-800/95 via-gray-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-[10000]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors group"
            >
              <svg className="w-6 h-6 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Article Image */}
            {article.urlToImage && (
              <div className="relative h-96 overflow-hidden rounded-t-3xl">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1200&q=80'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold rounded-full">
                  {article.source?.name}
                </span>
                <span className="text-gray-400 text-sm">
                  {formatDate(article.publishedAt)}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                {article.title}
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {article.description}
              </p>

              {/* Content (if available) */}
              {article.content && article.content !== article.description && (
                <div className="mb-8">
                  <p className="text-gray-400 leading-relaxed">
                    {article.content.replace(/\[\+\d+ chars\]$/, '...')}
                  </p>
                </div>
              )}

              {/* Author (if available) */}
              {article.author && (
                <div className="mb-8">
                  <p className="text-gray-500 text-sm">
                    By <span className="text-cyan-400 font-medium">{article.author}</span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  onClick={handleReadMore}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Read Full Article
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={onClose}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default NewsModal
