import FiltersSidebar from '../FiltersSidebar/FiltersSidebar'
import BooksGrid from '../BooksGrid/BooksGrid'
import styles from './LibrarySection.module.css'

const LibrarySection = ({ books = [], filters, onFilterChange, availableGenres = [] }) => {
  return (
    <div className={styles.libraryContent}>
      <FiltersSidebar 
        filters={filters} 
        onFilterChange={onFilterChange}
        availableGenres={availableGenres}
      />
      <BooksGrid 
        books={books} 
      />
    </div>
  )
}

export default LibrarySection

