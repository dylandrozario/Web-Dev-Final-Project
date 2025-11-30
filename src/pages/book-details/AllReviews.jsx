import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import userReviewsData from '../../data/reviews/userReviews.json'
import { isbnMatches } from '../../utils/bookUtils'
import { buildStarState, getAllReviewsForBook, cleanReviewText } from '../../utils/reviewUtils'
import { ReviewThread, ReviewActions } from '../../components/common/ReviewThread'
import { useBooks } from '../../context/BooksContext'
import { useAuth } from '../../context/AuthContext'
import './BookDetails.css'

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
                        <p className="review-body">{cleanReviewText(review.review)}</p>
                        <ReviewActions
                          review={review}
                          activeThread={activeThread}
                          heartedReviews={heartedReviews}
                          onToggleThread={handleToggleThread}
                          onHeartReview={handleHeartReview}
                        />
                        <ReviewThread
                          review={review}
                          activeThread={activeThread}
                          replyDrafts={replyDrafts}
                          heartedReplies={heartedReplies}
                          onToggleThread={handleToggleThread}
                          onReplyDraftChange={handleReplyDraftChange}
                          onReplySubmit={handleReplySubmit}
                          onHeartReply={handleHeartReply}
                          isAuthenticated={isAuthenticated}
                        />
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

