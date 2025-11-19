import React from 'react'
import styles from './BookCard.module.css'

const BookCard = ({ book, onAddToCart, variant = 'grid' }) => {
  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(book)
    }
  }

  return (
    <article className={variant === 'grid' ? styles.bookCardGrid : styles.bookCard}>
      <div className={styles.bookCover}></div>
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

