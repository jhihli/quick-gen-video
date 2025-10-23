import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useSessionHeartbeat } from './hooks/useSessionHeartbeat'
import LoadingFallback from './components/LoadingFallback'

// Lazy load route components for code splitting
const Home = React.lazy(() => import('./components/Home'))
const Generator = React.lazy(() => import('./components/Generator'))
const HelpLanding = React.lazy(() => import('./components/HelpLanding'))
const TopicDetail = React.lazy(() => import('./components/TopicDetail'))
const About = React.lazy(() => import('./components/About'))
const Privacy = React.lazy(() => import('./components/Privacy'))
const OriginStory = React.lazy(() => import('./components/OriginStory'))
const News = React.lazy(() => import('./components/News'))

function AppWithHeartbeat() {
  useSessionHeartbeat()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Suspense fallback={<LoadingFallback message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/help" element={<HelpLanding />} />
          <Route path="/help/:topicId" element={<TopicDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/origin-story" element={<OriginStory />} />
        </Routes>
      </Suspense>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppWithHeartbeat />
      </Router>
    </AppProvider>
  )
}

export default App