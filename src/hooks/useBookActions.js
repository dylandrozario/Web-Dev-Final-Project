import { useCallback } from 'react';
import { useRequireAuth } from './useRequireAuth';
import { useUserLibrary } from '../context/UserLibraryContext';

/**
 * Hook for book actions (save, favorite) with authentication checks
 */
export function useBookActions() {
  const { requireAuth } = useRequireAuth();
  const { saveBook, unsaveBook, favoriteBook, unfavoriteBook, getBookStatus } = useUserLibrary();

  const handleSave = useCallback((book, bookStatus) => {
    return requireAuth(() => {
      if (!book?.isbn) return false;
      bookStatus?.saved ? unsaveBook(book.isbn) : saveBook(book);
      return true;
    });
  }, [requireAuth, saveBook, unsaveBook]);

  const handleFavorite = useCallback((book, bookStatus) => {
    return requireAuth(() => {
      if (!book?.isbn) return false;
      bookStatus?.favorite ? unfavoriteBook(book.isbn) : favoriteBook(book);
      return true;
    });
  }, [requireAuth, favoriteBook, unfavoriteBook]);

  return { handleSave, handleFavorite, requireAuth, getBookStatus };
}

