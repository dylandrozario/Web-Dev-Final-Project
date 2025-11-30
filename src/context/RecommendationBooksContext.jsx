import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import fetchBooksCatalog from '../services/booksApi'

const RecommendationBooksContext = createContext(null)

const CACHE_KEY = 'bc_recommendation_books_cache'
const CACHE_TIMESTAMP_KEY = 'bc_recommendation_books_cache_timestamp'
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
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    }
  } catch (err) {
    console.error('Error reading recommendation cache:', err)
  }
  return null
}

function setCachedBooks(books) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(books))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch (err) {
    console.error('Error writing recommendation cache:', err)
  }
}

export function RecommendationBooksProvider({ children }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    
    const cachedBooks = getCachedBooks()
    if (cachedBooks && cachedBooks.length > 0) {
      setBooks(cachedBooks)
      setLoading(false)
    }
    
    async function loadBooks() {
      try {
        // Fetch with a larger limit for recommendations
        const fetched = await fetchBooksCatalog(1000) // or whatever limit you want
        if (active && fetched && fetched.length > 0) {
          console.log('Number of recommendation books fetched:', fetched.length)
          setBooks(fetched)
          setCachedBooks(fetched)
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load recommendation books:', err)
          setError(err.message || 'Unable to load recommendation catalog')
          if (!cachedBooks) {
            setBooks([])
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    
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
    <RecommendationBooksContext.Provider value={value}>
      {children}
    </RecommendationBooksContext.Provider>
  )
}

export function useRecommendationBooks() {
  const context = useContext(RecommendationBooksContext)
  if (!context) {
    throw new Error('useRecommendationBooks must be used within a RecommendationBooksProvider')
  }
  return context
}