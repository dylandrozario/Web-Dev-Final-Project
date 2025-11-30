import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaBookmark } from 'react-icons/fa'
import { useBookActions } from '../../../hooks/useBookActions'
import styles from './BookCard.module.css'

const BookCard = ({ book, variant = 'grid' }) => {
  const navigate = useNavigate()
  const { handleSave, handleFavorite, getBookStatus } = useBookActions()

  const handleCardClick = useCallback(() => {
    navigate(`/book/isbn/${book.isbn}`)
  }, [navigate, book.isbn])

  const status = getBookStatus(book.isbn)

  const onFavorite = useCallback((e) => {
    e.stopPropagation()
    handleFavorite(book, status)
  }, [handleFavorite, book, status])

  const onSaved = useCallback((e) => {
    e.stopPropagation()
    handleSave(book, status)
  }, [handleSave, book, status])

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
            onClick={onFavorite}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
          <button
            className={`${styles.bookActionBtn} ${styles.bookmarkBtn} ${saved ? styles.active : ''}`}
            onClick={onSaved}
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
        </div>
      </div>
    </article>
  )
}

export default BookCard

