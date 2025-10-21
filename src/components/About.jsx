import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import Footer from './Footer'

const About = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* AI-Generated Background Image with Animation */}
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
        {/* Lighter overlay for better background visibility with pulsing effect */}
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
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/20"
        >
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-8 tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>About QWimgenv</h1>

          <div className="space-y-8 text-gray-200">
            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Our Mission</h2>
              <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                QWimgenv is a free, web-based video creation tool designed to make video editing accessible to everyone.
                We believe that creating beautiful, professional-looking videos shouldn't require expensive software or
                technical expertise.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>What We Offer</h2>
              <ul className="space-y-3 list-none text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-300">Upload up to 10 photos or videos per project</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-300">Add your own music or choose from our curated library</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-300">Animated avatars for engaging content</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-300">Mobile-optimized 1080x1920 portrait format</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-300">High-quality video generation with real-time progress tracking</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-300">QR code sharing for easy mobile downloads</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-300">Completely free - no subscriptions, no hidden fees</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Technology</h2>
              <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Built with modern web technologies including React, Node.js, and FFmpeg, QWimgenv processes videos
                efficiently while maintaining the highest quality standards. Our mobile-first design ensures your
                creations look perfect on any device.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Privacy & Data</h2>
              <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Your privacy is important to us. All uploaded files are temporarily stored during video processing and
                automatically deleted after your session ends. We don't store your content permanently or share it with
                third parties. Read our{' '}
                <button onClick={() => navigate('/privacy')} className="text-blue-400 hover:text-blue-300 underline font-medium">
                  Privacy Policy
                </button>{' '}
                for more details.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>How QWimgenv Was Created</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Curious about the journey behind QWimgenv? Learn about the challenges we faced, the technical
                decisions we made, and where we're headed next.
              </p>
              <motion.button
                onClick={() => navigate('/origin-story')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Read Our Story
              </motion.button>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Get Started</h2>
              <p className="text-lg leading-relaxed mb-6 text-gray-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Ready to create your first video? It's simple - just upload your photos, select your music,
                and let QWimgenv do the rest!
              </p>
              <motion.button
                onClick={() => navigate('/generator')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Creating
              </motion.button>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
      </div>
    </div>
  )
}

export default About
