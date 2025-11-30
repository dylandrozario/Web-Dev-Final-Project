import { useEffect, useState, useRef } from 'react';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useRecommendationBooks } from '../context/RecommendationBooksContext';
import { generateTieredRecommendations } from '../engine/recommendationEngine';

const CACHE_PREFIX = 'bc_user_recommendations';

export default function useRecommendations(batchSize = 300) {
  const { getAllBooks, library } = useUserLibrary();
  const { books: allBooks } = useRecommendationBooks();

  const userKey = library?.uid || library?.email || 'guest';
  const cacheKey = `${CACHE_PREFIX}_${userKey}`;

  const [recommendations, setRecommendations] = useState([]);
  const lastLibraryHash = useRef(null);

  // Create a stable hash of the user's library
  const createLibraryHash = (books) => {
    if (!books || books.length === 0) return 'empty';
    return books.map(b => b.id).sort().join(',');
  };

  // Load from cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          setRecommendations(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load cached recommendations:', err);
    }
  }, [cacheKey]);

  // Regenerate recommendations only when library actually changes
  useEffect(() => {
    if (!allBooks || allBooks.length === 0) return;

    const userBooks = getAllBooks();
    const currentHash = createLibraryHash(userBooks);

    // Only regenerate if library actually changed
    if (currentHash === lastLibraryHash.current) return;

    try {
      const newBatch = generateTieredRecommendations(userBooks, allBooks, batchSize);

      // Update state
      setRecommendations(newBatch);

      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify(newBatch));

      // Update hash
      lastLibraryHash.current = currentHash;
    } catch (err) {
      console.error('Error generating recommendations:', err);
    }
  }, [library, allBooks, batchSize, cacheKey, getAllBooks]);

  return recommendations
}