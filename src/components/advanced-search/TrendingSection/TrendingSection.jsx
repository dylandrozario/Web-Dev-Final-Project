import React from 'react'
import BookCard from '../BookCard/BookCard'
import styles from './TrendingSection.module.css'

const TrendingSection = ({ books = [], onAddToCart }) => {
  if (books.length === 0) {
    return null
  }

  return (
    <section className={styles.trendingSection}>
      <div className={styles.trendingContainer}>
        <div className={styles.trendingHeader}>
          <h2 className={styles.trendingTitle}>New & Trending</h2>
          <p className={styles.trendingSubtitle}>Explore new worlds from Authors</p>
        </div>
        <div className={styles.trendingBooksScroll}>
          {books.map((book, index) => (
            <BookCard 
              key={book.id || book.isbn || index} 
              book={book} 
              onAddToCart={onAddToCart}
              variant="scroll"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrendingSection

