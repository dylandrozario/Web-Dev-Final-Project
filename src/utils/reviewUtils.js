import { normalizeIsbn, generateTimestamp, toRelativeTime } from './bookUtils'

// Storage key for reviews
export const STORAGE_KEY_REVIEWS = 'libraryCatalog_allReviews'

// Clean review text (remove unwanted characters)
export const cleanReviewText = (text) => {
  if (!text) return ''
  return text.replace(/\s*\)\}/g, '')
}

// Memoize star state calculation
export const buildStarState = (rating) => {
  const stars = []
  const ratingNum = parseFloat(rating) || 0
  for (let i = 1; i <= 5; i += 1) {
    if (ratingNum >= i) {
      stars.push('full')
    } else if (ratingNum >= i - 0.5) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }
  return stars
}

// Load reviews from localStorage
export const loadReviewsFromStorage = (bookIsbn) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REVIEWS)
    if (!stored) return []
    
    const allReviews = JSON.parse(stored)
    const normalizedIsbn = normalizeIsbn(bookIsbn)
    return allReviews[normalizedIsbn] || []
  } catch (error) {
    console.error('Failed to load reviews from storage:', error)
    return []
  }
}

// Save review to localStorage
export const saveReviewToStorage = (review, bookIsbn) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REVIEWS)
    const allReviews = stored ? JSON.parse(stored) : {}
    const normalizedIsbn = normalizeIsbn(bookIsbn)
    
    if (!allReviews[normalizedIsbn]) {
      allReviews[normalizedIsbn] = []
    }
    
    // Update existing review or add new one
    const existingIndex = allReviews[normalizedIsbn].findIndex(r => r.id === review.id)
    if (existingIndex >= 0) {
      // Update existing review
      allReviews[normalizedIsbn][existingIndex] = review
    } else {
      // Add new review
      allReviews[normalizedIsbn].push(review)
    }
    
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(allReviews))
  } catch (error) {
    console.error('Failed to save review to storage:', error)
  }
}

// Delete review from localStorage
export const deleteReviewFromStorage = (reviewId, bookIsbn) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REVIEWS)
    if (!stored) return
    
    const allReviews = JSON.parse(stored)
    const normalizedIsbn = normalizeIsbn(bookIsbn)
    
    if (allReviews[normalizedIsbn]) {
      allReviews[normalizedIsbn] = allReviews[normalizedIsbn].filter(r => r.id !== reviewId)
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(allReviews))
    }
  } catch (error) {
    console.error('Failed to delete review from storage:', error)
  }
}

// Get all reviews for a book (mock data + stored reviews)
export const getAllReviewsForBook = (bookIsbn, userReviewsData) => {
  const normalizedIsbn = normalizeIsbn(bookIsbn)
  const mockMatches = userReviewsData.filter(entry => normalizeIsbn(entry.bookIsbn) === normalizedIsbn)
  const storedReviews = loadReviewsFromStorage(bookIsbn)
  
  // Combine mock data and stored reviews
  const allMockReviews = mockMatches.length ? mockMatches : userReviewsData.slice(0, 10)
  
  const formattedMockReviews = allMockReviews.map((review, index) => {
    const rating = parseFloat((review.rating || 4).toFixed(1))
    const timestamp = generateTimestamp(index + Math.round(rating * 10))
    return {
      ...review,
      id: `${review.bookIsbn}-${index}`,
      rating,
      createdAt: timestamp,
      relativeTime: toRelativeTime(timestamp),
      replies: (review.replies || []).map((reply, replyIndex) => ({
        id: reply.id || `${review.bookIsbn}-${index}-reply-${replyIndex}`,
        author: reply.author || 'Reader',
        body: reply.body || '',
        timestamp: reply.timestamp || toRelativeTime(timestamp),
        likes: reply.likes || 0
      }))
    }
  })
  
  // Merge stored reviews (user-submitted) with mock reviews
  // Stored reviews should appear first (most recent)
  const allReviews = [...storedReviews, ...formattedMockReviews]
  
  // Remove duplicates by id
  const uniqueReviews = []
  const seenIds = new Set()
  for (const review of allReviews) {
    if (!seenIds.has(review.id)) {
      seenIds.add(review.id)
      uniqueReviews.push(review)
    }
  }
  
  return uniqueReviews
}

