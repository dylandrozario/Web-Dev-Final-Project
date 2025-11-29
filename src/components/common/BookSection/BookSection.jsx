import { useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaBookmark } from 'react-icons/fa'
import { formatDate } from '../../utils/bookUtils'
import { useUserLibrary } from '../../context/UserLibraryContext'
import './BookSection.css'

function BookSection({ title, books }) {
  const navigate = useNavigate()
  const { favoriteBook, unfavoriteBook, saveBook, unsaveBook, getBookStatus } = useUserLibrary()

  const handleBookClick = useCallback((book) => {
    navigate(`/book/isbn/${book.isbn}`)
  }, [navigate])

  const handleFavorite = useCallback((e, book) => {
    e.stopPropagation()
    const status = getBookStatus(book.isbn)
    if (status.favorite) {
      unfavoriteBook(book.isbn)
    } else {
      favoriteBook(book)
    }
  }, [favoriteBook, unfavoriteBook, getBookStatus])

  const handleSaved = useCallback((e, book) => {
    e.stopPropagation()
    const status = getBookStatus(book.isbn)
    if (status.saved) {
      unsaveBook(book.isbn)
    } else {
      saveBook(book)
    }
  }, [saveBook, unsaveBook, getBookStatus])

  const displayedBooks = useMemo(() => books.slice(0, 8), [books])

  // Memoize formatted dates to avoid recalculation on each render
  const booksWithFormattedDates = useMemo(() => {
    return displayedBooks.map(book => ({
      ...book,
      formattedDate: formatDate(book.releaseDate, { month: 'long', day: 'numeric', year: 'numeric' })
    }))
  }, [displayedBooks])

  if (books.length === 0) return null

  return (
    <section className="book-section">
      <h2 className="section-title">{title}</h2>
      <div className="books-grid">
        {booksWithFormattedDates.map((book) => {
          const status = getBookStatus(book.isbn)
          return (
            <div 
              key={book.isbn || book.id} 
              className="book-card-large"
              onClick={() => handleBookClick(book)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleBookClick(book)
                }
              }}
              aria-label={`View details for ${book.title} by ${book.author}`}
            >
              {book.image && (
                <div className="book-card-cover">
                  <img 
                    src={book.image} 
                    alt={`${book.title} cover`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="book-card-header">
                <h3 className="book-card-title">{book.title}</h3>
                <div className="book-rating">
                  <span className="rating-number">{book.rating.toFixed(1)} / 5</span>
                </div>
              </div>
              <div className="book-card-body">
                <p className="book-card-author">by {book.author}</p>
                <p className="book-card-date">
                  Released: {book.formattedDate}
                </p>
                <p className="book-card-isbn">ISBN: {book.isbn}</p>
                <span className="book-card-genre">{book.genre}</span>
              </div>
              <div className="book-card-actions">
                <button
                  className={`book-action-btn heart-btn ${status.favorite ? 'active' : ''}`}
                  onClick={(e) => handleFavorite(e, book)}
                  aria-label={status.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FaHeart />
                </button>
                <button
                  className={`book-action-btn bookmark-btn ${status.saved ? 'active' : ''}`}
                  onClick={(e) => handleSaved(e, book)}
                  aria-label={status.saved ? 'Remove from saved' : 'Save book'}
                >
                  <FaBookmark />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default memo(BookSection)

