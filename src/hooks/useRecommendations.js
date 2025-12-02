import { useEffect, useState } from 'react';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useRecommendationBooks } from '../context/RecommendationBooksContext';
import { generateTieredRecommendations } from '../engine/recommendationEngine';
import { removeStorageItem } from '../utils/storageUtils';

const CACHE_PREFIX = 'bc_user_recommendations';

export default function useRecommendations(batchSize = 750) {
  const { library } = useUserLibrary();
  const { books: allBooks } = useRecommendationBooks();

  const userKey = library?.uid || library?.email || 'guest';
  const cacheKey = `${CACHE_PREFIX}_${userKey}`;

  const [recommendations, setRecommendations] = useState([]);

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
    // Always get fresh user books data directly from library state
    const currentLibrary = library && typeof library === 'object' ? library : {};
    
      // Get user books directly from library to ensure fresh data
      // STRICT: ONLY use books that the user has actually interacted with (saved, favorited, rated, reviewed)
      const userBooks = Object.values(currentLibrary).filter(book => {
        if (!book || !book.isbn) return false
        
        // Must have at least one valid interaction
        const isSaved = book.saved === true
        const isFavorite = book.favorite === true
        const isRated = book.rated === true && book.rating !== undefined && book.rating !== null && Number(book.rating) > 0
        const isReviewed = book.reviewed === true && book.review && typeof book.review === 'string' && book.review.trim().length > 0
        
        return isSaved || isFavorite || isRated || isReviewed
      });

    // STRICT: If user has NO books in their library, return NO recommendations
    // Do not use any fallback or sample data
    if (!userBooks || userBooks.length === 0) {
      setRecommendations([]);
      return;
    }

    // Also check if allBooks is available
    if (!allBooks || allBooks.length === 0) {
      setRecommendations([]);
      return;
    }

    // Generate new recommendations immediately with fresh data - NO CACHING
    // ONLY use user's actual library data, no sample/mock data
    try {
      // Known problematic books that should be excluded from recommendations
      // Note: "The Invisible Man" and "Мастер и Маргарита" are now allowed
      const problematicBookTitles = ['At Bertram\'s Hotel'];
      const problematicISBNs = ['OLOL265415W'];
      
      // Filter out problematic books and ensure books have genre/author for matching
      const validatedUserBooks = userBooks.filter(book => {
        if (!book || !book.isbn) return false;
        
        // Exclude problematic books (only "At Bertram's Hotel" now)
        const isProblematic = problematicBookTitles.some(title => book.title && book.title.includes(title)) ||
                              problematicISBNs.includes(book.isbn);
        if (isProblematic) return false;
        
        // Must have genre or author for matching
        const hasGenre = book.genre && typeof book.genre === 'string' && book.genre.trim().length > 0;
        const hasAuthor = book.author && typeof book.author === 'string' && book.author.trim().length > 0;
        return hasGenre || hasAuthor;
      });
      
      if (validatedUserBooks.length === 0) {
        setRecommendations([]);
        return;
      }
      
      const newBatch = generateTieredRecommendations(validatedUserBooks, allBooks, batchSize);
      
      // Update state immediately
      setRecommendations(newBatch);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setRecommendations([]);
    }
  }, [library, librarySerialized, allBooks, batchSize]);

  return recommendations
}