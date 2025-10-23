import React from 'react'
import { motion } from 'framer-motion'

const NewsCard = ({ article, onClick, isFeatured = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const truncateText = (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  if (isFeatured) {
    return (
      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl cursor-pointer group"
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              <span className="px-2 sm:px-3 py-1 bg-cyan-500/90 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-full">
                Featured
              </span>
              <span className="text-gray-300 text-xs sm:text-sm">{article.source?.name}</span>
              <span className="text-gray-400 text-xs sm:text-sm">•</span>
              <span className="text-gray-400 text-xs sm:text-sm">{formatDate(article.publishedAt)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg line-clamp-2">
              {article.description}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 shadow-lg cursor-pointer group h-full flex flex-col"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={article.urlToImage}
          alt={article.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
          <span className="text-cyan-400 text-xs font-semibold">{article.source?.name}</span>
          <span className="text-gray-500 text-xs">•</span>
          <span className="text-gray-400 text-xs">{formatDate(article.publishedAt)}</span>
        </div>

        <h3 className="text-white font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {article.title}
        </h3>

        <p className="text-gray-300 text-xs sm:text-sm line-clamp-3 flex-1">
          {truncateText(article.description, 120)}
        </p>

        <div className="mt-3 sm:mt-4 flex items-center text-cyan-400 text-xs sm:text-sm font-medium group-hover:text-cyan-300 transition-colors">
          <span>Read more</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

export default NewsCard
