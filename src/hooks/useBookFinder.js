import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useBooks } from '../context/BooksContext';
import { isbnMatches } from '../utils/bookUtils';

/**
 * Hook for finding a book by ISBN or ID from route params
 */
export function useBookFinder() {
  const { id, isbn } = useParams();
  const location = useLocation();
  const { books, loading } = useBooks();

  const { book, bookNotFound, isLoading } = useMemo(() => {
    if (loading || !books?.length) {
      return { book: null, bookNotFound: false, isLoading: true };
    }

    const bookIdentifier = isbn || id || location.pathname.split('/').pop();
    
    if (bookIdentifier) {
      const foundByIsbn = books.find(b => isbnMatches(b.isbn, bookIdentifier));
      if (foundByIsbn) return { book: foundByIsbn, bookNotFound: false, isLoading: false };
      
      const index = parseInt(bookIdentifier);
      if (!isNaN(index) && index >= 0 && index < books.length) {
        return { book: books[index], bookNotFound: false, isLoading: false };
      }
    }
    
    return { book: null, bookNotFound: true, isLoading: false };
  }, [id, isbn, location.pathname, books, loading]);

  return { book, bookNotFound, isLoading, loading };
}

