import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAdSenseCookies, areCookiesEnabled } from './utils/cookieManager.js'

// Initialize AdSense cookie support on app load
if (areCookiesEnabled()) {
  initAdSenseCookies()
  console.log('✅ Cookies enabled and initialized for AdSense tracking')
} else {
  console.warn('⚠️ Cookies are disabled in browser')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)