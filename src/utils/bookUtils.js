// Utility functions for book-related operations

import librariesData from '../data/config/libraries.json'
import APP_CONFIG from '../config/constants'

/**
 * Generate library availability based on ISBN seed
 * @param {string} isbn - Book ISBN
 * @returns {Array} Array of library availability objects
 */
export const generateLibraryAvailability = (isbn) => {
  const seed = isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return librariesData.map((library, index) => {
    const available = (seed + index) % 3 !== 0
    const quantity = available ? Math.floor((seed + index) % 5) + 1 : 0
    return { library, available, quantity }
  })
}

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
 * Generate book description template
 * @param {Object} book - Book object with title, author, genre
 * @returns {string} Generated description
 */
export const generateBookDescription = (book) => {
  return `${book.title} is a timeless classic that captures the essence of ${book.genre.toLowerCase()} literature. Written by the acclaimed author ${book.author}, this work explores themes of human experience, society, and the complexities of life. Through its vivid prose and unforgettable characters, this novel continues to resonate with readers across generations.`
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

