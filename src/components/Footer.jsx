import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()

  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Privacy Policy', path: '/privacy' }
  ]

  return (
    <motion.footer
      className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="text-gray-300 text-sm font-medium">© 2025 QWimgenv</span>
          <span className="hidden sm:inline text-gray-600">|</span>
          {footerLinks.map((link, index) => (
            <React.Fragment key={link.path}>
              <motion.button
                onClick={() => navigate(link.path)}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.button>
              {index < footerLinks.length - 1 && (
                <span className="hidden sm:inline text-gray-600">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
