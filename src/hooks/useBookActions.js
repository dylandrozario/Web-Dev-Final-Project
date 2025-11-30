import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUserLibrary } from '../context/UserLibraryContext'

/**
 * Hook for book actions (save, favorite) with authentication checks
 * Handles navigation to sign-in if user is not authenticated
 */
export function useBookActions() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { saveBook, unsaveBook, favoriteBook, unfavoriteBook, getBookStatus } = useUserLibrary()

  const requireAuth = useCallback((callback) => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: location.pathname } })
      return false
    }
    return callback()
  }, [isAuthenticated, navigate, location.pathname])

  const handleSave = useCallback((book, bookStatus) => {
    return requireAuth(() => {
      if (!book?.isbn) return false
      
      if (bookStatus?.saved) {
        unsaveBook(book.isbn)
      } else {
        saveBook(book)
      }
      return true
    })
  }, [requireAuth, saveBook, unsaveBook])

  const handleFavorite = useCallback((book, bookStatus) => {
    return requireAuth(() => {
      if (!book?.isbn) return false
      
      if (bookStatus?.favorite) {
        unfavoriteBook(book.isbn)
      } else {
        favoriteBook(book)
      }
      return true
    })
  }, [requireAuth, favoriteBook, unfavoriteBook])

  return {
    handleSave,
    handleFavorite,
    requireAuth,
    getBookStatus
  }
}

