import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import TipCard from './TipCard'
import { getTopicById, categories } from '../data/helpTopicsData'

const TopicDetail = () => {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const topic = getTopicById(topicId)

  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [topicId])

  // Redirect to help landing if topic not found
  useEffect(() => {
    if (!topic || topic.comingSoon) {
      navigate('/help')
    }
  }, [topic, navigate])

  if (!topic || topic.comingSoon) {
    return null
  }

  const category = categories[topic.category]

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
          <div className="flex justify-between items-center py-4">
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            to="/help"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Help Center
          </Link>
        </motion.div>

        {/* Topic Hero - Only for tips category */}
        {topic.category === 'tips' && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-gradient-to-br from-slate-800/60 via-gray-800/40 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
              {/* Category Badge */}
              <div className="mb-6">
                <div className={`inline-flex bg-gradient-to-r ${category.color} px-4 py-2 rounded-full`}>
                  <span className="text-white text-sm font-semibold uppercase tracking-wide">
                    {category.name}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  {topic.title}
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              {/* Reference Image */}
              {topic.referenceImage && (
                <motion.div
                  className="mt-8 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <img
                    src={topic.referenceImage}
                    alt={`${topic.title} reference`}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tips Section (for tips category) */}
        {topic.tips && topic.tips.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topic.tips.map((tip, tipIndex) => (
                <TipCard key={tipIndex} tip={tip} index={tipIndex} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Extended Description Section (for technical category without tips) */}
        {topic.category === 'technical' && (!topic.tips || topic.tips.length === 0) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-slate-800/60 via-gray-800/40 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
              {/* Category Badge and Title */}
              <div className="mb-8 pb-6 border-b border-white/10">
                {/* Category Badge */}
                <div className="mb-6">
                  <div className={`inline-flex bg-gradient-to-r ${category.color} px-4 py-2 rounded-full`}>
                    <span className="text-white text-sm font-semibold uppercase tracking-wide">
                      {category.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <motion.div
                    className="text-5xl sm:text-6xl"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {topic.icon}
                  </motion.div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                    {topic.title}
                  </h1>
                </div>
              </div>

              {/* Content with improved formatting */}
              <div className="space-y-8">
                {topic.description.split('\n\n').map((paragraph, index) => {
                  // Check if paragraph starts with **
                  const isBoldHeading = paragraph.trim().startsWith('**')

                  if (isBoldHeading) {
                    // Extract heading and content
                    const parts = paragraph.split('**')
                    const heading = parts[1]
                    const content = parts.slice(2).join('**').trim()

                    return (
                      <div key={index} className="space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-cyan-400 flex items-center">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                          {heading}
                        </h3>
                        <p className="text-gray-300 text-base sm:text-lg leading-relaxed pl-5">
                          {content}
                        </p>
                      </div>
                    )
                  } else {
                    // Regular paragraph
                    return (
                      <p key={index} className="text-gray-300 text-base sm:text-lg leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  }
                })}
              </div>

              {/* Reference Image for Technical Topics */}
              {topic.referenceImage && (
                <motion.div
                  className="mt-10 rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-w-2xl mx-auto"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <img
                    src={topic.referenceImage}
                    alt={`${topic.title} reference`}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              )}

              {/* Bottom decorative line */}
              <div className="mt-10 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                  <span className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></span>
                  <span>Technical Reference</span>
                  <span className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></span>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Navigation Section */}
        <motion.div
          className="text-center bg-gradient-to-r from-purple-900/30 to-cyan-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Ready to Put This Into Practice?
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Head to the Generator and start creating your video with these tips in mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/generator"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">🚀</span>
              Go to Generator
              <span className="ml-2">→</span>
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-full transition-all duration-300 border border-white/20"
            >
              <span className="mr-2">📚</span>
              Explore More Topics
            </Link>
          </div>
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

export default TopicDetail
