import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export const useNavigationConfirmation = (hasGeneratedVideo, cleanupAndReset) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navigateWithConfirmation = (path, confirmCallback) => {
    if (hasGeneratedVideo) {
      confirmCallback(() => async () => {
        await cleanupAndReset()
        navigate(path)
      })
    } else {
      navigate(path)
    }
  }

  // Handle browser back/forward navigation - auto cleanup without alerts
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasGeneratedVideo) {
        // Silently trigger cleanup without showing any alerts
        cleanupAndReset()
      }
    }

    if (hasGeneratedVideo) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasGeneratedVideo, cleanupAndReset])

  return { navigateWithConfirmation }
}