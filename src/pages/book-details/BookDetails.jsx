import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import userReviewsData from '../../data/reviews/userReviews.json';
import APP_CONFIG from '../../config/constants';
import { formatDate, calculateReadTime, generateBookDescription, cleanBookDescription, toRelativeTime } from '../../utils/bookUtils';
import { buildStarState, getAllReviewsForBook, saveReviewToStorage, deleteReviewFromStorage, cleanReviewText } from '../../utils/reviewUtils';
import { useReviewInteractions } from '../../hooks/useReviewInteractions';
import { useBookActions } from '../../hooks/useBookActions';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useBookFinder } from '../../hooks/useBookFinder';
import LoadingMessage from '../../components/common/LoadingMessage/LoadingMessage';
import { ReviewThread, ReviewActions } from '../../components/common/ReviewThread';
import { useUserLibrary } from '../../context/UserLibraryContext';
import { useAuth } from '../../context/AuthContext';
import './BookDetails.css';

const DEFAULT_BOOK_STATUS = { saved: false, favorite: false, rated: false, reviewed: false, rating: null, ratingLabel: '—' };

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

  const bookStatus = useMemo(() => {
    try {
      return getBookStatus(book.isbn);
    } catch (error) {
      console.error('Error getting book status:', error);
      return DEFAULT_BOOK_STATUS;
    }
  }, [book.isbn, getBookStatus]);

  const readTimeMinutes = useMemo(() => {
    return book.readTimeMinutes || (book.pages ? Math.round(book.pages * 1.25) : calculateReadTime());
  }, [book.readTimeMinutes, book.pages]);
  
  const formattedDate = formatDate(book.releaseDate);
  
  const description = useMemo(() => {
    return cleanBookDescription(book.description) || generateBookDescription(book);
  }, [book.description, book.genre, book.title, book.author]);


  const allReviewsForBook = useMemo(() => {
    return book?.isbn ? getAllReviewsForBook(book.isbn, userReviewsData) : [];
  }, [book?.isbn]);

  const [userReviews, setUserReviews] = useState(() => allReviewsForBook);
  
  useEffect(() => {
    setUserReviews(allReviewsForBook);
  }, [allReviewsForBook]);
  const [reviewForm, setReviewForm] = useState({
    rating: '0',
    body: ''
  })
  const [hoverRating, setHoverRating] = useState(null)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)

  const reviewInteractions = useReviewInteractions(userReviews, setUserReviews, book?.isbn, isAuthenticated, user);
  
  const reviewThreadProps = useMemo(() => ({
    activeThread: reviewInteractions.activeThread,
    replyDrafts: reviewInteractions.replyDrafts,
    replyEditDrafts: reviewInteractions.replyEditDrafts,
    editingReplyId: reviewInteractions.editingReplyId,
    heartedReplies: reviewInteractions.heartedReplies,
    onReplyDraftChange: reviewInteractions.handleReplyDraftChange,
    onReplyEditDraftChange: reviewInteractions.handleReplyEditDraftChange,
    onReplySubmit: reviewInteractions.handleReplySubmit,
    onEditReply: reviewInteractions.handleEditReply,
    onUpdateReply: reviewInteractions.handleUpdateReply,
    onCancelEditReply: reviewInteractions.handleCancelEditReply,
    onDeleteReply: reviewInteractions.handleDeleteReply,
    onHeartReply: reviewInteractions.handleHeartReply,
    isAuthenticated,
    user
  }), [reviewInteractions, isAuthenticated, user]);

  const userReview = useMemo(() => {
    if (!isAuthenticated || !user) return null;
    const userId = user.uid || user.email;
    const userName = user.name || user.email?.split('@')[0] || 'You';
    return userReviews.find(r => r.userId === userId || r.reviewer === userName || r.reviewer === 'You') || null;
  }, [userReviews, isAuthenticated, user]);

  const otherReviews = useMemo(() => {
    return userReview ? userReviews.filter(r => r.id !== userReview.id) : userReviews;
  }, [userReviews, userReview]);

  const recentReviews = useMemo(() => {
    return [...otherReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  }, [otherReviews]);

  const handleReviewChange = useCallback((event) => {
    const { name, value } = event.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    if (bookStatus.rated && bookStatus.rating) {
      setReviewForm(prev => ({ ...prev, rating: bookStatus.rating.toFixed(1) }));
    }
  }, [bookStatus.rated, bookStatus.rating]);

  const onSave = useCallback(() => handleSave(book, bookStatus), [handleSave, book, bookStatus]);
  const onFavorite = useCallback(() => handleFavorite(book, bookStatus), [handleFavorite, book, bookStatus]);

  const ratingAsNumber = parseFloat(reviewForm.rating) || 0;
  const starPickerValue = hoverRating ?? ratingAsNumber;

  const handleStarSelect = useCallback((value) => {
    const ratingValue = parseFloat(value.toFixed(1));
    setReviewForm(prev => ({ ...prev, rating: value.toFixed(1) }));
    setHoverRating(null);
    if (isAuthenticated && book?.isbn) {
      rateBook(book, ratingValue);
    }
  }, [isAuthenticated, book, rateBook]);

  const handleRatingOnly = useCallback(() => {
    requireAuth(() => {
      if (!book?.isbn) return;
      const ratingValue = parseFloat(reviewForm.rating);
      if (!isNaN(ratingValue) && ratingValue >= 0 && ratingValue <= 5) {
        rateBook(book, ratingValue);
      }
    });
  }, [requireAuth, book, reviewForm.rating, rateBook]);

  const handleUnrate = useCallback(() => {
    requireAuth(() => {
      if (!book?.isbn || !window.confirm('Are you sure you want to remove your rating?')) return;
      unrateBook(book.isbn);
      setReviewForm(prev => ({ ...prev, rating: '0' }));
    });
  }, [requireAuth, book, unrateBook]);

  const handleReviewSubmit = useCallback((event) => {
    event.preventDefault();
    
    if (userReview && !isEditingReview) {
      alert('You already have a review for this book. Please edit your existing review or reply to others.');
      return;
    }
    
    let ratingValue = parseFloat(reviewForm.rating);
    if ((isNaN(ratingValue) || ratingValue === 0) && bookStatus.rated && bookStatus.rating) {
      ratingValue = bookStatus.rating;
    }
    
    const hasReviewText = reviewForm.body.trim().length > 0;
    if (!hasReviewText) {
      if (isAuthenticated && book?.isbn) {
        rateBook(book, ratingValue);
      }
      return;
    }

    const userId = isAuthenticated && user ? (user.uid || user.email) : null;
    const createdAt = new Date().toISOString();
    const reviewText = reviewForm.body.trim();
    
    if (isEditingReview && editingReviewId && userReview) {
      const updatedReview = {
        ...userReview,
        rating: ratingValue,
        review: reviewText,
        updatedAt: createdAt,
        relativeTime: toRelativeTime(createdAt)
      };
      
      setUserReviews(prev => prev.map(r => r.id === editingReviewId ? updatedReview : r));
      saveReviewToStorage(updatedReview, book.isbn);
      
      if (isAuthenticated) {
        rateBook(book, ratingValue);
        reviewBook(book, reviewText);
      }
      
      setIsEditingReview(false);
      setEditingReviewId(null);
    } else {
      if (userReview) {
        alert('You already have a review for this book. Please edit your existing review.');
        return;
      }
      
      const entry = {
        id: `user-${Date.now()}-${book.isbn}`,
        bookIsbn: book.isbn,
        userId,
        reviewer: isAuthenticated ? (user?.name || user?.email?.split('@')[0] || 'You') : 'Reader',
        rating: ratingValue,
        review: reviewText,
        likes: 0,
        createdAt,
        relativeTime: toRelativeTime(createdAt),
        replies: []
      };
      
      setUserReviews(prev => [entry, ...prev]);
      saveReviewToStorage(entry, book.isbn);
      
      if (isAuthenticated) {
        rateBook(book, ratingValue);
        reviewBook(book, reviewText);
      }
    }
    
    setReviewForm({ rating: '0', body: '' });
  }, [userReview, isEditingReview, reviewForm, bookStatus, isAuthenticated, book, user, editingReviewId, rateBook, reviewBook]);

  const handleEditReview = useCallback(() => {
    if (!userReview) return;
    setIsEditingReview(true);
    setEditingReviewId(userReview.id);
    setReviewForm({
      rating: userReview.rating.toFixed(1),
      body: userReview.review || ''
    });
  }, [userReview]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingReview(false);
    setEditingReviewId(null);
    const rating = bookStatus.rated && bookStatus.rating ? bookStatus.rating.toFixed(1) : '0';
    setReviewForm({ rating, body: '' });
  }, [bookStatus]);

  const handleDeleteReview = useCallback(() => {
    if (!userReview || !window.confirm('Are you sure you want to delete your review?')) return;
    
    const preservedRating = userReview.rating || (bookStatus.rated && bookStatus.rating ? bookStatus.rating : null);
    
    setUserReviews(prev => prev.filter(r => r.id !== userReview.id));
    deleteReviewFromStorage(userReview.id, book.isbn);
    
    if (isAuthenticated && book?.isbn) {
      unreviewBook(book.isbn);
      if (preservedRating && preservedRating > 0) {
        rateBook(book, preservedRating);
      }
    }
    
    setIsEditingReview(false);
    setEditingReviewId(null);
    setReviewForm({ 
      rating: preservedRating && preservedRating > 0 ? preservedRating.toFixed(1) : '0', 
      body: '' 
    });
  }, [userReview, bookStatus, isAuthenticated, book, unreviewBook, rateBook]);

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
                <article className="review-entry compact user-review-highlight">
                  <div className="review-badge">
                    <span className="review-rating-chip subtle">{userReview.rating.toFixed(1)}/5</span>
                    <div className="review-stars small" aria-label={`Rated ${userReview.rating} out of 5`}>
                      {buildStarState(userReview.rating).map((state, index) => (
                        <span key={index} className={`star ${state}`}>★</span>
                      ))}
                    </div>
                    <div className="review-action-buttons">
                      <button type="button" className="review-action-btn" onClick={handleEditReview}>
                        Edit
                      </button>
                      <button type="button" className="review-action-btn" onClick={handleDeleteReview}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="review-content">
                    <div className="review-row">
                      <p className="review-author user-review-label">Your Review</p>
                      <span className="review-meta">{userReview.relativeTime}</span>
                    </div>
                    <p className="review-body">{cleanReviewText(userReview.review)}</p>
                    <ReviewActions
                      review={userReview}
                      onToggleThread={reviewInteractions.handleToggleThread}
                      onHeartReview={reviewInteractions.handleHeartReview}
                      heartedReviews={reviewInteractions.heartedReviews}
                    />
                    <ReviewThread
                      review={userReview}
                      {...reviewThreadProps}
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
                        const state = starPickerValue >= value ? 'full' : starPickerValue >= value - 0.5 ? 'half' : 'empty';
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
                        );
                      })}
                    </div>
                    <div className="rating-buttons">
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
                  <div className="submit-buttons">
                    <button
                      type="submit"
                      className="reviews-banner-btn primary"
                      disabled={(!reviewForm.body.trim() && !bookStatus.rated) || (userReview && !isEditingReview)}
                    >
                      {isEditingReview 
                        ? 'Update Review' 
                        : reviewForm.body.trim() 
                          ? 'Post review' 
                          : bookStatus.rated 
                            ? 'Update rating' 
                            : 'Post review'}
                    </button>
                    {isEditingReview && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="reviews-banner-btn secondary"
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
                        onToggleThread={reviewInteractions.handleToggleThread}
                        onHeartReview={reviewInteractions.handleHeartReview}
                        heartedReviews={reviewInteractions.heartedReviews}
                      />
                      <ReviewThread
                        review={review}
                        {...reviewThreadProps}
                      />
                    </div>
                  </article>
            ))}
          </div>
          
          <div className="view-more-reviews">
            <button
              className="view-more-btn"
              onClick={() => navigate(`/book/isbn/${book.isbn}/reviews`)}
            >
              View More Reviews {
                userReviews.length > recentReviews.length 
                  ? `(${userReviews.length - recentReviews.length} more)` 
                  : userReviews.length > 0 
                    ? `(${userReviews.length} total)` 
                    : ''
              }
            </button>
          </div>
        </div>
          </div>
        </section>
      </div>
    </div>
  )
}

