import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import userReviewsData from '../../data/reviews/userReviews.json'
import { normalizeIsbn, isbnMatches, generateTimestamp, toRelativeTime } from '../../utils/bookUtils'
import { useBooks } from '../../context/BooksContext'
import { useAuth } from '../../context/AuthContext'
import './BookDetails.css'

// Helper functions for localStorage review persistence (same as BookDetails)
const STORAGE_KEY_REVIEWS = 'libraryCatalog_allReviews'

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

// Get all reviews for a book (mock data + stored reviews) - same logic as BookDetails
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

// Memoize star state calculation
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

export default function AllReviews() {
  const { isbn } = useParams()
  const navigate = useNavigate()
  const { books, loading } = useBooks()
  const { isAuthenticated } = useAuth()

  // Find the book by ISBN
  const book = useMemo(() => {
    if (loading || !books || books.length === 0 || !isbn) return null
    return books.find(b => isbnMatches(b.isbn, isbn)) || null
  }, [isbn, books, loading])

  // Get all reviews for this book (using same logic as BookDetails)
  const allReviews = useMemo(() => {
    if (!book) return []
    return getAllReviewsForBook(book.isbn, userReviewsData)
  }, [book])

  const [activeThread, setActiveThread] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [heartedReviews, setHeartedReviews] = useState({})
  const [heartedReplies, setHeartedReplies] = useState({})

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

    // In a real app, this would update the reviews state
    // For now, we'll just clear the draft
    setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }))
  }

  const handleHeartReview = (reviewId) => {
    const alreadyHearted = heartedReviews[reviewId]
    setHeartedReviews(prev => ({ ...prev, [reviewId]: !alreadyHearted }))
  }

  const handleHeartReply = (reviewId, replyId) => {
    const alreadyHearted = heartedReplies[replyId]
    setHeartedReplies(prev => ({ ...prev, [replyId]: !alreadyHearted }))
  }

  if (loading || !books || books.length === 0) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
            <p>Book not found.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate(`/book/isbn/${book.isbn}`)}
            style={{
              background: 'none',
              border: '1px solid var(--gold)',
              color: 'var(--gold)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Book Details
          </button>
          <h1 style={{ color: 'var(--white)', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            All Reviews for {book.title}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            by {book.author}
          </p>
        </div>

        {/* All Reviews List */}
        <section className="reviews-board">
          <div className="reviews-panels">
            <div className="reviews-panel recent-panel" style={{ width: '100%' }}>
              <div className="panel-header">
                <p className="panel-eyebrow">All user reviews ({allReviews.length})</p>
              </div>

              <div className="review-list recent">
                {allReviews.length > 0 ? (
                  allReviews.map((review) => (
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
                            {isAuthenticated && (
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
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '2rem' }}>
                    No reviews yet. Be the first to review this book!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

