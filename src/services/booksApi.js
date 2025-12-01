import { fetchBooksFromOpenLibrary } from './openLibraryApi'
import { enhanceBookWithGoogleDescription } from './googleBooksApi'

export async function fetchBooksCatalog(limit=100) {
  try {
    const books = await fetchBooksFromOpenLibrary(limit)
    
    // Enhance books with descriptions from Google Books API
    // Fetch descriptions in batches to avoid overwhelming the API
    const enhancedBooks = []
    const batchSize = 10 // Process 10 books at a time
    
    for (let i = 0; i < books.length; i += batchSize) {
      const batch = books.slice(i, i + batchSize)
      const enhancedBatch = await Promise.all(
        batch.map(book => enhanceBookWithGoogleDescription(book))
      )
      enhancedBooks.push(...enhancedBatch)
      
      // Small delay between batches to be respectful of API rate limits
      if (i + batchSize < books.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return enhancedBooks.map(book => ({
      ...book,
      id: book.id || book.isbn,
      pages: book.pages || null,
      publisher: book.publisher || null,
      language: book.language || 'English',
      description: book.description || '', // force to string for Fuse.js
      readTimeMinutes: book.pages ? Math.round(book.pages * 1.25) : null
    }))
  } catch (error) {
    console.error('Failed to fetch books from Open Library:', error)
    return []
  }
}

export default fetchBooksCatalog

