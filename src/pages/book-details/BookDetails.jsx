import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import userReviewsData from '../../data/reviews/userReviews.json'
import APP_CONFIG from '../../config/constants'
import { formatDate, calculateReadTime, generateBookDescription, normalizeIsbn, isbnMatches, generateTimestamp, toRelativeTime } from '../../utils/bookUtils'
import { useBooks } from '../../context/BooksContext'
import { useUserLibrary } from '../../context/UserLibraryContext'
import { useAuth } from '../../context/AuthContext'
import './BookDetails.css'


// Memoize star state calculation to avoid recalculation
const buildStarState = (rating) => {
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

// Helper functions for localStorage review persistence
const STORAGE_KEY_REVIEWS = 'libraryCatalog_allReviews'

const saveReviewToStorage = (review, bookIsbn) => {
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

const deleteReviewFromStorage = (reviewId, bookIsbn) => {
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

const loadReviewsFromStorage = (bookIsbn) => {
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

// Get all reviews for a book (mock data + stored reviews)
const getAllReviewsForBook = (bookIsbn, userReviewsData) => {
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

export default function BookDetails() {
  const { id, isbn } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { books, loading } = useBooks()
  const { isAuthenticated, user } = useAuth()
  const { saveBook, unsaveBook, favoriteBook, unfavoriteBook, rateBook, reviewBook, getBookStatus } = useUserLibrary()

  // Find the book by ID (using ISBN or index)
  const { book, bookNotFound } = useMemo(() => {
    // If books are still loading, don't mark as not found yet
    if (loading || !books || books.length === 0) {
      return { book: null, bookNotFound: false, isLoading: true }
    }

    // Check if we have ISBN in params
    const bookIdentifier = isbn || id || location.pathname.split('/').pop()
    
    if (bookIdentifier) {
      // Try to find by ISBN first (handle with or without dashes)
      const foundByIsbn = books.find(b => isbnMatches(b.isbn, bookIdentifier))
      if (foundByIsbn) return { book: foundByIsbn, bookNotFound: false }
      
      // Otherwise try by index
      const index = parseInt(bookIdentifier)
      if (!isNaN(index) && index >= 0 && index < books.length) {
        return { book: books[index], bookNotFound: false }
      }
    }
    // Book not found (only after books have loaded)
    return { book: null, bookNotFound: true }
  }, [id, isbn, location.pathname, books, loading])

  // Show loading state while books are loading
  if (loading || !books || books.length === 0) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
            <p>Loading book details...</p>
          </div>
        </div>
      </div>
    )
  }

  // If book not found after loading, return null (BookDetailsWithFallback will show BookNotFound)
  if (bookNotFound || !book) {
    return null
  }

  // Get book status from user library (safe to call now that book exists)
  const bookStatus = useMemo(() => {
    try {
      return getBookStatus(book.isbn)
    } catch (error) {
      console.error('Error getting book status:', error)
      return { saved: false, favorite: false, rated: false, reviewed: false, rating: null, ratingLabel: '—' }
    }
  }, [book.isbn, getBookStatus])

  // Calculate read time: use provided value, or calculate from pages, or use default
  const readTimeMinutes = useMemo(() => {
    if (book.readTimeMinutes) return book.readTimeMinutes
    if (book.pages) return Math.round(book.pages * 1.25)
    return calculateReadTime() // Uses default pages
  }, [book.readTimeMinutes, book.pages])
  
  const formattedDate = formatDate(book.releaseDate)
  const description = book.description || generateBookDescription(book)


  // Get all reviews for this book (mock + stored)
  const allReviewsForBook = useMemo(() => {
    if (!book?.isbn) return []
    return getAllReviewsForBook(book.isbn, userReviewsData)
  }, [book?.isbn])

  const [userReviews, setUserReviews] = useState(() => allReviewsForBook)
  
  // Update reviews when book changes or when reviews are loaded
  useEffect(() => {
    setUserReviews(allReviewsForBook)
  }, [allReviewsForBook])
  const [reviewForm, setReviewForm] = useState({
    rating: '0',
    body: ''
  })
  const [hoverRating, setHoverRating] = useState(null)
  const [activeThread, setActiveThread] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [heartedReviews, setHeartedReviews] = useState({})
  const [heartedReplies, setHeartedReplies] = useState({})
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)

  // Find user's review and separate from others
  const userReview = useMemo(() => {
    if (!isAuthenticated || !user) return null
    const userId = user.uid || user.email
    // Find review by userId, or by checking if reviewer name matches user
    return userReviews.find(r => {
      if (r.userId === userId) return true
      // Also check if reviewer name matches (for backwards compatibility)
      const userName = user.name || user.email?.split('@')[0] || 'You'
      return r.reviewer === userName || r.reviewer === 'You'
    }) || null
  }, [userReviews, isAuthenticated, user])

  // Other reviews (excluding user's review)
  const otherReviews = useMemo(() => {
    if (!userReview) return userReviews
    return userReviews.filter(r => r.id !== userReview.id)
  }, [userReviews, userReview])

  const recentReviews = useMemo(() => {
    const sorted = [...otherReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return sorted.slice(0, 3)
  }, [otherReviews])

  const handleReviewChange = (event) => {
    const { name, value } = event.target
    setReviewForm(prev => ({ ...prev, [name]: value }))
  }

  // Update review form rating if book is already rated
  useEffect(() => {
    if (bookStatus.rated && bookStatus.rating) {
      setReviewForm(prev => ({ ...prev, rating: bookStatus.rating.toFixed(1) }))
    }
  }, [bookStatus.rated, bookStatus.rating])

  // Handle save/favorite actions
  const handleSave = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: location.pathname } })
      return
    }
    if (!book?.isbn) return
    
    if (bookStatus.saved) {
      unsaveBook(book.isbn)
    } else {
      saveBook(book)
    }
  }, [isAuthenticated, book, bookStatus.saved, navigate, location.pathname, saveBook, unsaveBook])
  
  const handleFavorite = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: location.pathname } })
      return
    }
    if (!book?.isbn) return
    
    if (bookStatus.favorite) {
      unfavoriteBook(book.isbn)
    } else {
      favoriteBook(book)
    }
  }, [isAuthenticated, book, bookStatus.favorite, navigate, location.pathname, favoriteBook, unfavoriteBook])

  const ratingAsNumber = parseFloat(reviewForm.rating) || 0
  const starPickerValue = hoverRating ?? ratingAsNumber

  const handleStarSelect = (value) => {
    const ratingValue = parseFloat(value.toFixed(1))
    setReviewForm(prev => ({ ...prev, rating: value.toFixed(1) }))
    setHoverRating(null)
    
    // Auto-save rating when user selects a star (if authenticated)
    if (isAuthenticated && book?.isbn) {
      rateBook(book, ratingValue)
    }
  }

  const handleHeartReview = (reviewId) => {
    const alreadyHearted = heartedReviews[reviewId]
    setUserReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              likes: Math.max(0, (review.likes || 0) + (alreadyHearted ? -1 : 1))
            }
          : review
      )
    )
    setHeartedReviews(prev => ({ ...prev, [reviewId]: !alreadyHearted }))
  }

  const handleToggleThread = (reviewId) => {
    setActiveThread(prev => (prev === reviewId ? null : reviewId))
  }

  const handleReplyDraftChange = (reviewId, text) => {
    setReplyDrafts(prev => ({ ...prev, [reviewId]: text }))
  }

  const handleReplySubmit = (event, reviewId) => {
    event.preventDefault()
    const text = replyDrafts[reviewId]?.trim()
    if (!text) return

    const reply = {
      id: `${reviewId}-reply-${Date.now()}`,
      author: 'Reader',
      body: text,
      timestamp: toRelativeTime(new Date().toISOString()),
      likes: 0
    }

    setUserReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? { ...review, replies: [...(review.replies || []), reply] }
          : review
      )
      
      // Persist the updated review with reply
      const reviewWithReply = updated.find(r => r.id === reviewId)
      if (reviewWithReply && book?.isbn) {
        saveReviewToStorage(reviewWithReply, book.isbn)
      }
      
      return updated
    })
    setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }))
  }

  const handleHeartReply = (reviewId, replyId) => {
    const alreadyHearted = heartedReplies[replyId]
    setUserReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.map(reply =>
                reply.id === replyId
                  ? {
                      ...reply,
                      likes: Math.max(0, (reply.likes || 0) + (alreadyHearted ? -1 : 1))
                    }
                  : reply
              )
            }
          : review
      )
    )
    setHeartedReplies(prev => ({ ...prev, [replyId]: !alreadyHearted }))
  }

  const handleRatingOnly = () => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: location.pathname } })
      return
    }
    if (!book?.isbn) return
    
    const ratingValue = parseFloat(reviewForm.rating)
    if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) return
    
    rateBook(book, ratingValue)
  }

  const handleReviewSubmit = (event) => {
    event.preventDefault()
    
    const ratingValue = parseFloat(reviewForm.rating)
    const hasReviewText = reviewForm.body.trim().length > 0
    
    // If no review text, just save the rating
    if (!hasReviewText) {
      if (isAuthenticated && book?.isbn) {
        rateBook(book, ratingValue)
      }
      return
    }

    const userId = isAuthenticated && user ? (user.uid || user.email) : null
    const createdAt = new Date().toISOString()
    
    // If editing, update existing review; otherwise create new one
    if (isEditingReview && editingReviewId && userReview) {
      const updatedReview = {
        ...userReview,
        rating: ratingValue,
        review: reviewForm.body.trim(),
        updatedAt: createdAt,
        relativeTime: toRelativeTime(createdAt)
      }
      
      // Update in state
      setUserReviews(prev => 
        prev.map(r => r.id === editingReviewId ? updatedReview : r)
      )
      
      // Save to localStorage
      saveReviewToStorage(updatedReview, book.isbn)
      
      // Update in user library
      if (isAuthenticated) {
        rateBook(book, ratingValue)
        reviewBook(book, reviewForm.body.trim())
      }
      
      setIsEditingReview(false)
      setEditingReviewId(null)
    } else {
      // Create new review (or replace existing user review)
      // Check if user already has a review for this book
      const existingUserReview = userReview || userReviews.find(r => {
        if (!userId) return false
        return r.userId === userId || 
               (r.reviewer === (user?.name || user?.email?.split('@')[0] || 'You')) ||
               (r.reviewer === 'You' && isAuthenticated)
      })
      
      const entry = {
        id: existingUserReview?.id || `user-${Date.now()}-${book.isbn}`,
        bookIsbn: book.isbn,
        userId: userId,
        reviewer: isAuthenticated ? (user?.name || user?.email?.split('@')[0] || 'You') : 'Reader',
        rating: ratingValue,
        review: reviewForm.body.trim(),
        likes: existingUserReview?.likes || 0,
        createdAt: existingUserReview?.createdAt || createdAt,
        relativeTime: toRelativeTime(existingUserReview?.createdAt || createdAt),
        replies: existingUserReview?.replies || []
      }
      
      // Replace existing user review or add new one
      if (existingUserReview) {
        setUserReviews(prev => 
          prev.map(r => r.id === existingUserReview.id ? entry : r)
        )
      } else {
        setUserReviews(prev => [entry, ...prev])
      }
      
      // Save to localStorage
      saveReviewToStorage(entry, book.isbn)
      
      // Save rating and review to user library
      if (isAuthenticated) {
        rateBook(book, ratingValue)
        reviewBook(book, reviewForm.body.trim())
      }
    }
    
    setReviewForm({ rating: '0', body: '' })
  }

  const handleEditReview = () => {
    if (!userReview) return
    
    setIsEditingReview(true)
    setEditingReviewId(userReview.id)
    setReviewForm({
      rating: userReview.rating.toFixed(1),
      body: userReview.review || ''
    })
  }

  const handleCancelEdit = () => {
    setIsEditingReview(false)
    setEditingReviewId(null)
    setReviewForm({ rating: '0', body: '' })
    if (bookStatus.rated && bookStatus.rating) {
      setReviewForm(prev => ({ ...prev, rating: bookStatus.rating.toFixed(1) }))
    }
  }

  const handleDeleteReview = () => {
    if (!userReview || !window.confirm('Are you sure you want to delete your review?')) return
    
    // Remove from state
    setUserReviews(prev => prev.filter(r => r.id !== userReview.id))
    
    // Remove from localStorage
    deleteReviewFromStorage(userReview.id, book.isbn)
    
    // Clear user library review status
    if (isAuthenticated && book?.isbn) {
      // Note: We can't directly remove the review from UserLibraryContext,
      // but the review is removed from the reviews list
    }
    
    setIsEditingReview(false)
    setEditingReviewId(null)
    setReviewForm({ rating: '0', body: '' })
  }

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        {/* Main Content Grid */}
        <div className="book-details-grid">
          {/* Left: Book Cover */}
          <div className="book-cover-section">
            <div className="book-cover-wrapper">
              {book.image ? (
                <img src={book.image} alt={book.title} className="book-cover-image" />
              ) : (
                <div className="book-cover-placeholder">
                  <span>{book.title.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Middle: Book Information */}
          <div className="book-info-section">
            <div className="book-title-row">
              <h1 className="book-title">{book.title}</h1>
              <div className="book-actions">
                <button 
                  className={`bookmark-btn ${bookStatus.saved ? 'active' : ''}`}
                  onClick={handleSave}
                  aria-label={bookStatus.saved ? 'Remove from saved' : 'Save book'}
                  title={bookStatus.saved ? 'Remove from saved' : 'Save book'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={bookStatus.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
                <button 
                  className={`favorite-btn ${bookStatus.favorite ? 'active' : ''}`}
                  onClick={handleFavorite}
                  aria-label={bookStatus.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={bookStatus.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={bookStatus.favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            </div>
            <p className="book-author">by {book.author}</p>
            
            <div className="book-description">
              <p>{description}</p>
            </div>

            <div className="book-specifications">
              <h3 className="specs-title">Specifications</h3>
              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Released On:</span>
                  <span className="spec-value">{formattedDate}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Language:</span>
                  <span className="spec-value">{book.language || APP_CONFIG.DEFAULT_LANGUAGE}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Pages:</span>
                  <span className="spec-value">{book.pages || APP_CONFIG.DEFAULT_ESTIMATED_PAGES}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Read Time:</span>
                  <span className="spec-value">{readTimeMinutes ? `${readTimeMinutes} minutes` : 'Not available'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">ISBN:</span>
                  <span className="spec-value">{book.isbn}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">{book.genre}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Publisher:</span>
                  <span className="spec-value">{book.publisher || APP_CONFIG.DEFAULT_PUBLISHER}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Board */}
        <section className="reviews-board">
          <div className="reviews-panels">
            <div className="reviews-panel recent-panel">
              <div className="panel-header">
                <p className="panel-eyebrow">Recent user reviews</p>
              </div>

              {/* Show user's review first if it exists and not editing */}
              {userReview && !isEditingReview && (
                <article className="review-entry compact" style={{ marginBottom: '2rem', border: '2px solid var(--gold)', borderRadius: '8px', padding: '1rem' }}>
                  <div className="review-badge">
                    <span className="review-rating-chip subtle">{userReview.rating.toFixed(1)}/5</span>
                    <div className="review-stars small" aria-label={`Rated ${userReview.rating} out of 5`}>
                      {buildStarState(userReview.rating).map((state, index) => (
                        <span key={index} className={`star ${state}`}>★</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={handleEditReview}
                        style={{
                          background: 'var(--gold)',
                          color: 'var(--dark-maroon)',
                          border: 'none',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        style={{
                          background: 'var(--gold)',
                          color: 'var(--dark-maroon)',
                          border: 'none',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="review-content">
                    <div className="review-row">
                      <p className="review-author" style={{ fontWeight: 600 }}>Your Review</p>
                      <span className="review-meta">{userReview.relativeTime}</span>
                    </div>
                    <p className="review-body">{userReview.review?.replace(/\s*\)\}/g, '')}</p>
                    <div className="review-actions">
                      <button
                        type="button"
                        className="review-action"
                        onClick={() => handleToggleThread(userReview.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
                        </svg>
                        {userReview.replies?.length || 0}
                      </button>
                      <button
                        type="button"
                        className="review-action"
                        onClick={() => handleHeartReview(userReview.id)}
                        aria-pressed={heartedReviews[userReview.id] || false}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {userReview.likes || 0}
                      </button>
                    </div>
                    {activeThread === userReview.id && (
                      <div className="review-thread">
                        <div className="thread-replies">
                          {userReview.replies?.length ? (
                            userReview.replies.map((reply) => (
                              <div key={reply.id} className="thread-reply">
                                <div className="thread-reply-meta">
                                  <span className="thread-reply-author">{reply.author}</span>
                                  <span className="thread-reply-time">{reply.timestamp}</span>
                                </div>
                                <p className="thread-reply-body">{reply.body?.replace(/\s*\)\}/g, '')}</p>
                                <div className="thread-reply-actions">
                                  <button
                                    type="button"
                                    onClick={() => handleHeartReply(userReview.id, reply.id)}
                                    aria-pressed={heartedReplies[reply.id] || false}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                    {reply.likes || 0}
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="thread-empty">No replies yet. Start the conversation.</p>
                          )}
                        </div>
                        <form className="thread-form" onSubmit={(event) => handleReplySubmit(event, userReview.id)}>
                          <textarea
                            rows={2}
                            placeholder="Add a reply"
                            value={replyDrafts[userReview.id] || ''}
                            onChange={(event) => handleReplyDraftChange(userReview.id, event.target.value)}
                          />
                          <button type="submit" disabled={!replyDrafts[userReview.id]?.trim()}>
                            Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </article>
              )}

              {/* Show review form only if user doesn't have a review OR is editing */}
              {(!userReview || isEditingReview) && (
              <form id="reviewComposer" className="review-composer" onSubmit={handleReviewSubmit}>
                    <div className="composer-row">
                      <label>
                        Rating
                        <input
                          type="number"
                          name="rating"
                          min="0"
                          max="5"
                          step="0.1"
                          value={reviewForm.rating}
                          onChange={handleReviewChange}
                        />
                      </label>
                      <div className="composer-meta">0 – 5</div>
                    </div>
                  <div className="rating-controls">
                    <div className="review-star-picker" role="radiogroup" aria-label="Select rating">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const state = starPickerValue >= value ? 'full' : starPickerValue >= value - 0.5 ? 'half' : 'empty'
                        return (
                          <button
                            key={value}
                            type="button"
                            className={`picker-star ${state}`}
                            aria-label={`${value} star${value > 1 ? 's' : ''}`}
                            onClick={() => handleStarSelect(value)}
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(null)}
                          >
                            ★
                          </button>
                        )
                      })}
                    </div>
                    <button
                      type="button"
                      className="reviews-banner-btn secondary"
                      onClick={handleRatingOnly}
                    >
                      {bookStatus.rated ? `Update to ${reviewForm.rating}/5` : `Rate ${reviewForm.rating}/5`}
                    </button>
                  </div>
                  <textarea
                    name="body"
                    placeholder="Share your read. What resonated? What didn't? (Optional)"
                    rows={3}
                    value={reviewForm.body}
                    onChange={handleReviewChange}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      className="reviews-banner-btn primary"
                      disabled={!reviewForm.body.trim() && !bookStatus.rated}
                    >
                      {isEditingReview ? 'Update Review' : (reviewForm.body.trim() ? 'Post review' : bookStatus.rated ? 'Update rating' : 'Post review')}
                    </button>
                    {isEditingReview && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="reviews-banner-btn secondary"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div className="review-list recent">
                {recentReviews.map((review) => (
                  <article key={review.id} className="review-entry compact">
                    <div className="review-badge">
                      <span className="review-rating-chip subtle">{review.rating.toFixed(1)}/5</span>
                      <div className="review-stars small" aria-label={`Rated ${review.rating} out of 5`}>
                        {buildStarState(review.rating).map((state, index) => (
                          <span key={index} className={`star ${state}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="review-content">
                      <div className="review-row">
                        <p className="review-author">{review.reviewer}</p>
                        <span className="review-meta">{review.relativeTime}</span>
                      </div>
                      <p className="review-body">{review.review?.replace(/\s*\)\}/g, '')}</p>
                      <div className="review-actions">
                        <button
                          type="button"
                          className="review-action"
                          onClick={() => handleToggleThread(review.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
                          </svg>
                          {review.replies?.length || 0}
                        </button>
                        <button
                          type="button"
                          className="review-action"
                          onClick={() => handleHeartReview(review.id)}
                          aria-pressed={heartedReviews[review.id] || false}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          {review.likes || 0}
                        </button>
                      </div>
                      {activeThread === review.id && (
                        <div className="review-thread">
                          <div className="thread-replies">
                            {review.replies?.length ? (
                              review.replies.map((reply) => (
                                <div key={reply.id} className="thread-reply">
                                  <div className="thread-reply-meta">
                                    <span className="thread-reply-author">{reply.author}</span>
                                    <span className="thread-reply-time">{reply.timestamp}</span>
                                  </div>
                                  <p className="thread-reply-body">{reply.body?.replace(/\s*\)\}/g, '')}</p>
                                  <div className="thread-reply-actions">
                                    <button
                                      type="button"
                                      onClick={() => handleHeartReply(review.id, reply.id)}
                                      aria-pressed={heartedReplies[reply.id] || false}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                      </svg>
                                      {reply.likes || 0}
                                    </button>
                </div>
              </div>
                              ))
                            ) : (
                              <p className="thread-empty">No replies yet. Start the conversation.</p>
                            )}
                          </div>
                          <form className="thread-form" onSubmit={(event) => handleReplySubmit(event, review.id)}>
                            <textarea
                              rows={2}
                              placeholder="Add a reply"
                              value={replyDrafts[review.id] || ''}
                              onChange={(event) => handleReplyDraftChange(review.id, event.target.value)}
                            />
                            <button type="submit" disabled={!replyDrafts[review.id]?.trim()}>
                              Reply
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </article>
            ))}
          </div>
          
          {/* View More Reviews Button */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate(`/book/isbn/${book.isbn}/reviews`)}
              style={{
                background: 'var(--gold)',
                color: 'var(--dark-maroon)',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              View More Reviews {userReviews.length > recentReviews.length ? `(${userReviews.length - recentReviews.length} more)` : userReviews.length > 0 ? `(${userReviews.length} total)` : ''}
            </button>
          </div>
        </div>
          </div>
        </section>
      </div>
    </div>
  )
}
