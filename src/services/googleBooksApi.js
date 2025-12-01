/**
 * Google Books API service for fetching better book descriptions
 * Google Books API provides high-quality descriptions and doesn't require an API key for basic usage
 * Rate limit: 1000 requests per day per user (IP-based)
 */

/**
 * Fetch book description from Google Books API by ISBN
 * @param {string} isbn - ISBN of the book (with or without dashes)
 * @returns {Promise<string|null>} Book description or null if not found
 */
export const fetchBookDescriptionFromGoogle = async (isbn) => {
  if (!isbn) return null;

  try {
    // Clean ISBN (remove dashes)
    const cleanIsbn = isbn.replace(/-/g, '');
    
    // Search Google Books API by ISBN
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&maxResults=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Google Books API error for ISBN ${isbn}:`, response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    const volumeInfo = data.items[0].volumeInfo;
    
    // Google Books provides description in volumeInfo.description
    // This is usually a high-quality publisher description, not just first sentence
    if (volumeInfo.description) {
      return volumeInfo.description.trim();
    }
    
    return null;
  } catch (error) {
    // Silently fail - don't break the app if Google Books API is unavailable
    console.warn(`Error fetching description from Google Books for ISBN ${isbn}:`, error);
    return null;
  }
};

/**
 * Fetch book description from Google Books API by title and author
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @returns {Promise<string|null>} Book description or null if not found
 */
export const fetchBookDescriptionByTitleAuthor = async (title, author) => {
  if (!title) return null;

  try {
    // Build search query
    let query = `intitle:${encodeURIComponent(title)}`;
    if (author) {
      query += `+inauthor:${encodeURIComponent(author)}`;
    }
    
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    const volumeInfo = data.items[0].volumeInfo;
    
    if (volumeInfo.description) {
      return volumeInfo.description.trim();
    }
    
    return null;
  } catch (error) {
    console.warn(`Error fetching description from Google Books for "${title}":`, error);
    return null;
  }
};

/**
 * Enhance book with description from Google Books API
 * @param {Object} book - Book object with isbn, title, author
 * @returns {Promise<Object>} Book object with enhanced description
 */
export const enhanceBookWithGoogleDescription = async (book) => {
  if (!book) return book;
  
  // If book already has a valid description, keep it
  if (book.description && book.description.trim().length > 50) {
    return book;
  }
  
  // Try to fetch from Google Books by ISBN first
  let description = null;
  if (book.isbn) {
    description = await fetchBookDescriptionFromGoogle(book.isbn);
  }
  
  // If not found by ISBN, try by title and author
  if (!description && book.title) {
    description = await fetchBookDescriptionByTitleAuthor(book.title, book.author);
  }
  
  // If we got a description, use it (it will be cleaned by cleanBookDescription)
  if (description) {
    return {
      ...book,
      description: description
    };
  }
  
  return book;
};

