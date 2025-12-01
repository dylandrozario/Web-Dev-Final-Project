import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import userReviewsData from '../../data/reviews/userReviews.json'
import APP_CONFIG from '../../config/constants'
import { formatDate, calculateReadTime, generateBookDescription, toRelativeTime } from '../../utils/bookUtils'
import { buildStarState, getAllReviewsForBook, saveReviewToStorage, deleteReviewFromStorage, cleanReviewText } from '../../utils/reviewUtils'
import { useReviewInteractions } from '../../hooks/useReviewInteractions'
import { useBookActions } from '../../hooks/useBookActions'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useBookFinder } from '../../hooks/useBookFinder'
import LoadingMessage from '../../components/common/LoadingMessage/LoadingMessage'
import { ReviewThread, ReviewActions } from '../../components/common/ReviewThread'
import { useBooks } from '../../context/BooksContext'
import { useUserLibrary } from '../../context/UserLibraryContext'
import { useAuth } from '../../context/AuthContext'
import './BookDetails.css'

export default function BookDetails() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { rateBook, unrateBook, reviewBook, unreviewBook, getBookStatus } = useUserLibrary()
  const { handleSave, handleFavorite } = useBookActions()
  const { requireAuth } = useRequireAuth()
  const { book, bookNotFound, isLoading, loading } = useBookFinder()

  // Show loading state while books are loading
  if (isLoading || loading) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <LoadingMessage message="Loading book details..." />
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
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)

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
  } = useReviewInteractions(userReviews, setUserReviews, book?.isbn, isAuthenticated, user)

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
  const onSave = useCallback(() => {
    handleSave(book, bookStatus)
  }, [handleSave, book, bookStatus])
  
  const onFavorite = useCallback(() => {
    handleFavorite(book, bookStatus)
  }, [handleFavorite, book, bookStatus])

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


  const handleRatingOnly = () => {
    requireAuth(() => {
      if (!book?.isbn) return
      
      const ratingValue = parseFloat(reviewForm.rating)
      if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) return
      
      rateBook(book, ratingValue)
    })
  }

  const handleUnrate = () => {
    requireAuth(() => {
      if (!book?.isbn) return
      
      if (window.confirm('Are you sure you want to remove your rating?')) {
        unrateBook(book.isbn)
        setReviewForm(prev => ({ ...prev, rating: '0' }))
      }
    })
  }

  const handleReviewSubmit = (event) => {
    event.preventDefault()
    
    // Prevent creating a new review if user already has one (unless editing)
    if (userReview && !isEditingReview) {
      alert('You already have a review for this book. Please edit your existing review or reply to others.')
      return
    }
    
    // Use existing rating from bookStatus if form rating is 0 or invalid, otherwise use form rating
    let ratingValue = parseFloat(reviewForm.rating)
    if ((isNaN(ratingValue) || ratingValue === 0) && bookStatus.rated && bookStatus.rating) {
      ratingValue = bookStatus.rating
    }
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
      // Only create new review if user doesn't have one
      if (userReview) {
        alert('You already have a review for this book. Please edit your existing review.')
        return
      }
      
      const entry = {
        id: `user-${Date.now()}-${book.isbn}`,
        bookIsbn: book.isbn,
        userId: userId,
        reviewer: isAuthenticated ? (user?.name || user?.email?.split('@')[0] || 'You') : 'Reader',
        rating: ratingValue,
        review: reviewForm.body.trim(),
        likes: 0,
        createdAt: createdAt,
        relativeTime: toRelativeTime(createdAt),
        replies: []
      }
      
      // Add new review
      setUserReviews(prev => [entry, ...prev])
      
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
      unreviewBook(book.isbn)
    }
    
    setIsEditingReview(false)
    setEditingReviewId(null)
    setReviewForm({ rating: '0', body: '' })
  }

  return (
    <div className="book-details-page gradient-bg-vertical">
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
                  onClick={onSave}
                  aria-label={bookStatus.saved ? 'Remove from saved' : 'Save book'}
                  title={bookStatus.saved ? 'Remove from saved' : 'Save book'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={bookStatus.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
                <button 
                  className={`favorite-btn ${bookStatus.favorite ? 'active' : ''}`}
                  onClick={onFavorite}
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
                      {['Edit', 'Delete'].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={label === 'Edit' ? handleEditReview : handleDeleteReview}
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
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="review-content">
                    <div className="review-row">
                      <p className="review-author" style={{ fontWeight: 600 }}>Your Review</p>
                      <span className="review-meta">{userReview.relativeTime}</span>
                    </div>
                    <p className="review-body">{cleanReviewText(userReview.review)}</p>
                    <ReviewActions
                      review={userReview}
                      activeThread={activeThread}
                      heartedReviews={heartedReviews}
                      onToggleThread={handleToggleThread}
                      onHeartReview={handleHeartReview}
                    />
                    <ReviewThread
                      review={userReview}
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
              )}

              {/* Show review form only if user doesn't have a review OR is editing their review */}
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
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="reviews-banner-btn secondary"
                        onClick={handleRatingOnly}
                      >
                        {bookStatus.rated ? `Update to ${reviewForm.rating}/5` : `Rate ${reviewForm.rating}/5`}
                      </button>
                      {bookStatus.rated && (
                        <button
                          type="button"
                          className="reviews-banner-btn secondary"
                          onClick={handleUnrate}
                        >
                          Unrate
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    name="body"
                    placeholder={isEditingReview ? "Edit your review..." : "Share your read. What resonated? What didn't? (Optional)"}
                    rows={3}
                    value={reviewForm.body}
                    onChange={handleReviewChange}
                    disabled={userReview && !isEditingReview}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      className="reviews-banner-btn primary"
                      disabled={(!reviewForm.body.trim() && !bookStatus.rated) || (userReview && !isEditingReview)}
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
