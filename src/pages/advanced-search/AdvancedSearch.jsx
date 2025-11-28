import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import TrendingSection from '../../components/advanced-search/TrendingSection/TrendingSection'
import LibrarySection from '../../components/advanced-search/LibrarySection/LibrarySection'
import SearchForm from '../../components/advanced-search/SearchForm/SearchForm'
import { useBooks } from '../../context/BooksContext'
import { naturalLanguageSearch, shouldUseNLSearch, initializeSearchIndex } from '../../utils/nlSearch'
import { generateBookDescription } from '../../utils/bookUtils'
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
    const mapped = booksData.map((book, index) => {
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
        image: book.image,
        publisher: book.publisher,
        description: book.description || generateBookDescription(book)
      }
    })
    
    // Initialize search index when books are loaded
    if (mapped.length > 0) {
      initializeSearchIndex(mapped)
    }
    
    return mapped
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

  // Filter books based on search term and filters - optimized with NL search
  const filteredBooks = useMemo(() => {
    const searchTermTrimmed = searchTerm.trim()
    const hasCategoryFilter = filters.category.length > 0
    const hasAvailabilityFilter = filters.availability.length > 0
    const hasInStock = filters.availability.includes('in-stock')
    const hasNotInStock = filters.availability.includes('not-in-stock')

    // Determine search results
    let searchResults = allBooks
    
    if (searchTermTrimmed) {
      // Use natural language search if appropriate
      if (shouldUseNLSearch(searchTermTrimmed)) {
        const nlResults = naturalLanguageSearch(searchTermTrimmed, allBooks)
        // If NL search found results, use them; otherwise fall back to simple search
        if (nlResults.length > 0) {
          searchResults = nlResults
        } else {
          // Fallback to simple search
          const lowerSearch = searchTermTrimmed.toLowerCase()
          searchResults = allBooks.filter(book => 
            book.title.toLowerCase().includes(lowerSearch) ||
            book.author.toLowerCase().includes(lowerSearch) ||
            book.isbn.includes(searchTermTrimmed)
          )
        }
      } else {
        // Simple exact/partial match for short queries
        const lowerSearch = searchTermTrimmed.toLowerCase()
        searchResults = allBooks.filter(book => 
          book.title.toLowerCase().includes(lowerSearch) ||
          book.author.toLowerCase().includes(lowerSearch) ||
          book.isbn.includes(searchTermTrimmed)
        )
      }
      
      // Additional validation: ensure results actually contain the search term
      // This filters out any false positives from fuzzy matching
      // Description is now a primary search field
      const lowerSearch = searchTermTrimmed.toLowerCase()
      const searchWords = lowerSearch.split(/\s+/).filter(w => w.length > 0)
      
      searchResults = searchResults.filter(book => {
        const title = (book.title || '').toLowerCase()
        const author = (book.author || '').toLowerCase()
        const genre = (book.genre || '').toLowerCase()
        const description = (book.description || '').toLowerCase()
        const combined = `${title} ${author} ${genre} ${description}`.toLowerCase()
        
        // For single word queries, check if it appears in any field including description
        if (searchWords.length === 1) {
          return title.includes(searchWords[0]) || 
                 author.includes(searchWords[0]) || 
                 genre.includes(searchWords[0]) ||
                 description.includes(searchWords[0])
        }
        
        // For multi-word queries, at least one word must match in any field including description
        return searchWords.some(word => 
          description.includes(word) ||
          title.includes(word) || 
          author.includes(word) || 
          genre.includes(word)
        )
      })
    }

    // Apply filters to search results
    return searchResults.filter(book => {
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

