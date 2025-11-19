import React from 'react'
import BookCard from '../BookCard/BookCard'
import styles from './BooksGrid.module.css'

const BooksGrid = ({ books = [], onAddToCart }) => {
  if (books.length === 0) {
    return (
      <div className={styles.booksGrid}>
        <p>No books found. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className={styles.booksGrid}>
      {books.map((book, index) => (
        <BookCard 
          key={book.id || book.isbn || index} 
          book={book} 
          onAddToCart={onAddToCart}
          variant="grid"
        />
      ))}
    </div>
  )
}

export default BooksGrid

