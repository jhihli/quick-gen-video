import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import Footer from './Footer'

const Privacy = () => {
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
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/20"
        >
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-8 tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Privacy Policy</h1>

          <div className="space-y-8 text-gray-200">
            <p className="text-base text-gray-600 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Last Updated: Nov 2025</p>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Introduction</h2>
              <p className="text-lg leading-relaxed text-gray-200" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Welcome to QWimgenv. We are committed to protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we collect, use, and safeguard your data when
                you use our video creation service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Information We Collect</h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>User-Uploaded Content</h3>
                  <ul className="list-none space-y-2 ml-4 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <li className="flex items-start"><span className="text-cyan-400 mr-3 font-bold">•</span><span className="text-gray-200">Photos and videos you upload for video creation</span></li>
                    <li className="flex items-start"><span className="text-cyan-400 mr-3 font-bold">•</span><span className="text-gray-200">Music files you upload or select from our library</span></li>
                    <li className="flex items-start"><span className="text-cyan-400 mr-3 font-bold">•</span><span className="text-gray-200">Avatar selections and positioning data</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Technical Information</h3>
                  <ul className="list-none space-y-2 ml-4 text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <li className="flex items-start"><span className="text-cyan-400 mr-3 font-bold">•</span><span className="text-gray-200">Session identifiers for file management</span></li>
                    <li className="flex items-start"><span className="text-cyan-400 mr-3 font-bold">•</span><span className="text-gray-200">Browser type and device information</span></li>
                    <li className="flex items-start"><span className="text-cyan-400 mr-3 font-bold">•</span><span className="text-gray-200">IP address for security purposes</span></li>
                    <li className="flex items-start"><span className="text-cyan-400 mr-3 font-bold">•</span><span className="text-gray-200">Usage statistics and analytics (anonymized)</span></li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>How We Use Your Information</h2>
              <ul className="space-y-3 list-none text-base" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-200">To process and generate your videos</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-200">To provide temporary download links via QR codes</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-200">To improve our service and user experience</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-200">To maintain security and prevent abuse</span></li>
                <li className="flex items-start"><span className="text-cyan-400 mr-3 text-xl font-bold">✓</span><span className="text-gray-200">To analyze usage patterns (anonymized data only)</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Data Storage and Retention</h2>
              <div className="space-y-4">
                <p>
                  <span className="font-medium text-white">Temporary Storage:</span> All uploaded files (photos, videos, music)
                  and generated videos are stored temporarily on our servers during your active session.
                </p>
                <p>
                  <span className="font-medium text-white">Automatic Deletion:</span> Your files are automatically deleted:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>After 5 minutes of session inactivity</li>
                  <li>When you close your browser or end your session</li>
                  <li>Within 30 minutes regardless of activity (maximum retention)</li>
                </ul>
                <p>
                  <span className="font-medium text-white">No Permanent Storage:</span> We do not permanently store your
                  uploaded content or generated videos on our servers. Once deleted, files cannot be recovered.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Third-Party Services</h2>
              <div className="space-y-3 leading-relaxed">
                <p>We use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><span className="font-medium">Google AdSense:</span> For displaying advertisements. Google may collect
                    data according to their privacy policy.</li>
                  <li><span className="font-medium">Analytics Services:</span> To understand how users interact with our
                    service (anonymized data only).</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your data during processing:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Secure HTTPS connections for all data transfers</li>
                <li>Session-based file management with unique identifiers</li>
                <li>Automated cleanup processes to prevent data accumulation</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Your Rights</h2>
              <p className="leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Access the data you've uploaded during your session</li>
                <li>Delete your session data at any time by resetting the application</li>
                <li>Request information about our data practices</li>
                <li>Opt out of analytics tracking (contact us for details)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use session cookies to maintain your application state and provide a seamless experience.
                These cookies are essential for the service to function and are automatically deleted when you
                close your browser.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Children's Privacy</h2>
              <p className="leading-relaxed">
                QWimgenv is not intended for users under the age of 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected such information, please
                contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of any material changes
                by updating the "Last Updated" date at the top of this policy. Continued use of the service after
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions or concerns about this Privacy Policy or our data practices, please
                contact us at:
              </p>
              <div className="mt-3">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a href="mailto:qwimgenv2025@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                    qwimgenv2025@gmail.com
                  </a>
                </p>
              </div>
            </section>

            <section className="pt-6 border-t border-white/20">
              <p className="text-sm text-gray-400 leading-relaxed">
                By using QWimgenv, you acknowledge that you have read and understood this Privacy Policy and
                agree to its terms.
              </p>
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

export default Privacy
