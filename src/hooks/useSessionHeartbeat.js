import { useEffect, useRef } from 'react'

// Generate or get session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('tkvgen-session-id')
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    sessionStorage.setItem('tkvgen-session-id', sessionId)
  }
  return sessionId
}

export const useSessionHeartbeat = () => {
  const intervalRef = useRef(null)
  const sessionIdRef = useRef(getSessionId())

  const sendHeartbeat = async () => {
    try {
      const response = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current
        })
      })

      if (!response.ok) {
        console.warn('Heartbeat failed:', response.status)
      }
    } catch (error) {
      console.warn('Heartbeat error:', error)
    }
  }

  const startHeartbeat = () => {
    // Send initial heartbeat
    sendHeartbeat()
    
    // Send heartbeat every 2 minutes
    intervalRef.current = setInterval(sendHeartbeat, 2 * 60 * 1000)
  }

  const stopHeartbeat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    startHeartbeat()

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat()
      } else {
        startHeartbeat()
      }
    }

    // Handle beforeunload to send final cleanup signal
    const handleBeforeUnload = () => {
      // Send a synchronous cleanup signal without any alerts or confirmations
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/heartbeat', JSON.stringify({
          sessionId: sessionIdRef.current,
          leaving: true
        }))
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      stopHeartbeat()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return {
    sessionId: sessionIdRef.current,
    sendHeartbeat,
    startHeartbeat,
    stopHeartbeat
  }
}