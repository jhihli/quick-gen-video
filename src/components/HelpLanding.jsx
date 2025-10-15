import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import SearchBar from './SearchBar'
import TopicCard from './TopicCard'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 gap-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <LogoIcon size={8} className="hidden sm:block" />
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                QWGenv
              </h1>
            </motion.div>

            {/* Search Bar - Hidden on small screens */}
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar />
            </div>

            <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden font-bold">HOME</span>
              </Link>
              <Link
                to="/generator"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Generator</span>
                <span className="sm:hidden font-bold">TOOL</span>
              </Link>
              <Link
                to="/help"
                className="text-white font-medium border-b-2 border-purple-400 pb-1 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Help</span>
                <span className="sm:hidden font-bold">HELP</span>
              </Link>
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
      <footer className="bg-slate-900/50 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 QWGenv. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HelpLanding
