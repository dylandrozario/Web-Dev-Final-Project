// Books API Service - Fetches books from Open Library API
import { fetchBooksFromOpenLibrary } from './openLibraryApi'

/**
 * Fetches books catalog from Open Library API
 * @returns {Promise<Array>} Array of book objects
 */
export async function fetchBooksCatalog() {
  try {
    const books = await fetchBooksFromOpenLibrary(50)
    
    // Return books with all required fields matching the expected format
    return books.map(book => ({
      ...book,
      id: book.id || book.isbn,
      pages: book.pages || null,
      publisher: book.publisher || null,
      language: book.language || 'English',
      description: book.description || null,
      readTimeMinutes: book.pages ? Math.round(book.pages * 1.25) : null
    }))
  } catch (error) {
    console.error('Failed to fetch books from Open Library:', error)
    // Return empty array on error
    return []
  }
}

export default fetchBooksCatalog

