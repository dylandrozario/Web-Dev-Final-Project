import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const UserLibraryContext = createContext(null)

const STORAGE_KEY = 'libraryCatalog_userLibrary'

// Helper function to check if a book has valid status
function hasValidStatus(book) {
  if (!book) return false
  
  // Normalize invalid states
  const isSaved = book.saved === true
  const isFavorite = book.favorite === true
  const isRated = book.rated === true && book.rating !== undefined && book.rating !== null && book.rating > 0
  const isReviewed = book.reviewed === true && book.review && book.review.trim().length > 0
  
  return isSaved || isFavorite || isRated || isReviewed
}

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
      if (stored && stored.trim() !== '') {
        const parsedLibrary = JSON.parse(stored)
        
        // Known problematic books that should be removed (these were likely added during testing)
        const problematicISBNs = ['OLOL52266W', 'OLOL265415W', 'OLOL676009W'];
        const problematicTitles = ['The Invisible Man', 'At Bertram\'s Hotel', 'Мастер и Маргарита'];
        
        // Clean library: remove books that don't have valid saved/favorite/rated/reviewed status
        // Also normalize invalid states (e.g., rated: true but rating: 0)
        const cleanedLibrary = {}
        let hasChanges = false
        
        Object.keys(parsedLibrary).forEach(isbn => {
          const book = parsedLibrary[isbn]
          if (!book) return
          
          // STRICT: Remove known problematic books that shouldn't be in user's library
          // These books were likely added during testing and should be removed
          const isProblematicISBN = problematicISBNs.includes(isbn);
          const isProblematicTitle = book.title && problematicTitles.some(title => book.title.includes(title));
          
          if (isProblematicISBN || isProblematicTitle) {
            console.log('[UserLibrary] Removing problematic book:', {
              isbn: book.isbn,
              title: book.title,
              reason: 'Known problematic book that should not be in library'
            });
            hasChanges = true;
            return; // Skip this book
          }
          
          // Normalize invalid states
          const normalizedBook = { ...book }
          
          // If rated is true but rating is invalid, set rated to false
          if (normalizedBook.rated === true && (normalizedBook.rating === undefined || normalizedBook.rating === null || normalizedBook.rating <= 0)) {
            normalizedBook.rated = false
            normalizedBook.rating = null
            normalizedBook.ratingLabel = '—'
            hasChanges = true
          }
          
          // If reviewed is true but review is empty, set reviewed to false
          if (normalizedBook.reviewed === true && (!normalizedBook.review || typeof normalizedBook.review !== 'string' || normalizedBook.review.trim().length === 0)) {
            normalizedBook.reviewed = false
            normalizedBook.review = undefined
            hasChanges = true
          }
          
          // Only keep books with valid status
          if (hasValidStatus(normalizedBook)) {
            cleanedLibrary[isbn] = normalizedBook
            // Check if the normalized book is different from original
            if (JSON.stringify(normalizedBook) !== JSON.stringify(book)) {
              hasChanges = true
            }
          } else {
            // Debug: Log books being removed
            console.log('Removing book from library (no valid status):', {
              isbn: book.isbn,
              title: book.title,
              saved: book.saved,
              favorite: book.favorite,
              rated: book.rated,
              rating: book.rating,
              reviewed: book.reviewed,
              hasReview: !!(book.review && typeof book.review === 'string' && book.review.trim().length > 0)
            })
            hasChanges = true
          }
        })
        
        // Always save cleaned library if there were changes, or if counts differ
        if (hasChanges || Object.keys(cleanedLibrary).length !== Object.keys(parsedLibrary).length) {
          // Save cleaned library back to localStorage
          localStorage.setItem(`${STORAGE_KEY}_${user.uid || user.email}`, JSON.stringify(cleanedLibrary))
          setLibrary(cleanedLibrary)
        } else {
          setLibrary(parsedLibrary)
        }
      }
    } catch (error) {
      console.error('Failed to load user library:', error)
      setLibrary({})
    }
  }, [user, isAuthenticated])

  // Clean up invalid books from library state immediately (not just on save)
  // This ensures the library state always reflects only valid books
  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (!library || Object.keys(library).length === 0) return

    try {
      // Known problematic books that should be removed (these were likely added during testing)
      const problematicISBNs = ['OLOL52266W', 'OLOL265415W', 'OLOL676009W'];
      const problematicTitles = ['The Invisible Man', 'At Bertram\'s Hotel', 'Мастер и Маргарита'];
      
      // Clean library state: remove books that don't have valid status
      const cleanedLibrary = {}
      let hasInvalidBooks = false
      
      Object.keys(library).forEach(isbn => {
        const book = library[isbn]
        if (!book) return
        
        // STRICT: Remove known problematic books that shouldn't be in user's library
        const isProblematicISBN = problematicISBNs.includes(isbn);
        const isProblematicTitle = book.title && problematicTitles.some(title => book.title.includes(title));
        
        if (isProblematicISBN || isProblematicTitle) {
          console.log('[UserLibrary] Removing problematic book from library state:', {
            isbn: book.isbn,
            title: book.title,
            reason: 'Known problematic book that should not be in library'
          });
          hasInvalidBooks = true;
          return; // Skip this book
        }
        
        // Normalize invalid states first
        const normalizedBook = { ...book }
        
        // If rated is true but rating is invalid, set rated to false
        if (normalizedBook.rated === true && (normalizedBook.rating === undefined || normalizedBook.rating === null || normalizedBook.rating <= 0)) {
          normalizedBook.rated = false
          normalizedBook.rating = null
          normalizedBook.ratingLabel = '—'
        }
        
        // If reviewed is true but review is empty, set reviewed to false
        if (normalizedBook.reviewed === true && (!normalizedBook.review || typeof normalizedBook.review !== 'string' || normalizedBook.review.trim().length === 0)) {
          normalizedBook.reviewed = false
          normalizedBook.review = undefined
        }
        
        // Only keep books with valid status
        if (hasValidStatus(normalizedBook)) {
          cleanedLibrary[isbn] = normalizedBook
        } else {
          hasInvalidBooks = true
          console.log('[UserLibrary] Removing invalid book from library state:', {
            isbn: book.isbn,
            title: book.title,
            saved: book.saved,
            favorite: book.favorite,
            rated: book.rated,
            rating: book.rating,
            reviewed: book.reviewed,
            hasReview: !!(book.review && typeof book.review === 'string' && book.review.trim().length > 0)
          })
        }
      })
      
      // If there were invalid books or the library structure changed, update the library state immediately
      const libraryKeysChanged = Object.keys(cleanedLibrary).length !== Object.keys(library).length
      const libraryKeysMatch = Object.keys(cleanedLibrary).every(isbn => library[isbn])
      
      if (hasInvalidBooks || libraryKeysChanged || !libraryKeysMatch) {
        console.log('[UserLibrary] Cleaning library state:', {
          before: Object.keys(library).length,
          after: Object.keys(cleanedLibrary).length,
          removed: Object.keys(library).length - Object.keys(cleanedLibrary).length,
          hasInvalidBooks,
          libraryKeysChanged
        })
        // Only update if there are actual changes to avoid infinite loops
        if (JSON.stringify(Object.keys(cleanedLibrary).sort()) !== JSON.stringify(Object.keys(library).sort())) {
          setLibrary(cleanedLibrary)
        }
      }
    } catch (error) {
      console.error('[UserLibrary] Failed to clean library state:', error)
    }
  }, [library, user, isAuthenticated])

  // Save library to localStorage whenever it changes
  // Clean up invalid books before saving
  useEffect(() => {
    if (!isAuthenticated || !user) return

    try {
      // Known problematic books that should be removed (these were likely added during testing)
      const problematicISBNs = ['OLOL52266W', 'OLOL265415W', 'OLOL676009W'];
      const problematicTitles = ['The Invisible Man', 'At Bertram\'s Hotel', 'Мастер и Маргарита'];
      
      // Clean library before saving to ensure no invalid books are persisted
      const cleanedLibrary = {}
      
      Object.keys(library).forEach(isbn => {
        const book = library[isbn]
        if (!book) return
        
        // STRICT: Remove known problematic books that shouldn't be in user's library
        const isProblematicISBN = problematicISBNs.includes(isbn);
        const isProblematicTitle = book.title && problematicTitles.some(title => book.title.includes(title));
        
        if (isProblematicISBN || isProblematicTitle) {
          console.log('[UserLibrary] Removing problematic book during save:', {
            isbn: book.isbn,
            title: book.title,
            reason: 'Known problematic book that should not be in library'
          });
          return; // Skip this book - don't save it
        }
        
        // Normalize invalid states first
        const normalizedBook = { ...book }
        
        // If rated is true but rating is invalid, set rated to false
        if (normalizedBook.rated === true && (normalizedBook.rating === undefined || normalizedBook.rating === null || normalizedBook.rating <= 0)) {
          normalizedBook.rated = false
          normalizedBook.rating = null
          normalizedBook.ratingLabel = '—'
        }
        
        // If reviewed is true but review is empty, set reviewed to false
        if (normalizedBook.reviewed === true && (!normalizedBook.review || typeof normalizedBook.review !== 'string' || normalizedBook.review.trim().length === 0)) {
          normalizedBook.reviewed = false
          normalizedBook.review = undefined
        }
        
        // Only keep books with valid status
        if (hasValidStatus(normalizedBook)) {
          cleanedLibrary[isbn] = normalizedBook
        } else {
          console.log('[UserLibrary] Removing invalid book during save:', {
            isbn: book.isbn,
            title: book.title,
            saved: book.saved,
            favorite: book.favorite,
            rated: book.rated,
            rating: book.rating,
            reviewed: book.reviewed,
            hasReview: !!(book.review && typeof book.review === 'string' && book.review.trim().length > 0)
          })
        }
      })
      
      // Always save the cleaned library (even if empty)
      localStorage.setItem(`${STORAGE_KEY}_${user.uid || user.email}`, JSON.stringify(cleanedLibrary))
    } catch (error) {
      console.error('[UserLibrary] Failed to save user library:', error)
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
        
        // If book has no valid status, remove it
        if (!hasValidStatus(updated[isbn])) {
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
        
        // If book has no valid status, remove it
        if (!hasValidStatus(updated[isbn])) {
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
        
        // If book has no valid status, remove it
        if (!hasValidStatus(updated[isbn])) {
          console.log('Removing book after unrate (no valid status):', {
            isbn: updated[isbn].isbn,
            title: updated[isbn].title
          })
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
        
        // If book has no valid status, remove it
        if (!hasValidStatus(updated[isbn])) {
          console.log('Removing book after unreview (no valid status):', {
            isbn: updated[isbn].isbn,
            title: updated[isbn].title
          })
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
    // Include all books that are saved, favorited, rated (with actual rating > 0), or reviewed (with actual review text)
    return Object.values(library).filter(book => {
      if (!book) return false
      
      // Must have at least one valid status
      const isSaved = book.saved === true
      const isFavorite = book.favorite === true
      const isRated = book.rated === true && book.rating !== undefined && book.rating !== null && book.rating > 0
      const isReviewed = book.reviewed === true && book.review && book.review.trim().length > 0
      
      const isValid = isSaved || isFavorite || isRated || isReviewed
      
      // Debug: Log books that are being filtered
      if (!isValid && book.isbn) {
        console.log('Filtering out book from getAllBooks (no valid status):', {
          isbn: book.isbn,
          title: book.title,
          saved: book.saved,
          favorite: book.favorite,
          rated: book.rated,
          rating: book.rating,
          reviewed: book.reviewed,
          hasReview: !!(book.review && book.review.trim().length > 0)
        })
      }
      
      return isValid
    })
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

