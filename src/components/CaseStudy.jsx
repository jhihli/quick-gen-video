import React from 'react'
import { motion } from 'framer-motion'

const CaseStudy = ({ caseStudy }) => {
  // Map case studies to related external articles
  const getRelatedArticleUrl = (title) => {
    switch (title) {
      case "Sarah's Pet Store Promo":
        return "https://air.io/en/on-air/youtube-idea-generator-film-what-people-wanna-watch"
      case "Alex's Travel Vlog Prep":
        return "https://www.lucidlink.com/blog/video-production-workflow"
      case "Mia's Event Recap":
        return "https://www.naturettl.com/how-to-choose-your-best-images-after-a-shoot/"
      case "Liam's Product Showcase":
        return "https://blisslights.com/blogs/blisslights/lights-for-content-creators?srsltid=AfmBOooeNRob-R9zhekQATcQOwN34VuOGyqm4mUark9AqD3mY59I_v2R"
      case "Emma's Family Montage":
        return "https://www.epidemicsound.com/blog/audio-mixing-for-video/"
      case "Olivia's Wedding Teaser":
        return "https://wyzowl.com/promoting-your-video/"
      default:
        return "/generator" // fallback to generator for unmapped case studies
    }
  }

  const relatedUrl = getRelatedArticleUrl(caseStudy.title)
  const isExternalLink = relatedUrl.startsWith('http')
  
  // Hide related article button for Noah's Fitness Journey (Generate and Edit Smarter section)
  const showRelatedArticle = caseStudy.title !== "Noah's Fitness Journey"

  return (
    <motion.div
      className="relative overflow-hidden bg-gradient-to-br from-green-900/20 via-emerald-800/10 to-teal-900/20 backdrop-blur-sm border border-green-300/20 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)"
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-0 right-0 w-24 h-24 bg-green-400/30 rounded-full blur-2xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-xl"
          animate={{
            x: [0, 15, 0],
            y: [0, -5, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-4 sm:mb-6">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div className="flex items-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-green-300 text-sm font-semibold uppercase tracking-wider mr-2">
                    Case Study
                  </span>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-green-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {caseStudy.title}
                </h3>
              </div>
            </div>

            {/* Desktop Likes Button - Same Row */}
            <div className="hidden sm:block">
              {(() => {
                const [likes, setLikes] = React.useState(0)
                const [hasLiked, setHasLiked] = React.useState(false)
                const [isAnimating, setIsAnimating] = React.useState(false)

                const handleLike = () => {
                  if (!hasLiked) {
                    setLikes(prev => prev + 1)
                    setHasLiked(true)
                    setIsAnimating(true)
                    
                    // Reset animation after it completes
                    setTimeout(() => setIsAnimating(false), 600)
                  }
                }

                return (
                  <motion.button
                    onClick={handleLike}
                    className={`relative bg-white/5 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10 hover:border-green-300/30 transition-all duration-300 cursor-pointer ${
                      hasLiked ? 'bg-green-500/10 border-green-400/30' : 'hover:bg-white/10'
                    }`}
                    whileHover={{ scale: hasLiked ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    disabled={hasLiked}
                  >
                    <div className="flex items-center space-x-2">
                      {/* Thumb Icon with Animation */}
                      <motion.div 
                        className="text-lg"
                        animate={isAnimating ? {
                          scale: [1, 1.5, 1.2, 1],
                          rotate: [0, -10, 10, 0],
                          y: [0, -5, 0]
                        } : {}}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        👍
                      </motion.div>
                      
                      {/* Likes Count and Text Horizontal */}
                      <div className="flex items-center space-x-1">
                        <motion.span 
                          className={`font-bold transition-colors duration-300 ${
                            hasLiked ? 'text-green-400' : 'text-green-300'
                          }`}
                          animate={isAnimating ? {
                            scale: [1, 1.3, 1],
                            color: ['#10b981', '#22c55e', '#10b981']
                          } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          {likes}
                        </motion.span>
                        <span className={`text-sm transition-colors duration-300 ${
                          hasLiked ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {hasLiked ? 'Liked!' : 'Likes'}
                        </span>
                      </div>
                    </div>

                    {/* Floating Hearts Animation */}
                    {isAnimating && (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-red-500 pointer-events-none"
                            style={{
                              left: `${50 + (Math.random() - 0.5) * 60}%`,
                              top: '20%'
                            }}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0.5],
                              y: [-15, -30],
                              x: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 30]
                            }}
                            transition={{
                              duration: 1,
                              delay: i * 0.1,
                              ease: "easeOut"
                            }}
                          >
                            ❤️
                          </motion.div>
                        ))}
                      </>
                    )}

                    {/* Ripple Effect */}
                    {isAnimating && (
                      <motion.div
                        className="absolute inset-0 border border-green-400/50 rounded-lg"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                )
              })()}
            </div>
          </div>


          {/* Mobile Centered Likes Button */}
          <div className="flex justify-center sm:hidden">
            {(() => {
              const [likes, setLikes] = React.useState(0)
              const [hasLiked, setHasLiked] = React.useState(false)
              const [isAnimating, setIsAnimating] = React.useState(false)

              const handleLike = () => {
                if (!hasLiked) {
                  setLikes(prev => prev + 1)
                  setHasLiked(true)
                  setIsAnimating(true)
                  
                  // Reset animation after it completes
                  setTimeout(() => setIsAnimating(false), 600)
                }
              }

              return (
                <motion.button
                  onClick={handleLike}
                  className={`relative bg-white/5 rounded-md px-2 py-1 backdrop-blur-sm border border-white/10 hover:border-green-300/30 transition-all duration-300 cursor-pointer ${
                    hasLiked ? 'bg-green-500/10 border-green-400/30' : 'hover:bg-white/10'
                  }`}
                  whileHover={{ scale: hasLiked ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  disabled={hasLiked}
                >
                  <div className="flex items-center space-x-1.5">
                    {/* Thumb Icon with Animation */}
                    <motion.div 
                      className="text-sm"
                      animate={isAnimating ? {
                        scale: [1, 1.5, 1.2, 1],
                        rotate: [0, -10, 10, 0],
                        y: [0, -5, 0]
                      } : {}}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      👍
                    </motion.div>
                    
                    {/* Likes Count and Text Horizontal */}
                    <div className="flex items-center space-x-1">
                      <motion.span 
                        className={`text-xs font-bold transition-colors duration-300 ${
                          hasLiked ? 'text-green-400' : 'text-green-300'
                        }`}
                        animate={isAnimating ? {
                          scale: [1, 1.3, 1],
                          color: ['#10b981', '#22c55e', '#10b981']
                        } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        {likes}
                      </motion.span>
                      <span className={`text-xs transition-colors duration-300 ${
                        hasLiked ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {hasLiked ? 'Liked!' : 'Likes'}
                      </span>
                    </div>
                  </div>

                  {/* Floating Hearts Animation */}
                  {isAnimating && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-red-500 pointer-events-none"
                          style={{
                            left: `${50 + (Math.random() - 0.5) * 60}%`,
                            top: '20%'
                          }}
                          initial={{ opacity: 0, scale: 0, y: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0.5],
                            y: [-15, -30],
                            x: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 30]
                          }}
                          transition={{
                            duration: 1,
                            delay: i * 0.1,
                            ease: "easeOut"
                          }}
                        >
                          ❤️
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Ripple Effect */}
                  {isAnimating && (
                    <motion.div
                      className="absolute inset-0 border border-green-400/50 rounded-md"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-gray-200 leading-relaxed mb-6">
          {caseStudy.content}
        </p>

        {/* Call to Action - Only show for specific case studies */}
        {showRelatedArticle && (
          <div className="flex items-center justify-between pt-4 border-t border-green-300/20">
            <div className="flex items-center text-sm text-green-300">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Learn More
            </div>
            <motion.a
              href={relatedUrl}
              target={isExternalLink ? "_blank" : "_self"}
              rel={isExternalLink ? "noopener noreferrer" : undefined}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">📖</span>
              Related Article
              {isExternalLink && <span className="ml-1">↗</span>}
            </motion.a>
          </div>
        )}
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-16 h-16">
        <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-green-400/50 rounded-tl"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16">
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-green-400/50 rounded-br"></div>
      </div>
    </motion.div>
  )
}

export default CaseStudy