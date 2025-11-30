import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Hook for navigation that automatically scrolls to top
 * Note: ScrollToTop component already handles this, but this is useful
 * for cases where you want explicit control
 */
export function useNavigateWithScroll() {
  const navigate = useNavigate()

  const navigateWithScroll = useCallback((to, options) => {
    navigate(to, options)
    window.scrollTo(0, 0)
  }, [navigate])

  return navigateWithScroll
}

