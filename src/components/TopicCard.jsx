import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { categories } from '../data/helpTopicsData'

const TopicCard = ({ topic, index }) => {
  const category = categories[topic.category]
  const isComingSoon = topic.comingSoon
  const isActionCard = topic.isActionCard

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <Link
        to={isComingSoon || isActionCard ? '#' : `/help/${topic.id}`}
        className={`block h-full ${isComingSoon ? 'cursor-not-allowed' : isActionCard ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={(e) => (isComingSoon || isActionCard) && e.preventDefault()}
      >
        <motion.div
          whileHover={!isComingSoon ? { scale: 1.03, y: -5 } : {}}
          transition={{ duration: 0.3 }}
          className={`relative h-full bg-gradient-to-br from-slate-800/60 via-gray-800/40 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl ${
            !isComingSoon ? 'hover:border-white/30 hover:shadow-2xl' : 'opacity-60'
          }`}
        >
          {/* Coming Soon Overlay */}
          {isComingSoon && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 rounded-full">
                <span className="text-white font-bold text-sm">Coming Soon</span>
              </div>
            </div>
          )}

          {/* Tips Category Layout */}
          {topic.category === 'tips' && (
            <>
              {/* Icon and Title Row */}
              <div className="flex items-center space-x-3 mb-3">
                <motion.div
                  className="text-3xl flex-shrink-0"
                  animate={!isComingSoon ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {topic.icon}
                </motion.div>

                <h3 className="text-lg font-bold text-white leading-tight">
                  {topic.title}
                </h3>
              </div>

              {/* Short Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {topic.shortDescription}
              </p>

              {/* Action Indicator */}
              {!isComingSoon && !topic.isActionCard && (
                <motion.div
                  className="flex items-center text-cyan-400 font-medium text-sm mt-auto"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span>Learn more</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              )}
            </>
          )}

          {/* Technical Category Layout */}
          {topic.category === 'technical' && (
            <div className="flex items-center justify-between">
              {/* Icon and Title */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <motion.div
                  className="text-3xl flex-shrink-0"
                  animate={!isComingSoon ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {topic.icon}
                </motion.div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-1">
                  {topic.title}
                </h3>
              </div>

              {/* Action Indicator - Modern Arrow Icon */}
              {!isComingSoon && (
                <motion.div
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30 ml-4 flex-shrink-0"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(6, 182, 212, 0.3)",
                    borderColor: "rgba(6, 182, 212, 0.6)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          )}

          {/* Try It Now Button for Action Cards */}
          {topic.isActionCard && (
            <Link to="/generator" className="block mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-2">Try It Now</span>
                <span>→</span>
              </motion.button>
            </Link>
          )}

          {/* Hover Glow Effect */}
          {!isComingSoon && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-500 pointer-events-none"></div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default TopicCard
