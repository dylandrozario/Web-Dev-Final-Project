/**
 * Google Books API service for fetching better book descriptions
 * Google Books API provides high-quality descriptions and doesn't require an API key for basic usage
 * Rate limit: 1000 requests per day per user (IP-based)
 */

/**
 * Fetch book description from Google Books API
 * @param {Object} params - Search parameters
 * @param {string} [params.isbn] - ISBN of the book
 * @param {string} [params.title] - Book title
 * @param {string} [params.author] - Book author
 * @returns {Promise<string|null>} Book description or null if not found
 */
const fetchDescription = async ({ isbn, title, author }) => {
  if (!isbn && !title) return null;

  try {
    let query;
    if (isbn) {
      const cleanIsbn = isbn.replace(/-/g, '');
      query = `isbn:${cleanIsbn}`;
    } else {
      query = `intitle:${encodeURIComponent(title)}`;
      if (author) {
        query += `+inauthor:${encodeURIComponent(author)}`;
      }
    }
    
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const description = data.items?.[0]?.volumeInfo?.description;
    
    return description?.trim() || null;
  } catch (error) {
    console.warn('Error fetching description from Google Books:', error);
    return null;
  }
};

/**
 * Fetch book description from Google Books API by ISBN
 */
export const fetchBookDescriptionFromGoogle = async (isbn) => {
  return fetchDescription({ isbn });
};

/**
 * Fetch book description from Google Books API by title and author
 */
export const fetchBookDescriptionByTitleAuthor = async (title, author) => {
  return fetchDescription({ title, author });
};

/**
 * Enhance book with description from Google Books API
 * @param {Object} book - Book object with isbn, title, author
 * @returns {Promise<Object>} Book object with enhanced description
 */
export const enhanceBookWithGoogleDescription = async (book) => {
  if (!book) return book;
  
  const { cleanBookDescription } = await import('../utils/bookUtils');
  
  // Check if book already has a valid description
  if (book.description) {
    const cleaned = cleanBookDescription(book.description);
    if (cleaned?.length > 50) return book;
  }
  
  // Try ISBN first, then title/author
  let description = book.isbn 
    ? await fetchBookDescriptionFromGoogle(book.isbn)
    : null;
  
  if (!description && book.title) {
    description = await fetchBookDescriptionByTitleAuthor(book.title, book.author);
  }
  
  // Clean and validate description
  if (description) {
    const cleaned = cleanBookDescription(description);
    if (cleaned?.length > 50) {
      return { ...book, description: cleaned };
    }
  }
  
  return book;
};

