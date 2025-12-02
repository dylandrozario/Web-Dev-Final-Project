import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for navigation that automatically scrolls to top
 */
export function useNavigateWithScroll() {
  const navigate = useNavigate();

  return useCallback((to, options) => {
    navigate(to, options);
    window.scrollTo(0, 0);
  }, [navigate]);
}

