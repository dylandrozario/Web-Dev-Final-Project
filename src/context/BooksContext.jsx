import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import fetchBooksCatalog from '../services/booksApi'

const BooksContext = createContext(null)

const CACHE_KEY = 'bc_library_books_cache'
const CACHE_TIMESTAMP_KEY = 'bc_library_books_cache_timestamp'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

function getCachedBooks() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10)
      if (age < CACHE_DURATION) {
        return JSON.parse(cached)
      }
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    }
  } catch (err) {
    console.error('Error reading cache:', err)
  }
  return null
}

function setCachedBooks(books) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(books))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch (err) {
    console.error('Error writing cache:', err)
  }
}

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    
    // Try to load from cache first for instant display
    const cachedBooks = getCachedBooks()
    if (cachedBooks && cachedBooks.length > 0) {
      setBooks(cachedBooks)
      setLoading(false)
    }
    
    async function loadBooks() {
      try {
        const fetched = await fetchBooksCatalog()
        if (active && fetched && fetched.length > 0) {
          setBooks(fetched)
          setCachedBooks(fetched)
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load books:', err)
          setError(err.message || 'Unable to load catalog')
          // If we have cached books, keep using them even if fetch fails
          if (!cachedBooks) {
            setBooks([])
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    
    // Always fetch fresh data in background, but show cached immediately
    loadBooks()
    
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({
    books,
    loading,
    error
  }), [books, loading, error])

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  )
}

export function useBooks() {
  const context = useContext(BooksContext)
  if (!context) {
    throw new Error('useBooks must be used within a BooksProvider')
  }
  return context
}

