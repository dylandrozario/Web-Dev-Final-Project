import { fetchBooksFromOpenLibrary } from './openLibraryApi'

export async function fetchBooksCatalog(limit=100) {
  try {
    const books = await fetchBooksFromOpenLibrary(limit)
    
    return books.map(book => ({
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

