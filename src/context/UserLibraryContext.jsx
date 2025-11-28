import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const UserLibraryContext = createContext(null)

const STORAGE_KEY = 'libraryCatalog_userLibrary'

export function UserLibraryProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [library, setLibrary] = useState({})

  // Load library from localStorage on mount and when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLibrary({})
      return
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.uid || user.email}`)
      if (stored) {
        setLibrary(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load user library:', error)
      setLibrary({})
    }
  }, [user, isAuthenticated])

  // Save library to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated || !user || Object.keys(library).length === 0) return

    try {
      localStorage.setItem(`${STORAGE_KEY}_${user.uid || user.email}`, JSON.stringify(library))
    } catch (error) {
      console.error('Failed to save user library:', error)
    }
  }, [library, user, isAuthenticated])

  const saveBook = useCallback((book) => {
    if (!isAuthenticated) return false

    setLibrary(prev => ({
      ...prev,
      [book.isbn]: {
        ...prev[book.isbn],
        ...book,
        saved: true,
        savedAt: new Date().toISOString()
      }
    }))
    return true
  }, [isAuthenticated])

  const unsaveBook = useCallback((isbn) => {
    if (!isAuthenticated) return false

    setLibrary(prev => {
      const updated = { ...prev }
      if (updated[isbn]) {
        updated[isbn] = { ...updated[isbn], saved: false }
        // If book has no other status, remove it
        if (!updated[isbn].favorite && !updated[isbn].rated && !updated[isbn].reviewed) {
          delete updated[isbn]
        }
      }
      return updated
    })
    return true
  }, [isAuthenticated])

  const favoriteBook = useCallback((book) => {
    if (!isAuthenticated) return false

    setLibrary(prev => ({
      ...prev,
      [book.isbn]: {
        ...prev[book.isbn],
        ...book,
        favorite: true,
        favoritedAt: new Date().toISOString()
      }
    }))
    return true
  }, [isAuthenticated])

  const unfavoriteBook = useCallback((isbn) => {
    if (!isAuthenticated) return false

    setLibrary(prev => {
      const updated = { ...prev }
      if (updated[isbn]) {
        updated[isbn] = { ...updated[isbn], favorite: false }
        // If book has no other status, remove it
        if (!updated[isbn].saved && !updated[isbn].rated && !updated[isbn].reviewed) {
          delete updated[isbn]
        }
      }
      return updated
    })
    return true
  }, [isAuthenticated])

  const rateBook = useCallback((book, rating) => {
    if (!isAuthenticated) return false

    setLibrary(prev => ({
      ...prev,
      [book.isbn]: {
        ...prev[book.isbn],
        ...book,
        rated: true,
        rating: rating,
        ratingLabel: getRatingLabel(rating),
        ratedAt: new Date().toISOString()
      }
    }))
    return true
  }, [isAuthenticated])

  const reviewBook = useCallback((book, review) => {
    if (!isAuthenticated) return false

    setLibrary(prev => ({
      ...prev,
      [book.isbn]: {
        ...prev[book.isbn],
        ...book,
        reviewed: true,
        review: review,
        reviewedAt: new Date().toISOString()
      }
    }))
    return true
  }, [isAuthenticated])

  const getBookStatus = useCallback((isbn) => {
    const defaultStatus = {
      saved: false,
      favorite: false,
      rated: false,
      reviewed: false,
      rating: null,
      ratingLabel: '—'
    }
    
    if (!isbn || !library || typeof library !== 'object') {
      return defaultStatus
    }
    
    return library[isbn] || defaultStatus
  }, [library])

  const getAllBooks = useCallback(() => {
    if (!library || typeof library !== 'object') {
      return []
    }
    return Object.values(library).filter(book => 
      book && (book.saved || book.favorite || book.rated || book.reviewed)
    )
  }, [library])

  const value = {
    library,
    saveBook,
    unsaveBook,
    favoriteBook,
    unfavoriteBook,
    rateBook,
    reviewBook,
    getBookStatus,
    getAllBooks
  }

  return (
    <UserLibraryContext.Provider value={value}>
      {children}
    </UserLibraryContext.Provider>
  )
}

export function useUserLibrary() {
  const context = useContext(UserLibraryContext)
  if (!context) {
    throw new Error('useUserLibrary must be used within a UserLibraryProvider')
  }
  return context
}

// Helper function to convert rating number to star label
function getRatingLabel(rating) {
  if (!rating || rating === 0) return '—'
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  // Use filled star (★) and empty star (☆) Unicode characters
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '★' : '') + 
         '☆'.repeat(emptyStars)
}

