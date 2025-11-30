import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Hook for requiring authentication before performing actions
 * Automatically redirects to sign-in if user is not authenticated
 */
export function useRequireAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const requireAuth = useCallback((callback) => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: location.pathname } })
      return false
    }
    return callback()
  }, [isAuthenticated, navigate, location.pathname])

  return {
    requireAuth,
    isAuthenticated
  }
}

