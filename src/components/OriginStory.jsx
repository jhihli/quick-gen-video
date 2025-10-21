import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import Footer from './Footer'

const OriginStory = () => {
  const navigate = useNavigate()

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
        {/* Animated overlay for better visibility */}
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
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
            >
              <LogoIcon size={8} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                QWimgenv
              </h1>
            </motion.div>

            <nav className="flex items-center space-x-2">
              <motion.button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Home
              </motion.button>
              <motion.button
                onClick={() => navigate('/generator')}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generator
              </motion.button>
              <motion.button
                onClick={() => navigate('/help')}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Help
              </motion.button>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/20">
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              How QWimgenv Was Created
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              The story of how we built a free, accessible video creation tool for everyone.
            </p>
          </div>

          {/* Background */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/20"
          >
            <h2 className="text-4xl font-bold text-cyan-400 mb-6 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Background</h2>
            <div className="space-y-5 text-gray-200">
              <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                QWimgenv was born from a simple frustration: creating videos from photos shouldn't be complicated.
                Whether it's preserving memories, creating social media content, or making quick presentations,
                everyone should have access to powerful video creation tools—without the barrier of expensive
                software or steep learning curves.
              </p>
              <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                We noticed that existing solutions fell into two categories: either overly complex professional
                software that required hours to learn, or simplistic template-based apps that produced generic
                results. There had to be a better way.
              </p>
            </div>
          </motion.div>

          {/* Development Process */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/20"
          >
            <h2 className="text-4xl font-bold text-cyan-400 mb-6 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Development Process</h2>
            <div className="space-y-6 text-gray-200">
              <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                QWimgenv was built from the ground up with modern web technologies, chosen for their
                performance, scalability, and developer experience. Here's the technical stack that powers
                our platform:
              </p>

              {/* Frontend Stack */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <span className="text-cyan-400 mr-3 text-2xl">⚡</span>
                  Frontend Technologies
                </h3>
                <ul className="space-y-3 ml-6">
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">React 18:</strong> For building a fast, interactive user interface
                    with component-based architecture
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">Vite:</strong> Lightning-fast build tool and development server
                    for optimal developer experience
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">Framer Motion:</strong> Smooth, performant animations that enhance
                    user interactions
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">Tailwind CSS:</strong> Utility-first CSS framework for rapid,
                    responsive UI development
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">React Router:</strong> Client-side routing for seamless navigation
                  </li>
                </ul>
              </div>

              {/* Backend Stack */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <span className="text-cyan-400 mr-3 text-2xl">🔧</span>
                  Backend Technologies
                </h3>
                <ul className="space-y-3 ml-6">
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">Node.js + Express:</strong> Fast, scalable server framework for
                    handling API requests and file operations
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">FFmpeg:</strong> Industry-standard video processing engine for
                    generating high-quality videos
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">Multer:</strong> Middleware for handling multi-file uploads
                    with validation
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">QR Code Generator:</strong> For creating shareable mobile download
                    links
                  </li>
                </ul>
              </div>

              {/* Data & Storage */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <span className="text-cyan-400 mr-3 text-2xl">💾</span>
                  Data & Storage
                </h3>
                <ul className="space-y-3 ml-6">
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">Session-Based Storage:</strong> Temporary file storage with
                    automatic cleanup for privacy and security
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">In-Memory State:</strong> Fast session tracking with heartbeat
                    mechanism for active cleanup
                  </li>
                  <li className="text-gray-300 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <strong className="text-white font-semibold">File System Management:</strong> Organized directory structure
                    for uploads, videos, and music library
                  </li>
                </ul>
              </div>

              <p className="pt-4 border-t border-white/10 text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                This tech stack was carefully selected to balance performance, maintainability, and user experience.
                Every technology serves a specific purpose in delivering a fast, reliable, and free video creation
                platform.
              </p>
            </div>
          </motion.div>

          {/* The Future */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-cyan-500/30"
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>What's Next?</h2>
            <div className="space-y-5 text-gray-200">
              <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                We're constantly improving QWimgenv based on user feedback. Planned features include:
              </p>
              <ul className="space-y-3 list-none ml-4 text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">→</span><span className="text-gray-300">More transition effects and animation styles</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">→</span><span className="text-gray-300">Advanced text overlay capabilities</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">→</span><span className="text-gray-300">Extended music library with more genres</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">→</span><span className="text-gray-300">Video templates for common use cases</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">→</span><span className="text-gray-300">Collaboration features for team projects</span></li>
              </ul>
              <p className="mt-6 text-lg leading-relaxed text-gray-300 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                But our core mission remains unchanged: keep it free, keep it simple, keep it accessible.
              </p>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/20 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Ready to Create?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Join thousands of creators who are already using QWimgenv to bring their photos to life.
            </p>
            <motion.button
              onClick={() => navigate('/generator')}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Start Creating Now
            </motion.button>
          </motion.div>

          {/* Back to About */}
          <div className="text-center">
            <motion.button
              onClick={() => navigate('/about')}
              className="text-cyan-400 hover:text-cyan-300 underline text-lg font-medium"
              whileHover={{ scale: 1.05 }}
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              ← Back to About Page
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
      </div>
    </div>
  )
}

export default OriginStory
