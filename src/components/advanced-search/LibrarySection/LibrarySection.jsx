import React from 'react'
import FiltersSidebar from '../FiltersSidebar/FiltersSidebar'
import BooksGrid from '../BooksGrid/BooksGrid'
import styles from './LibrarySection.module.css'

const LibrarySection = ({ books = [], filters, onFilterChange, onAddToCart }) => {
  return (
    <div className={styles.libraryContent}>
      <FiltersSidebar 
        filters={filters} 
        onFilterChange={onFilterChange}
      />
      <BooksGrid 
        books={books} 
        onAddToCart={onAddToCart}
      />
    </div>
  )
}

export default LibrarySection

