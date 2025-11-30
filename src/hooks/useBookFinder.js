import { useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useBooks } from '../context/BooksContext'
import { isbnMatches } from '../utils/bookUtils'

/**
 * Hook for finding a book by ISBN or ID from route params
 * Handles loading states and book not found scenarios
 */
export function useBookFinder() {
  const { id, isbn } = useParams()
  const location = useLocation()
  const { books, loading } = useBooks()

  const { book, bookNotFound, isLoading } = useMemo(() => {
    // If books are still loading, don't mark as not found yet
    if (loading || !books || books.length === 0) {
      return { book: null, bookNotFound: false, isLoading: true }
    }

    // Check if we have ISBN in params
    const bookIdentifier = isbn || id || location.pathname.split('/').pop()
    
    if (bookIdentifier) {
      // Try to find by ISBN first (handle with or without dashes)
      const foundByIsbn = books.find(b => isbnMatches(b.isbn, bookIdentifier))
      if (foundByIsbn) return { book: foundByIsbn, bookNotFound: false, isLoading: false }
      
      // Otherwise try by index
      const index = parseInt(bookIdentifier)
      if (!isNaN(index) && index >= 0 && index < books.length) {
        return { book: books[index], bookNotFound: false, isLoading: false }
      }
    }
    // Book not found (only after books have loaded)
    return { book: null, bookNotFound: true, isLoading: false }
  }, [id, isbn, location.pathname, books, loading])

  return {
    book,
    bookNotFound,
    isLoading,
    loading
  }
}

