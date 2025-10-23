import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import SearchBar from './SearchBar'
import TopicCard from './TopicCard'
import Footer from './Footer'
import { helpTopics, categories } from '../data/helpTopicsData'

const HelpLanding = () => {
  const tipTopics = helpTopics.filter(t => t.category === 'tips' && !t.comingSoon)
  const technicalTopics = helpTopics.filter(t => t.category === 'technical' && !t.comingSoon)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                  window.location.href = '/'
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
                  window.location.href = '/generator'
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
                className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group bg-white/20"
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
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = '/news'
                }}
                className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg overflow-hidden cursor-pointer group"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Help Center
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about creating amazing videos with QWGenv.
            <br />
            Choose a topic below to get started.
          </p>
        </motion.div>

        {/* Video Creation Tips Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Section Header */}
          <div className="flex items-center mb-8">
            <div className={`w-2 h-12 bg-gradient-to-b ${categories.tips.color} rounded-full mr-4`}></div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{categories.tips.name}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{categories.tips.description}</p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tipTopics.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Technical Knowledge Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Section Header */}
          <div className="flex items-center mb-8">
            <div className={`w-2 h-12 bg-gradient-to-b ${categories.technical.color} rounded-full mr-4`}></div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{categories.technical.name}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{categories.technical.description}</p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalTopics.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.div
          className="text-center bg-gradient-to-r from-purple-900/30 to-cyan-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Create Your Video?
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Put your knowledge into action! Head to the Generator and start creating stunning videos now.
          </p>
          <Link
            to="/generator"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">🚀</span>
            Go to Generator
            <span className="ml-2">→</span>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default HelpLanding
