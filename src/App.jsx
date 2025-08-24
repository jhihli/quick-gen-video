import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './context/LanguageContext'
import { useSessionHeartbeat } from './hooks/useSessionHeartbeat'
import LoadingFallback from './components/LoadingFallback'
import LanguageLoadingWrapper from './components/LanguageLoadingWrapper'

// Lazy load route components for code splitting
const Home = React.lazy(() => import('./components/Home'))
const Generator = React.lazy(() => import('./components/Generator'))

function AppWithHeartbeat() {
  useSessionHeartbeat()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Suspense fallback={<LoadingFallback message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Generator />} />
        </Routes>
      </Suspense>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <LanguageLoadingWrapper>
        <AppProvider>
          <Router>
            <AppWithHeartbeat />
          </Router>
        </AppProvider>
      </LanguageLoadingWrapper>
    </LanguageProvider>
  )
}

export default App