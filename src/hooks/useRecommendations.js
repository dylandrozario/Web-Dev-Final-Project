import { useEffect, useState } from 'react';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useRecommendationBooks } from '../context/RecommendationBooksContext';
import { generateTieredRecommendations } from '../engine/recommendationEngine';

const PROBLEMATIC_ISBNS = ['OLOL265415W'];
const PROBLEMATIC_TITLES = ['At Bertram\'s Hotel'];

const hasValidInteraction = (book) => {
  if (!book?.isbn) return false;
  return book.saved === true ||
         book.favorite === true ||
         (book.rated === true && book.rating > 0) ||
         (book.reviewed === true && book.review?.trim());
};

const isValidBook = (book) => {
  if (!book?.isbn) return false;
  if (PROBLEMATIC_TITLES.some(title => book.title?.includes(title)) || PROBLEMATIC_ISBNS.includes(book.isbn)) {
    return false;
  }
  return (book.genre?.trim()) || (book.author?.trim());
};

export default function useRecommendations(batchSize = 750) {
  const { library } = useUserLibrary();
  const { books: allBooks } = useRecommendationBooks();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const currentLibrary = library && typeof library === 'object' ? library : {};
    const userBooks = Object.values(currentLibrary).filter(hasValidInteraction);

    if (!userBooks.length || !allBooks?.length) {
      setRecommendations([]);
      return;
    }

    try {
      const validatedUserBooks = userBooks.filter(isValidBook);
      
      if (!validatedUserBooks.length) {
        setRecommendations([]);
        return;
      }
      
      setRecommendations(generateTieredRecommendations(validatedUserBooks, allBooks, batchSize));
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setRecommendations([]);
    }
  }, [library, allBooks, batchSize]);

  return recommendations;
}