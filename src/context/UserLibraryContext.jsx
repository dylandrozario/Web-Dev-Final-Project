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

    setLibrary(prev => {
      const existing = prev[book.isbn] || {}
      return {
        ...prev,
        [book.isbn]: {
          // Preserve existing library data (including user's rating!)
          ...existing,
          // Only add essential book fields (not rating from catalog)
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          genre: book.genre,
          // Set saved status (preserve existing rating/review)
          saved: true,
          savedAt: new Date().toISOString()
        }
      }
    })
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

    setLibrary(prev => {
      const existing = prev[book.isbn] || {}
      return {
        ...prev,
        [book.isbn]: {
          // Preserve existing library data (including user's rating!)
          ...existing,
          // Only add essential book fields (not rating from catalog)
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          genre: book.genre,
          // Set favorite status (preserve existing rating/review)
          favorite: true,
          favoritedAt: new Date().toISOString()
        }
      }
    })
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

    setLibrary(prev => {
      const existing = prev[book.isbn] || {}
      return {
        ...prev,
        [book.isbn]: {
          // Preserve existing library data
          ...existing,
          // Only add essential book fields (not rating from catalog)
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          genre: book.genre,
          // Set user's rating (this is the user's rating, not catalog average)
          rated: true,
          rating: rating,
          ratingLabel: getRatingLabel(rating),
          ratedAt: new Date().toISOString()
        }
      }
    })
    return true
  }, [isAuthenticated])

  const unrateBook = useCallback((isbn) => {
    if (!isAuthenticated) return false

    setLibrary(prev => {
      const updated = { ...prev }
      if (updated[isbn]) {
        updated[isbn] = { ...updated[isbn], rated: false, rating: null, ratingLabel: '—' }
        // If book has no other status, remove it
        if (!updated[isbn].saved && !updated[isbn].favorite && !updated[isbn].reviewed) {
          delete updated[isbn]
        }
      }
      return updated
    })
    return true
  }, [isAuthenticated])

  const reviewBook = useCallback((book, review) => {
    if (!isAuthenticated) return false

    setLibrary(prev => {
      const existing = prev[book.isbn] || {}
      return {
        ...prev,
        [book.isbn]: {
          // Preserve existing library data (including user's rating!)
          ...existing,
          // Only add essential book fields (not rating from catalog)
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          genre: book.genre,
          // Set review data (preserve existing rating)
          reviewed: true,
          review: review,
          reviewedAt: new Date().toISOString()
        }
      }
    })
    return true
  }, [isAuthenticated])

  const unreviewBook = useCallback((isbn) => {
    if (!isAuthenticated) return false

    setLibrary(prev => {
      const updated = { ...prev }
      if (updated[isbn]) {
        updated[isbn] = { ...updated[isbn], reviewed: false, review: undefined }
        // If book has no other status, remove it
        if (!updated[isbn].saved && !updated[isbn].favorite && !updated[isbn].rated) {
          delete updated[isbn]
        }
      }
      return updated
    })
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
    // Include all books that are saved, favorited, rated, or reviewed
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
    unrateBook,
    reviewBook,
    unreviewBook,
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

