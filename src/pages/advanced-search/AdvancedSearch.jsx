import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import TrendingSection from '../../components/advanced-search/TrendingSection/TrendingSection'
import LibrarySection from '../../components/advanced-search/LibrarySection/LibrarySection'
import SearchForm from '../../components/advanced-search/SearchForm/SearchForm'
import { useBooks } from '../../context/BooksContext'
import styles from './AdvancedSearch.module.css'

function AdvancedSearch() {
  const location = useLocation()
  const { books: booksData } = useBooks()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: [],
    languages: [],
    age: [],
    availability: []
  })

  // Handle state passed from navigation (e.g., footer links)
  useEffect(() => {
    if (location.state) {
      if (location.state.genre) {
        setFilters(prev => ({
          ...prev,
          category: [location.state.genre.toLowerCase()]
        }))
      }
      if (location.state.sortBy) {
        // Could implement sorting logic here
      }
    }
  }, [location.state])

  // Map books data to include availability and normalize genre
  // Using a seed-based approach for consistent availability values
  const allBooks = useMemo(() => {
    return booksData.map((book, index) => {
      // Generate consistent availability based on index (not random)
      const seed = index * 7 + 3
      const availability = (seed % 5) + 1
      
      return {
        id: index + 1,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre?.toLowerCase() || 'fiction',
        availability, // Consistent mock availability
        rating: book.rating,
        releaseDate: book.releaseDate,
        image: book.image
      }
    })
  }, [booksData])

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
  }, [])

  const handleAddToCart = useCallback((book) => {
    // Add to cart functionality - placeholder for future implementation// TODO: Implement cart functionality
    // This would typically add the book to a cart state/API
  }, [])

  const handleFilterChange = useCallback((filterGroup, value, checked) => {
    setFilters(prev => {
      const currentFilters = prev[filterGroup] || []
      const newFilters = checked
        ? [...currentFilters, value]
        : currentFilters.filter(f => f !== value)
      
      return {
        ...prev,
        [filterGroup]: newFilters
      }
    })
  }, [])

  // Filter books based on search term and filters - optimized single pass
  const filteredBooks = useMemo(() => {
    const searchTermTrimmed = searchTerm.trim()
    const lowerSearch = searchTermTrimmed ? searchTermTrimmed.toLowerCase() : ''
    const hasCategoryFilter = filters.category.length > 0
    const hasAvailabilityFilter = filters.availability.length > 0
    const hasInStock = filters.availability.includes('in-stock')
    const hasNotInStock = filters.availability.includes('not-in-stock')

    // Single pass filter for better performance
    return allBooks.filter(book => {
      // Search filter
      if (lowerSearch) {
        const matchesSearch = 
          book.title.toLowerCase().includes(lowerSearch) ||
          book.author.toLowerCase().includes(lowerSearch) ||
          book.isbn.includes(searchTermTrimmed)
        if (!matchesSearch) return false
      }

      // Category filter
      if (hasCategoryFilter) {
        const bookGenre = book.genre || 'fiction'
        const matchesCategory = filters.category.some(cat => {
          if (cat === 'fiction') return bookGenre === 'fiction'
          if (cat === 'non-fiction') return bookGenre === 'non-fiction'
          return bookGenre === cat
        })
        if (!matchesCategory) return false
      }

      // Availability filter
      if (hasAvailabilityFilter) {
        if (hasInStock && book.availability === 0) return false
        if (hasNotInStock && book.availability > 0) return false
      }

      return true
    })
  }, [allBooks, searchTerm, filters])

  // Get trending books (top rated)
  const trendingBooks = useMemo(() => {
    return [...allBooks]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
  }, [allBooks])

  return (
    <div className={styles.advancedSearch}>
      <div className={styles.searchHeader}>
        <SearchForm onSearch={handleSearch} />
      </div>
      <main className={styles.mainContent}>
        <TrendingSection books={trendingBooks} onAddToCart={handleAddToCart} />
        <LibrarySection 
          books={filteredBooks}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddToCart={handleAddToCart}
        />
      </main>
    </div>
  )
}

export default AdvancedSearch

