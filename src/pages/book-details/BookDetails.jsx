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

export default function BookDetails() {
  const { id, isbn } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { books, loading } = useBooks()
  const { isAuthenticated } = useAuth()
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


  const reviewSeedData = useMemo(() => {
    const normalizedIsbn = normalizeIsbn(book.isbn)
    const matches = userReviewsData.filter(entry => normalizeIsbn(entry.bookIsbn) === normalizedIsbn)
    const fallback = matches.length ? matches : userReviewsData.slice(0, 3)
    return fallback.map((review, index) => {
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
  }, [book.isbn])

  const [userReviews, setUserReviews] = useState(reviewSeedData)
  const [reviewForm, setReviewForm] = useState({
    rating: '4.0',
    body: ''
  })
  const [hoverRating, setHoverRating] = useState(null)
  const [activeThread, setActiveThread] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [heartedReviews, setHeartedReviews] = useState({})
  const [heartedReplies, setHeartedReplies] = useState({})

  const recentReviews = useMemo(() => {
    return [...userReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
  }, [userReviews])

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
    setReviewForm(prev => ({ ...prev, rating: value.toFixed(1) }))
    setHoverRating(null)
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
      timestamp: 'moments ago'
    }

    setUserReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, replies: [...(review.replies || []), reply] }
          : review
      )
    )
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

  const handleReviewSubmit = (event) => {
    event.preventDefault()
    if (!reviewForm.body.trim()) return

    const createdAt = new Date().toISOString()
    const ratingValue = parseFloat(reviewForm.rating)
    const entry = {
      id: `user-${Date.now()}`,
      reviewer: 'Reader',
      rating: ratingValue,
      review: reviewForm.body.trim(),
      likes: 0,
      createdAt,
      relativeTime: '1m'
    }
    setUserReviews(prev => [entry, ...prev])
    
    // Save rating and review to user library
    if (isAuthenticated) {
      rateBook(book, ratingValue)
      reviewBook(book, reviewForm.body.trim())
    }
    
    setReviewForm({ rating: '4.0', body: '' })
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
                  <textarea
                    name="body"
                    placeholder="Share your read. What resonated? What didn’t?"
                    rows={3}
                    value={reviewForm.body}
                    onChange={handleReviewChange}
                  />
                  <button
                    type="submit"
                    className="reviews-banner-btn primary"
                    disabled={!reviewForm.body.trim()}
                  >
                    Post review
                  </button>
                </form>

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
          {userReviews.length > recentReviews.length && (
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
                View More Reviews ({userReviews.length - recentReviews.length} more)
              </button>
            </div>
          )}
        </div>
          </div>
        </section>
      </div>
    </div>
  )
}
