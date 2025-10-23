import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import SearchBar from './SearchBar'
import Footer from './Footer'
import NewsCard from './NewsCard'
import NewsModal from './NewsModal'
import { fetchNews } from '../services/newsService'

const News = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadNews()
  }, [])

  // Handle navigation from search results
  useEffect(() => {
    if (location.state?.selectedArticle && location.state?.openModal) {
      setSelectedArticle(location.state.selectedArticle)
      setIsModalOpen(true)
      // Clear the navigation state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  const loadNews = async () => {
    try {
      setLoading(true)
      const newsArticles = await fetchNews()
      setArticles(newsArticles)
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArticleClick = (article) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedArticle(null), 300)
  }

  const featuredArticle = articles[0]
  const gridArticles = articles.slice(1, 10)

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Image */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2944&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 1.5,
          ease: "easeOut"
        }}
      >
        {/* Animated overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70"
          animate={{
            background: [
              'linear-gradient(to bottom right, rgba(15, 23, 42, 0.7), rgba(88, 28, 135, 0.6), rgba(15, 23, 42, 0.7))',
              'linear-gradient(to bottom right, rgba(15, 23, 42, 0.6), rgba(88, 28, 135, 0.7), rgba(15, 23, 42, 0.6))',
              'linear-gradient(to bottom right, rgba(15, 23, 42, 0.7), rgba(88, 28, 135, 0.6), rgba(15, 23, 42, 0.7))',
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Content wrapper with z-index */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header
          className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4 gap-2 sm:gap-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-2 sm:space-x-4"
              >
                <LogoIcon size={8} className="hidden sm:block" />
                <motion.h1
                  className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-pointer relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ scale: { duration: 0.3 } }}
                  onClick={() => navigate('/')}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent bg-clip-text text-transparent"
                    initial={{ backgroundPosition: "-200% 0" }}
                    whileHover={{
                      backgroundPosition: ["200% 0", "-200% 0"],
                      transition: {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                    style={{
                      backgroundSize: "200% 100%"
                    }}
                  >
                    QWimgenv
                  </motion.span>
                  QWimgenv
                </motion.h1>
              </motion.div>

              {/* Search Bar - Hidden on small screens */}
              <div className="hidden md:block flex-1 max-w-md">
                <SearchBar />
              </div>

              <nav className="flex items-center space-x-0.5 sm:space-x-2">
                <motion.a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/')
                  }}
                  className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <span className="hidden sm:inline">Home</span>
                    <span className="sm:hidden">HOME</span>
                  </span>
                </motion.a>

                <motion.a
                  href="/generator"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/generator')
                  }}
                  className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <span className="hidden sm:inline">Generator</span>
                    <span className="sm:hidden">TOOL</span>
                  </span>
                </motion.a>

                <motion.a
                  href="/help"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/help')
                  }}
                  className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <span className="hidden sm:inline">Help</span>
                    <span className="sm:hidden">HELP</span>
                  </span>
                </motion.a>

                <motion.a
                  href="/news"
                  className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative text-xs sm:text-base font-medium text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <span className="hidden sm:inline">News</span>
                    <span className="sm:hidden">NEWS</span>
                  </span>
                </motion.a>
              </nav>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Latest News
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Stay updated with the latest news in video generation and creative technology
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300 text-lg">Loading latest news...</p>
            </motion.div>
          )}

          {/* News Content */}
          {!loading && articles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8 sm:space-y-12"
            >
              {/* Featured Article */}
              {featuredArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <NewsCard
                    article={featuredArticle}
                    onClick={() => handleArticleClick(featuredArticle)}
                    isFeatured={true}
                  />
                </motion.div>
              )}

              {/* Grid of Articles */}
              {gridArticles.length > 0 && (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {gridArticles.map((article, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    >
                      <NewsCard
                        article={article}
                        onClick={() => handleArticleClick(article)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-gray-400 text-xl mb-4">No news articles available</div>
              <button
                onClick={loadNews}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Reload News
              </button>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* News Modal */}
      <NewsModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default News
