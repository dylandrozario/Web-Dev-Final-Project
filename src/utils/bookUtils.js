// Utility functions for book-related operations

import APP_CONFIG from '../config/constants'

/**
 * Format date to readable string
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {Object} options - Date formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = { month: 'long', year: 'numeric' }) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', options)
}

/**
 * Calculate read time in minutes
 * @param {number} pages - Number of pages (optional, uses default if not provided)
 * @returns {number} Read time in minutes
 */
export const calculateReadTime = (pages = APP_CONFIG.DEFAULT_ESTIMATED_PAGES) => {
  return Math.round(pages * (APP_CONFIG.AVERAGE_WORDS_PER_PAGE / APP_CONFIG.WORDS_PER_MINUTE))
}

/**
 * Clean and validate book description
 * @param {string} description - Raw description text
 * @returns {string|null} Cleaned description or null if invalid
 */
export const cleanBookDescription = (description) => {
  if (!description || typeof description !== 'string') return null
  
  // Remove extra whitespace and normalize
  let cleaned = description.trim().replace(/\s+/g, ' ')
  
  // Check if description is too short (likely incomplete or random words)
  if (cleaned.length < 50) return null
  
  // Split into sentences (by periods, exclamation marks, question marks)
  const sentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0)
  
  // Remove duplicate sentences (case-insensitive comparison)
  const uniqueSentences = []
  const seenSentences = new Set()
  
  for (const sentence of sentences) {
    // Normalize sentence for comparison (lowercase, remove extra spaces)
    const normalized = sentence.toLowerCase().replace(/\s+/g, ' ').trim()
    
    // Skip if we've seen this sentence before
    if (normalized.length > 0 && !seenSentences.has(normalized)) {
      seenSentences.add(normalized)
      uniqueSentences.push(sentence)
    }
  }
  
  // Rejoin sentences with periods
  cleaned = uniqueSentences.join('. ').trim()
  
  // If we removed too many sentences (more than 50% were duplicates), it's likely invalid
  if (sentences.length > 2 && uniqueSentences.length < sentences.length * 0.5) {
    return null
  }
  
  // Check if description is still substantial after deduplication
  if (cleaned.length < 50) return null
  
  // Check for repetitive patterns (same word repeated many times)
  const words = cleaned.toLowerCase().split(/\s+/)
  const wordCounts = {}
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })
  
  // If any word appears more than 30% of the time, it's likely repetitive
  const maxCount = Math.max(...Object.values(wordCounts))
  if (maxCount > words.length * 0.3) return null
  
  // Check for common meaningless patterns
  const meaninglessPatterns = [
    /^[a-z]\s+[a-z]\s+[a-z]/i, // Single letters separated
    /^(the|a|an)\s+(the|a|an)\s+(the|a|an)/i, // Repetitive articles
  ]
  
  if (meaninglessPatterns.some(pattern => pattern.test(cleaned))) return null
  
  return cleaned
}

/**
 * Generate varied book description template based on genre
 * @param {Object} book - Book object with title, author, genre
 * @returns {string} Generated description
 */
export const generateBookDescription = (book) => {
  const genre = (book.genre || 'Fiction').toLowerCase()
  const title = book.title || 'This book'
  const author = book.author || 'the author'
  
  // Create genre-specific descriptions to avoid repetition
  const genreDescriptions = {
    fiction: `${title} by ${author} is a compelling work of fiction that delves into the complexities of human relationships and society. Through rich character development and engaging narrative, this novel offers readers a thought-provoking exploration of contemporary themes and timeless questions about life, love, and the human condition.`,
    romance: `${title} tells a captivating love story by ${author}, weaving together themes of passion, heartbreak, and the transformative power of relationships. This romantic tale explores the challenges and triumphs of finding true connection, making it a memorable addition to the romance genre.`,
    fantasy: `${title} by ${author} transports readers to an imaginative world filled with magic, adventure, and extraordinary characters. This fantasy work combines intricate world-building with compelling storytelling, creating an immersive experience that explores themes of heroism, destiny, and the battle between light and darkness.`,
    science: `${title} by ${author} presents a fascinating exploration of scientific concepts and discoveries. This work makes complex ideas accessible while maintaining scientific accuracy, offering readers insights into the wonders of the natural world and the methods we use to understand it.`,
    history: `${title} by ${author} provides a detailed examination of historical events and their lasting impact. Through careful research and engaging narrative, this historical work brings the past to life, helping readers understand how history continues to shape our present world.`,
    mystery: `${title} by ${author} is a gripping mystery that keeps readers guessing until the final pages. With clever plot twists and well-developed characters, this suspenseful tale explores themes of justice, deception, and the search for truth in a world where nothing is as it seems.`,
    dystopian: `${title} by ${author} presents a chilling vision of a possible future, exploring themes of power, control, and resistance. This dystopian work serves as both a compelling story and a thought-provoking commentary on society, technology, and the human spirit's capacity for both oppression and rebellion.`,
  }
  
  // Use genre-specific description if available, otherwise use a generic one
  const genreKey = Object.keys(genreDescriptions).find(key => genre.includes(key))
  if (genreKey) {
    return genreDescriptions[genreKey]
  }
  
  // Generic fallback
  return `${title} by ${author} is a notable work in the ${genre} genre that offers readers an engaging narrative and meaningful themes. This book explores important questions about life, society, and human nature through its well-crafted story and memorable characters.`
}

/**
 * Normalize ISBN by removing dashes for comparison
 * @param {string} isbn - ISBN string (may contain dashes)
 * @returns {string} Normalized ISBN without dashes
 */
export const normalizeIsbn = (isbn) => {
  return isbn ? isbn.replace(/-/g, '') : ''
}

/**
 * Check if two ISBNs match (handles dashes)
 * @param {string} isbn1 - First ISBN
 * @param {string} isbn2 - Second ISBN
 * @returns {boolean} True if ISBNs match
 */
export const isbnMatches = (isbn1, isbn2) => {
  if (!isbn1 || !isbn2) return false
  return normalizeIsbn(isbn1) === normalizeIsbn(isbn2) || isbn1 === isbn2
}

/**
 * Generate timestamp based on seed for consistent mock data
 * @param {number} seed - Seed value for generating timestamp
 * @returns {string} ISO timestamp string
 */
export const generateTimestamp = (seed) => {
  const now = Date.now()
  const offset = (seed % 14) * 24 * 60 * 60 * 1000 // up to two weeks
  return new Date(now - offset).toISOString()
}

/**
 * Convert ISO date string to relative time (e.g., "2h", "3d", "1mo")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const toRelativeTime = (dateString) => {
  const now = Date.now()
  const past = new Date(dateString).getTime()
  const diffMinutes = Math.max(1, Math.round((now - past) / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d`
  const diffMonths = Math.round(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo`
  const diffYears = Math.round(diffMonths / 12)
  return `${diffYears}y`
}

