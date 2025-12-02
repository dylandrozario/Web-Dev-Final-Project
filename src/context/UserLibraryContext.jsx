import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const UserLibraryContext = createContext(null)

const STORAGE_KEY = 'libraryCatalog_userLibrary'

// Known problematic books that should be removed (these were likely added during testing)
// Note: "The Invisible Man" and "Мастер и Маргарита" are now allowed - users can interact with them
const PROBLEMATIC_ISBNS = ['OLOL265415W']; // Only "At Bertram's Hotel" remains problematic
const PROBLEMATIC_TITLES = ['At Bertram\'s Hotel'];

function hasValidStatus(book) {
  if (!book) return false;
  return book.saved === true ||
         book.favorite === true ||
         (book.rated === true && book.rating > 0) ||
         (book.reviewed === true && book.review?.trim());
}

function normalizeBookState(book) {
  const normalized = { ...book };
  if (normalized.rated === true && (!normalized.rating || normalized.rating <= 0)) {
    normalized.rated = false;
    normalized.rating = null;
    normalized.ratingLabel = '—';
  }
  if (normalized.reviewed === true && !normalized.review?.trim()) {
    normalized.reviewed = false;
    normalized.review = undefined;
  }
  return normalized;
}

function isProblematicBook(book) {
  if (!book) return false;
  return PROBLEMATIC_ISBNS.includes(book.isbn) || 
         PROBLEMATIC_TITLES.some(title => book.title?.includes(title));
}

// Clean library: remove problematic books and invalid states
function cleanLibrary(library) {
  const cleaned = {};
  Object.values(library || {}).forEach(book => {
    if (!book || isProblematicBook(book)) return;
    const normalized = normalizeBookState(book);
    if (hasValidStatus(normalized)) {
      cleaned[normalized.isbn] = normalized;
    }
  });
  return cleaned;
}

function getStorageKey(user) {
  return `${STORAGE_KEY}_${user.uid || user.email}`;
}

export function UserLibraryProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [library, setLibrary] = useState({});

  // Load library from localStorage on mount and when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLibrary({});
      return;
    }

    try {
      const stored = localStorage.getItem(getStorageKey(user));
      if (!stored?.trim()) {
        setLibrary({});
        return;
      }

      const parsedLibrary = JSON.parse(stored);
      const cleanedLibrary = cleanLibrary(parsedLibrary);
      
      if (Object.keys(cleanedLibrary).length !== Object.keys(parsedLibrary).length) {
        localStorage.setItem(getStorageKey(user), JSON.stringify(cleanedLibrary));
      }
      setLibrary(cleanedLibrary);
    } catch (error) {
      console.error('Failed to load user library:', error);
      setLibrary({});
    }
  }, [user, isAuthenticated]);

  // Clean and save library to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated || !user || !library || Object.keys(library).length === 0) return;

    try {
      const cleanedLibrary = cleanLibrary(library);
      const cleanedKeys = Object.keys(cleanedLibrary).sort();
      const currentKeys = Object.keys(library).sort();
      
      // Only update state if keys changed (avoid infinite loops)
      if (JSON.stringify(cleanedKeys) !== JSON.stringify(currentKeys)) {
        setLibrary(cleanedLibrary);
      }
      
      // Always save cleaned library to localStorage
      localStorage.setItem(getStorageKey(user), JSON.stringify(cleanedLibrary));
    } catch (error) {
      console.error('[UserLibrary] Failed to save user library:', error);
    }
  }, [library, user, isAuthenticated]);

  const updateBook = useCallback((book, updates) => {
    if (!isAuthenticated) return false;
    setLibrary(prev => ({
      ...prev,
      [book.isbn]: {
        ...(prev[book.isbn] || {}),
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        genre: book.genre,
        ...updates
      }
    }));
    return true;
  }, [isAuthenticated]);

  const saveBook = useCallback((book) => {
    return updateBook(book, { saved: true, savedAt: new Date().toISOString() });
  }, [updateBook]);

  const removeBookStatus = useCallback((isbn, updates) => {
    if (!isAuthenticated) return false;
    setLibrary(prev => {
      const updated = { ...prev };
      if (updated[isbn]) {
        updated[isbn] = { ...updated[isbn], ...updates };
        if (!hasValidStatus(updated[isbn])) {
          delete updated[isbn];
        }
      }
      return updated;
    });
    return true;
  }, [isAuthenticated]);

  const unsaveBook = useCallback((isbn) => {
    return removeBookStatus(isbn, { saved: false });
  }, [removeBookStatus]);

  const favoriteBook = useCallback((book) => {
    return updateBook(book, { favorite: true, favoritedAt: new Date().toISOString() });
  }, [updateBook]);

  const unfavoriteBook = useCallback((isbn) => {
    return removeBookStatus(isbn, { favorite: false });
  }, [removeBookStatus]);

  const rateBook = useCallback((book, rating) => {
    return updateBook(book, {
      rated: true,
      rating,
      ratingLabel: getRatingLabel(rating),
      ratedAt: new Date().toISOString()
    });
  }, [updateBook]);

  const unrateBook = useCallback((isbn) => {
    return removeBookStatus(isbn, { rated: false, rating: null, ratingLabel: '—' });
  }, [removeBookStatus]);

  const reviewBook = useCallback((book, review) => {
    return updateBook(book, {
      reviewed: true,
      review,
      reviewedAt: new Date().toISOString()
    });
  }, [updateBook]);

  const unreviewBook = useCallback((isbn) => {
    return removeBookStatus(isbn, { reviewed: false, review: undefined });
  }, [removeBookStatus]);

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
    if (!library || typeof library !== 'object') return [];
    return Object.values(library).filter(hasValidStatus);
  }, [library]);

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

function getRatingLabel(rating) {
  if (!rating || rating === 0) return '—';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return '★'.repeat(fullStars) + (hasHalfStar ? '★' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
}

