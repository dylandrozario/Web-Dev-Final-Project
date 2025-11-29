/**
 * Natural Language Search using Fuse.js
 * Provides fuzzy keyword search across title, author, genre, and description
 */

import Fuse from 'fuse.js'

// Global search index (initialized once)
let fuse = null
let booksData = []

/**
 * Initialize the search index with books data
 * @param {Array} books - Array of book objects
 */
export function initializeSearchIndex(books) {
  if (fuse && booksData.length === books.length) {
    // Index already initialized with same data
    return
  }

  booksData = books
  
  // Configure Fuse.js with searchable fields and options
  // Lower threshold = more strict, higher threshold = more lenient
  const fuseOptions = {
    keys: [
      {
        name: 'description',
        weight: 0.4 // Highest weight for description/summary
      },
      {
        name: 'title',
        weight: 0.3
      },
      {
        name: 'author',
        weight: 0.2
      },
      {
        name: 'genre',
        weight: 0.1
      }
    ],
    threshold: 0.4, // More strict - 0.0 = perfect match, 1.0 = match anything (0.4 = good matches only)
    includeScore: true,
    minMatchCharLength: 2, // Require at least 2 characters
    ignoreLocation: true, // Search anywhere in the text
    findAllMatches: true,
    shouldSort: true,
    useExtendedSearch: false // Keep simple for now
  }

  // Create Fuse instance
  fuse = new Fuse(books, fuseOptions)
}

/**
 * Perform natural language search
 * @param {string} query - Search query
 * @param {Array} books - Array of all books (for fallback)
 * @returns {Array} Array of matched book objects sorted by relevance
 */
export function naturalLanguageSearch(query, books) {
  if (!query || query.trim().length === 0) {
    return []
  }

  // Initialize index if not already done
  if (!fuse) {
    initializeSearchIndex(books)
  } else if (booksData.length !== books.length) {
    // Reinitialize if books changed
    initializeSearchIndex(books)
  }

  const trimmedQuery = query.trim()
  
  // For very short queries (1-2 chars), use simple matching
  if (trimmedQuery.length <= 2) {
    const lowerQuery = trimmedQuery.toLowerCase()
    return books.filter(book => 
      book.title?.toLowerCase().includes(lowerQuery) ||
      book.author?.toLowerCase().includes(lowerQuery) ||
      book.isbn?.includes(trimmedQuery)
    )
  }

  try {
    // Perform Fuse.js search
    const results = fuse.search(trimmedQuery, {
      limit: 50
    })

    // Filter results by relevance score
    // Fuse.js scores: 0 = perfect match, 1 = no match
    // Be more lenient with description-based matches (score <= 0.6)
    const goodMatches = results
      .filter(result => result.score <= 0.6) // More lenient to allow description matches
      .map(result => result.item)
    
    // If we have good matches, return them
    if (goodMatches.length > 0) {
      return goodMatches
    }
    
    // If no good Fuse results, try simple search as fallback
    return simpleSearch(trimmedQuery, books)
  } catch (error) {
    console.error('Error in natural language search:', error)
    // Fallback to simple search
    return simpleSearch(trimmedQuery, books)
  }
}

/**
 * Simple search fallback with enhanced matching
 * @param {string} query - Search query
 * @param {Array} books - Array of books
 * @returns {Array} Filtered books
 */
function simpleSearch(query, books) {
  const lowerQuery = query.toLowerCase().trim()
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0)
  
  // Genre/keyword mappings for better matching
  const genreKeywords = {
    'romance': ['romance', 'romantic', 'love', 'dating'],
    'fantasy': ['fantasy', 'magic', 'wizard', 'dragon', 'tolkien', 'hobbit', 'ring', 'lord'],
    'fiction': ['fiction', 'novel', 'story', 'classic', 'literature'],
    'dystopian': ['dystopian', 'dystopia', 'orwell', '1984', 'totalitarian', 'future'],
    'mystery': ['mystery', 'thriller', 'suspense', 'detective'],
    'adventure': ['adventure', 'journey', 'quest', 'travel']
  }
  
  // Check if query matches any genre keywords
  const matchedGenres = []
  Object.keys(genreKeywords).forEach(genre => {
    if (genreKeywords[genre].some(keyword => lowerQuery.includes(keyword))) {
      matchedGenres.push(genre.toLowerCase())
    }
  })
  
  return books.filter(book => {
    const title = (book.title || '').toLowerCase()
    const author = (book.author || '').toLowerCase()
    const genre = (book.genre || '').toLowerCase()
    const description = (book.description || '').toLowerCase()
    const publisher = (book.publisher || '').toLowerCase()
    const searchableText = `${title} ${author} ${genre} ${description} ${publisher}`.toLowerCase()
    
    // Check genre keyword matches first (strict matching)
    if (matchedGenres.length > 0) {
      // Only return books that match the genre exactly
      return matchedGenres.includes(genre)
    }
    
    // For single word queries, check if it appears anywhere including description
    if (queryWords.length === 1) {
      const word = queryWords[0]
      // Check all fields including description (description is now primary)
      return title.includes(word) || 
             author.includes(word) || 
             genre.includes(word) ||
             description.includes(word) ||
             (word.length >= 3 && searchableText.includes(word))
    } else {
      // Multiple words: ALL words must appear somewhere (AND logic)
      // Description is now a primary field, so check it first
      const allWordsMatch = queryWords.every(word => {
        // Check description first (primary search field)
        if (description.includes(word)) {
          return true
        }
        // Then check other fields
        if (title.includes(word) || author.includes(word) || genre.includes(word)) {
          return true
        }
        // Check publisher for longer words
        if (word.length >= 4 && publisher.includes(word)) {
          return true
        }
        return false
      })
      
      // At least one word should match in description, title, author, or genre
      const hasRelevantMatch = queryWords.some(word => 
        description.includes(word) ||
        title.includes(word) || 
        author.includes(word) || 
        genre.includes(word)
      )
      
      return allWordsMatch && hasRelevantMatch
    }
  })
}

/**
 * Determine if query should use natural language search
 * @param {string} query - Search query
 * @returns {boolean} True if should use NL search
 */
export function shouldUseNLSearch(query) {
  if (!query || query.trim().length === 0) return false
  
  const trimmed = query.trim()
  const wordCount = trimmed.split(/\s+/).length
  
  // Always use NL search for queries longer than 2 characters
  // This ensures Fuse.js fuzzy matching is used for better results
  return trimmed.length > 2
}
