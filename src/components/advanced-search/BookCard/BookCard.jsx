import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaBookmark } from 'react-icons/fa'
import { useUserLibrary } from '../../../context/UserLibraryContext'
import styles from './BookCard.module.css'

const BookCard = ({ book, onAddToCart, variant = 'grid' }) => {
  const navigate = useNavigate()
  const { favoriteBook, unfavoriteBook, saveBook, unsaveBook, getBookStatus } = useUserLibrary()

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(book)
    }
  }, [book, onAddToCart])

  const handleCardClick = useCallback(() => {
    navigate(`/book/isbn/${book.isbn}`)
  }, [navigate, book.isbn])

  const handleFavorite = useCallback((e) => {
    e.stopPropagation()
    const status = getBookStatus(book.isbn)
    if (status.favorite) {
      unfavoriteBook(book.isbn)
    } else {
      favoriteBook(book)
    }
  }, [favoriteBook, unfavoriteBook, getBookStatus, book])

  const handleSaved = useCallback((e) => {
    e.stopPropagation()
    const status = getBookStatus(book.isbn)
    if (status.saved) {
      unsaveBook(book.isbn)
    } else {
      saveBook(book)
    }
  }, [saveBook, unsaveBook, getBookStatus, book])

  const status = getBookStatus(book.isbn)
  const favorited = status.favorite
  const saved = status.saved

  return (
    <article 
      className={variant === 'grid' ? styles.bookCardGrid : styles.bookCard}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label={`View details for ${book.title} by ${book.author}`}
    >
      <div className={styles.bookCover}>
        {book.image ? (
          <img 
            src={book.image} 
            alt={`${book.title} cover`}
            className={styles.bookCoverImage}
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          />
        ) : (
          <div className={styles.bookCoverPlaceholder}>
            <span>{book.title?.charAt(0) || '?'}</span>
          </div>
        )}
        <div className={styles.bookActions}>
          <button
            className={`${styles.bookActionBtn} ${styles.heartBtn} ${favorited ? styles.active : ''}`}
            onClick={handleFavorite}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
          <button
            className={`${styles.bookActionBtn} ${styles.bookmarkBtn} ${saved ? styles.active : ''}`}
            onClick={handleSaved}
            aria-label={saved ? 'Remove from saved' : 'Save book'}
          >
            <FaBookmark />
          </button>
        </div>
      </div>
      <div className={styles.bookInfo}>
        <h3 className={styles.bookTitle}>{book.title || 'Book Title'}</h3>
        <p className={styles.bookAuthor}>{book.author || 'Author Name'}</p>
        <div className={styles.bookAvailabilityRow}>
          <span className={styles.bookAvailability}>Availability: {book.availability || 1}</span>
          {onAddToCart && (
            <button 
              className={styles.addToCartIcon}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              +
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default BookCard

