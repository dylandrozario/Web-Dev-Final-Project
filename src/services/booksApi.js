import { fetchBooksFromOpenLibrary } from './openLibraryApi'
import { enhanceBookWithGoogleDescription } from './googleBooksApi'

export async function fetchBooksCatalog(limit = 100, options = {}) {
  try {
    const { skipDescriptionEnhancement = false } = options;
    const books = await fetchBooksFromOpenLibrary(limit);
    
    // Enhance with descriptions if requested
    let processedBooks = books;
    if (!skipDescriptionEnhancement) {
      const batchSize = 10;
      const enhancedBooks = [];
      
      for (let i = 0; i < books.length; i += batchSize) {
        const batch = books.slice(i, i + batchSize);
        const enhancedBatch = await Promise.all(
          batch.map(book => enhanceBookWithGoogleDescription(book))
        );
        enhancedBooks.push(...enhancedBatch);
        
        // Small delay between batches for rate limiting
        if (i + batchSize < books.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      processedBooks = enhancedBooks;
    }
    
    return processedBooks.map(book => ({
      ...book,
      id: book.id || book.isbn,
      pages: book.pages || null,
      publisher: book.publisher || null,
      language: book.language || 'English',
      description: book.description || '',
      readTimeMinutes: book.pages ? Math.round(book.pages * 1.25) : null
    }));
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return [];
  }
}

export default fetchBooksCatalog

