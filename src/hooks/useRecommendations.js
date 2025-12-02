import { useEffect, useState, useRef } from 'react';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useRecommendationBooks } from '../context/RecommendationBooksContext';
import { generateTieredRecommendations } from '../engine/recommendationEngine';
import { removeStorageItem } from '../utils/storageUtils';

const CACHE_PREFIX = 'bc_user_recommendations';

export default function useRecommendations(batchSize = 750) {
  const { getAllBooks, library } = useUserLibrary();
  const { books: allBooks } = useRecommendationBooks();

  const userKey = library?.uid || library?.email || 'guest';
  const cacheKey = `${CACHE_PREFIX}_${userKey}`;

  const [recommendations, setRecommendations] = useState([]);
  const lastLibraryHash = useRef(null);

  // Create a stable hash of the user's library that includes all relevant data
  const createLibraryHash = (books) => {
    if (!books || books.length === 0) return 'empty';
    // Include ISBN, saved, favorite, rating (with precision), and reviewed status to detect any changes
    // Use toFixed(1) for rating to ensure consistent hashing
    return books
      .map(b => {
        const rating = b.rated && b.rating !== undefined && b.rating !== null 
          ? `r${Number(b.rating).toFixed(1)}` 
          : '';
        const reviewed = b.reviewed ? 'v' : '';
        return `${b.isbn}:${b.saved ? 's' : ''}${b.favorite ? 'f' : ''}${rating}${reviewed}`;
      })
      .sort()
      .join(',');
  };

  // Clear any existing cache on mount
  useEffect(() => {
    removeStorageItem(cacheKey);
  }, [cacheKey]);

  // Create a serialized version of library for reliable change detection
  // This ensures React detects changes even if object reference is similar
  const librarySerialized = library && typeof library === 'object' 
    ? JSON.stringify(Object.keys(library).sort().map(isbn => {
        const book = library[isbn];
        return {
          isbn,
          saved: book?.saved || false,
          favorite: book?.favorite || false,
          rated: book?.rated || false,
          rating: book?.rating || null,
          reviewed: book?.reviewed || false
        };
      }))
    : '';

  // Regenerate recommendations whenever library or allBooks change - NO CACHING
  useEffect(() => {
    // Always get fresh user books data directly from library state FIRST
    // Don't rely on getAllBooks callback which might have stale closure
    const currentLibrary = library && typeof library === 'object' ? library : {};
    
    // Log full library state for debugging
    console.log('[Recommendations] ===== FULL LIBRARY STATE =====');
    console.log('[Recommendations] Total books in library object:', Object.keys(currentLibrary).length);
    console.log('[Recommendations] All library books:', Object.values(currentLibrary).map(book => ({
      isbn: book?.isbn,
      title: book?.title,
      saved: book?.saved,
      favorite: book?.favorite,
      rated: book?.rated,
      rating: book?.rating,
      reviewed: book?.reviewed,
      genre: book?.genre
    })));
    
    // Get user books directly from library to ensure fresh data
    // STRICT: ONLY use books that the user has actually interacted with (saved, favorited, rated, reviewed)
    // Also ensure books have required fields (isbn, title, author, genre) for proper matching
    const userBooks = Object.values(currentLibrary).filter(book => {
      if (!book || !book.isbn) return false
      
      // STRICT: Must have at least one valid interaction with explicit true values
      const isSaved = book.saved === true
      const isFavorite = book.favorite === true
      const isRated = book.rated === true && book.rating !== undefined && book.rating !== null && Number(book.rating) > 0
      const isReviewed = book.reviewed === true && book.review && typeof book.review === 'string' && book.review.trim().length > 0
      
      // Log books that are being filtered out
      if (!(isSaved || isFavorite || isRated || isReviewed)) {
        // Check for specific problematic books
        const problematicTitles = ['The Invisible Man', 'At Bertram\'s Hotel', 'Мастер и Маргарита'];
        if (problematicTitles.some(title => book.title && book.title.includes(title))) {
          console.warn('[Recommendations] Filtering out problematic book (no valid status):', {
            isbn: book.isbn,
            title: book.title,
            saved: book.saved,
            favorite: book.favorite,
            rated: book.rated,
            rating: book.rating,
            reviewed: book.reviewed,
            hasReview: !!(book.review && book.review.trim().length > 0),
            fullBook: book
          });
        }
        return false
      }
      
      // Must have genre or author for matching (at least one is required for recommendations)
      const hasGenre = book.genre && typeof book.genre === 'string' && book.genre.trim().length > 0
      const hasAuthor = book.author && typeof book.author === 'string' && book.author.trim().length > 0
      
      // Only include books that can be used for matching (have genre or author)
      return hasGenre || hasAuthor
    });

    // STRICT: If user has NO books in their library, return NO recommendations
    // Do not use any fallback or sample data
    if (!userBooks || userBooks.length === 0) {
      setRecommendations([]);
      lastLibraryHash.current = {
        hash: 'empty',
        libraryKeys: ''
      };
      return;
    }

    // Also check if allBooks is available
    if (!allBooks || allBooks.length === 0) {
      setRecommendations([]);
      return;
    }

    const libraryKeys = Object.keys(currentLibrary).sort().join(',');
    const currentHash = createLibraryHash(userBooks);

    // Always regenerate when librarySerialized changes (this effect runs)
    // The serialized library will change whenever books are added/removed or status changes
    // This is more reliable than hash comparison

    // Generate new recommendations immediately with fresh data - NO CACHING
    // ONLY use user's actual library data, no sample/mock data
    try {
      // STRICT: Validate userBooks one more time before passing to recommendation engine
      // Ensure each book has valid status and required fields
      const validatedUserBooks = userBooks.filter(book => {
        if (!book || !book.isbn) return false;
        
        // Must have at least one valid interaction
        const isSaved = book.saved === true;
        const isFavorite = book.favorite === true;
        const isRated = book.rated === true && book.rating !== undefined && book.rating !== null && book.rating > 0;
        const isReviewed = book.reviewed === true && book.review && book.review.trim().length > 0;
        
        if (!(isSaved || isFavorite || isRated || isReviewed)) return false;
        
        // Must have genre or author for matching
        const hasGenre = book.genre && book.genre.trim().length > 0;
        const hasAuthor = book.author && book.author.trim().length > 0;
        
        return hasGenre || hasAuthor;
      });
      
      // If no validated books, return empty recommendations
      if (validatedUserBooks.length === 0) {
        console.log('[Recommendations] No validated user books found');
        setRecommendations([]);
        return;
      }
      
      // STRICT: Filter out any books that don't have explicit valid status
      // Double-check each book to ensure it's actually in user's library with valid interaction
      // Also explicitly exclude known problematic books if they don't have valid status
      const problematicBookTitles = ['The Invisible Man', 'At Bertram\'s Hotel', 'Мастер и Маргарита'];
      const problematicISBNs = ['OLOL52266W', 'OLOL265415W', 'OLOL676009W'];
      
      const strictlyValidatedBooks = validatedUserBooks.filter(book => {
        // Must have explicit true values, not just truthy values
        const isSaved = book.saved === true;
        const isFavorite = book.favorite === true;
        const isRated = book.rated === true && book.rating !== undefined && book.rating !== null && Number(book.rating) > 0;
        const isReviewed = book.reviewed === true && book.review && typeof book.review === 'string' && book.review.trim().length > 0;
        
        const hasValidStatus = isSaved || isFavorite || isRated || isReviewed;
        
        // STRICT: Explicitly exclude problematic books if they don't have valid status
        const isProblematicBook = problematicBookTitles.some(title => book.title && book.title.includes(title)) ||
                                  problematicISBNs.includes(book.isbn);
        
        if (isProblematicBook && !hasValidStatus) {
          console.warn('[Recommendations] EXCLUDING problematic book (no valid status):', {
            isbn: book.isbn,
            title: book.title,
            saved: book.saved,
            favorite: book.favorite,
            rated: book.rated,
            rating: book.rating,
            reviewed: book.reviewed,
            hasReview: !!(book.review && book.review.trim().length > 0),
            fullBook: book
          });
          return false;
        }
        
        // Log if we're filtering out any book
        if (!hasValidStatus) {
          console.warn('[Recommendations] Filtering out book (no valid status):', {
            isbn: book.isbn,
            title: book.title,
            saved: book.saved,
            favorite: book.favorite,
            rated: book.rated,
            rating: book.rating,
            reviewed: book.reviewed,
            hasReview: !!(book.review && book.review.trim().length > 0)
          });
        }
        
        return hasValidStatus;
      });
      
      // If no strictly validated books, return empty recommendations
      if (strictlyValidatedBooks.length === 0) {
        console.log('[Recommendations] No strictly validated user books found after double-check');
        setRecommendations([]);
        return;
      }
      
      // Log what user books are being used for recommendations
      console.log('[Recommendations] ===== USER LIBRARY DATA =====');
      console.log('[Recommendations] Total strictly validated user books:', strictlyValidatedBooks.length);
      console.log('[Recommendations] User books details:', strictlyValidatedBooks.map(book => ({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        genre: book.genre,
        saved: book.saved,
        favorite: book.favorite,
        rated: book.rated,
        rating: book.rating,
        reviewed: book.reviewed,
        hasReview: !!(book.review && book.review.trim().length > 0)
      })));
      
      // Log genres found in user's library
      const userGenres = [...new Set(strictlyValidatedBooks.map(b => b.genre).filter(Boolean))];
      console.log('[Recommendations] Genres in user library:', userGenres);
      
      // Log authors found in user's library
      const userAuthors = [...new Set(strictlyValidatedBooks.map(b => b.author).filter(Boolean))];
      console.log('[Recommendations] Authors in user library:', userAuthors);
      
      console.log('[Recommendations] Available candidate books:', allBooks.length);
      
      // Use the strictly validated userBooks - this ensures we ONLY use the user's actual saved/favorited/rated/reviewed books
      const newBatch = generateTieredRecommendations(strictlyValidatedBooks, allBooks, batchSize);
      
      console.log('[Recommendations] ===== RECOMMENDATIONS GENERATED =====');
      console.log('[Recommendations] Total recommendations:', newBatch.length);
      if (newBatch.length > 0) {
        console.log('[Recommendations] Sample recommendations:', newBatch.slice(0, 5).map(book => ({
          title: book.title,
          author: book.author,
          genre: book.genre,
          score: book.score,
          reasons: book.recommendationReasons?.map(r => r.message) || []
        })));
      }

      // Update state immediately
      setRecommendations(newBatch);

      // Update hash to current state (store both hash and library keys for change detection)
      lastLibraryHash.current = {
        hash: currentHash,
        libraryKeys: libraryKeys
      };
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setRecommendations([]);
    }
  }, [library, librarySerialized, allBooks, batchSize]);

  return recommendations
}