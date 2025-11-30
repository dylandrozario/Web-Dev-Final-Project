import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import userReviewsData from '../../data/reviews/userReviews.json'
import { buildStarState, getAllReviewsForBook, cleanReviewText } from '../../utils/reviewUtils'
import { useReviewInteractions } from '../../hooks/useReviewInteractions'
import { useBookFinder } from '../../hooks/useBookFinder'
import LoadingMessage from '../../components/common/LoadingMessage/LoadingMessage'
import { ReviewThread, ReviewActions } from '../../components/common/ReviewThread'
import { useAuth } from '../../context/AuthContext'
import './BookDetails.css'

export default function AllReviews() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { book, isLoading, loading } = useBookFinder()

  // Get all reviews for this book (using same logic as BookDetails)
  const allReviewsData = useMemo(() => {
    if (!book) return []
    return getAllReviewsForBook(book.isbn, userReviewsData)
  }, [book])

  const [allReviews, setAllReviews] = useState([])

  // Use custom hook for review interactions (replies, likes, etc.)
  const {
    activeThread,
    replyDrafts,
    replyEditDrafts,
    editingReplyId,
    heartedReviews,
    heartedReplies,
    handleToggleThread,
    handleReplyDraftChange,
    handleReplyEditDraftChange,
    handleReplySubmit,
    handleEditReply,
    handleUpdateReply,
    handleCancelEditReply,
    handleDeleteReply,
    handleHeartReview,
    handleHeartReply
  } = useReviewInteractions(allReviews, setAllReviews, book?.isbn, isAuthenticated, user)

  useEffect(() => {
    if (allReviewsData.length > 0) {
      setAllReviews(allReviewsData)
    }
  }, [allReviewsData])

  if (isLoading || loading) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <LoadingMessage message="Loading reviews..." />
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
                          replyEditDrafts={replyEditDrafts}
                          editingReplyId={editingReplyId}
                          heartedReplies={heartedReplies}
                          onToggleThread={handleToggleThread}
                          onReplyDraftChange={handleReplyDraftChange}
                          onReplyEditDraftChange={handleReplyEditDraftChange}
                          onReplySubmit={handleReplySubmit}
                          onEditReply={handleEditReply}
                          onUpdateReply={handleUpdateReply}
                          onCancelEditReply={handleCancelEditReply}
                          onDeleteReply={handleDeleteReply}
                          onHeartReply={handleHeartReply}
                          isAuthenticated={isAuthenticated}
                          user={user}
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

