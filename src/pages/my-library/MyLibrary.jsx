import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useUserLibrary } from '../../context/UserLibraryContext'
import { useBooks } from '../../context/BooksContext'
import './MyLibrary.css'

export default function MyLibrary() {
  const [activeFilter, setActiveFilter] = useState('all')
  const navigate = useNavigate()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const { getAllBooks } = useUserLibrary()
  const { books: allBooks, loading: booksLoading } = useBooks()

  // Get user's library books and merge with full book data
  const userLibraryBooks = useMemo(() => {
    try {
      return getAllBooks() || []
    } catch (error) {
      console.error('Error getting user library books:', error)
      return []
    }
  }, [getAllBooks])

  const libraryBooksWithDetails = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return []
    
    return userLibraryBooks.map(libBook => {
      // Find full book details by ISBN
      const fullBook = allBooks.find(b => b.isbn === libBook.isbn)
      if (!fullBook) return null

      // Determine tag based on status priority
      let tag = ''
      if (libBook.favorite) tag = 'Favorite'
      else if (libBook.reviewed) tag = 'Reviewed'
      else if (libBook.saved) tag = 'Saved'
      else if (libBook.rated) tag = 'Rated'

      // Merge book data, ensuring user's library data (rating, review, etc.) takes precedence over catalog data
      // The spread order ensures libBook properties override fullBook properties
      // But we explicitly preserve user-specific fields to be safe
      return {
        ...fullBook,
        ...libBook,
        // Explicitly preserve user's rating and review to ensure they override catalog data
        // Use user's rating if it exists, otherwise fall back to catalog rating
        rating: libBook.rated && libBook.rating !== undefined && libBook.rating !== null 
          ? libBook.rating 
          : fullBook.rating,
        // Use user's ratingLabel if it exists (it should be set when rating is saved)
        ratingLabel: libBook.ratingLabel || '—',
        review: libBook.review,
        tag,
        id: libBook.isbn
      }
    }).filter(Boolean)
  }, [userLibraryBooks, allBooks])

  const filteredBooks = useMemo(() => {
    return libraryBooksWithDetails.filter((book) => {
      if (activeFilter === 'saved') return book.saved
      if (activeFilter === 'favorite') return book.favorite
      if (activeFilter === 'rated') return book.rated
      if (activeFilter === 'reviewed') return book.reviewed
      return true
    })
  }, [libraryBooksWithDetails, activeFilter])

  const stats = useMemo(() => {
    const favorites = libraryBooksWithDetails.filter((b) => b.favorite).length
    const saved = libraryBooksWithDetails.filter((b) => b.saved).length
    const rated = libraryBooksWithDetails.filter((b) => b.rated)
    const reviewed = libraryBooksWithDetails.filter((b) => b.reviewed).length

    const avgRating =
      rated.length > 0
        ? Math.max(0, Math.min(5.0, (
            rated.reduce((sum, b) => {
              const rating = Math.min(5, Math.max(0, b.rating || 0))
              return sum + rating
            }, 0) / rated.length
          ))).toFixed(1)
        : '0.0'

    // Calculate favorite genre
    const genreCounts = {}
    libraryBooksWithDetails.forEach(book => {
      if (book.genre) {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1
      }
    })
    const favoriteGenre = Object.keys(genreCounts).length > 0
      ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
      : '—'

    return {
      favorites: favorites || 0,
      savedBooks: saved || 0,
      averageRating: avgRating,
      favoriteGenre: favoriteGenre
    }
  }, [libraryBooksWithDetails])

  // Show loading state
  if (authLoading || booksLoading) {
    return (
      <div className="my-library-page">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
          <p>Loading your library...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="my-library-page my-library-locked">
        <section className="locked-panel">
          <p className="locked-eyebrow">Private stacks</p>
          <h1>Sign in to view My Library</h1>
          <p className="locked-description">
            Keep your saved shelves, ratings, and reviews in sync across devices. Sign in with your catalog credentials to continue curating.
          </p>
          <div className="locked-actions">
            <button
              className="locked-primary-btn"
              onClick={() => navigate('/sign-in', { state: { from: '/my-library' } })}
            >
              Access My Library
            </button>
            <button
              className="locked-secondary-btn"
              onClick={() => navigate('/resources')}
            >
              Browse resources
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="my-library-page">
      {/* Header Section */}
      <div className="my-library-header">
        <h1 className="my-library-title">My Library</h1>
        <p className="my-library-subtitle">
          View your saved books, favorites, ratings, and reading patterns in one place.
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="my-library-stats">
        <div className="stat-card">
          <p className="stat-label">Favorites</p>
          <p className="stat-value">{stats.favorites}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Saved Books</p>
          <p className="stat-value">{stats.savedBooks}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Average Rating</p>
          <p className="stat-value">{stats.averageRating}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Favorite Genre</p>
          <p className="stat-value">{stats.favoriteGenre}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="my-library-filters">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${activeFilter === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveFilter('saved')}
        >
          Saved
        </button>
        <button
          className={`filter-btn ${activeFilter === 'favorite' ? 'active' : ''}`}
          onClick={() => setActiveFilter('favorite')}
        >
          Favorites
        </button>
        <button
          className={`filter-btn ${activeFilter === 'rated' ? 'active' : ''}`}
          onClick={() => setActiveFilter('rated')}
        >
          Rated
        </button>
        <button
          className={`filter-btn ${activeFilter === 'reviewed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('reviewed')}
        >
          Reviewed
        </button>
      </div>

      {/* Book Cards Grid */}
      <div className="my-library-books-grid">
        {filteredBooks.map((book) => (
          <div
            key={book.isbn}
            className="my-library-book-card"
            onClick={() => navigate(`/book/isbn/${book.isbn}`)}
          >
            {book.tag && (
              <div className="book-card-tag">{book.tag}</div>
            )}
            <h3 className="book-card-title">{book.title}</h3>
            <p className="book-card-author">{book.author}</p>
            {book.rated && book.rating && (
              <div className="book-card-rating">
                <span className="rating-value">Your Rating: {book.rating.toFixed(1)} / 5</span>
                {book.ratingLabel && book.ratingLabel !== '—' && (
                  <span className="rating-stars">{book.ratingLabel}</span>
                )}
              </div>
            )}
            {book.reviewed && book.review && (
              <div className="book-card-review">
                <p className="review-label">Your Review:</p>
                <p className="review-text">{book.review}</p>
              </div>
            )}
            {!book.reviewed && (
              <p className="book-card-description">{book.description || 'No description available.'}</p>
            )}
            <div className="book-card-badges">
              {book.saved && <span className="book-badge">Saved</span>}
              {book.favorite && <span className="book-badge">Favorite</span>}
              {book.rated && <span className="book-badge">Rated</span>}
              {book.reviewed && <span className="book-badge">Reviewed</span>}
            </div>
          </div>
        ))}

        {filteredBooks.length === 0 && (
          <div className="my-library-empty">
            <p>No books match this filter yet.</p>
            <p>Start by saving or favoriting books from the catalog!</p>
          </div>
        )}
      </div>
    </div>
  )
}
