import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Fuse from 'fuse.js'
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
  const librarySectionRef = useRef(null)
  const [filters, setFilters] = useState({
    category: [],
    languages: [],
    age: [],
    availability: [],
    sortBy: null
  })

  useEffect(() => {
    if (location.state) {
      if (location.state.genre) {
        setFilters(prev => ({
          ...prev,
          category: [location.state.genre.toLowerCase()]
        }))
      }
      if (location.state.sortBy) {
        setFilters(prev => ({
          ...prev,
          sortBy: location.state.sortBy
        }))
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
        description: book.description || '', // Include description for fuzzy search
        publisher: book.publisher || null
      }
    })
    
    return mapped
  }, [booksData])

  // fuzzy search on book summaries/descriptions
  const fuse = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return null
    
    return new Fuse(allBooks, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'author', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'genre', weight: 0.1 }
      ],
      threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true, // Search across entire string
      findAllMatches: true
    })
  }, [allBooks])

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
    // Reset filters when search is cleared
    if (!term || term.trim() === '') {
      setFilters({
        category: [],
        languages: [],
        age: [],
        availability: [],
        sortBy: null
      })
    }
  }, [])

  const handleAddToCart = useCallback((book) => {
    // Add to cart functionality - placeholder for future implementation// TODO: Implement cart functionality
    // This would typically add the book to a cart state/API
  }, [])

  const handleFilterChange = useCallback((filterGroup, value, checked) => {
    setFilters(prev => {
      // For sortBy, it's a single value (not an array)
      if (filterGroup === 'sortBy') {
        return {
          ...prev,
          sortBy: checked ? value : null
        }
      }
      
      // For other filters, use array
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

  // Get unique genres from books for dynamic category filters
  const availableGenres = useMemo(() => {
    const genres = new Set()
    allBooks.forEach(book => {
      if (book.genre) {
        const genre = book.genre.toLowerCase().trim()
        if (genre) {
          genres.add(genre)
        }
      }
    })
    return Array.from(genres).sort()
  }, [allBooks])

  // Filter books based on search term and filters - using Fuse.js for fuzzy search
  const filteredBooks = useMemo(() => {
    const searchTermTrimmed = searchTerm.trim()
    const hasCategoryFilter = filters.category.length > 0
    const hasAvailabilityFilter = filters.availability.length > 0
    const hasInStock = filters.availability.includes('in-stock')
    const hasNotInStock = filters.availability.includes('not-in-stock')

    let searchResults = allBooks

    // Use Fuse.js for fuzzy search if search term exists
    if (searchTermTrimmed && fuse) {
      const fuseResults = fuse.search(searchTermTrimmed)
      searchResults = fuseResults.map(result => result.item)
    } else if (searchTermTrimmed) {
      // Fallback to simple search if Fuse.js not initialized
      const lowerSearch = searchTermTrimmed.toLowerCase()
      searchResults = allBooks.filter(book => 
        book.title.toLowerCase().includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch) ||
        book.isbn.includes(searchTermTrimmed) ||
        (book.description && book.description.toLowerCase().includes(lowerSearch))
      )
    }

    // Apply category and availability filters
    let filtered = searchResults.filter(book => {
      // Category filter
      if (hasCategoryFilter) {
        const bookGenre = (book.genre || 'fiction').toLowerCase().trim()
        const matchesCategory = filters.category.some(cat => {
          const catLower = cat.toLowerCase().trim()
          // Handle common variations
          if (catLower === 'fiction' || catLower === 'non-fiction') {
            return bookGenre === catLower || bookGenre.includes(catLower)
          }
          return bookGenre === catLower || bookGenre.includes(catLower) || catLower.includes(bookGenre)
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

    // Apply sorting
    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (filters.sortBy === 'popular') {
          // Sort by rating (highest first)
          return (b.rating || 0) - (a.rating || 0)
        } else if (filters.sortBy === 'new') {
          // Sort by release date (newest first)
          return new Date(b.releaseDate) - new Date(a.releaseDate)
        } else if (filters.sortBy === 'oldest') {
          // Sort by release date (oldest first)
          return new Date(a.releaseDate) - new Date(b.releaseDate)
        } else if (filters.sortBy === 'title') {
          // Sort alphabetically by title
          return a.title.localeCompare(b.title)
        } else if (filters.sortBy === 'author') {
          // Sort alphabetically by author
          return a.author.localeCompare(b.author)
        }
        return 0
      })
    }

    return filtered
  }, [allBooks, searchTerm, filters, fuse])

  // Get trending books (top rated)
  const trendingBooks = useMemo(() => {
    return [...allBooks]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
  }, [allBooks])

  // Scroll to library section when search starts
  useEffect(() => {
    if (searchTerm.trim() && librarySectionRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        librarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [searchTerm])

  return (
    <div className={styles.advancedSearch}>
      <div className={styles.searchHeader}>
        <SearchForm onSearch={handleSearch} />
      </div>
      <main className={styles.mainContent}>
        {!searchTerm.trim() && (
          <TrendingSection books={trendingBooks} onAddToCart={handleAddToCart} />
        )}
        <div ref={librarySectionRef}>
          <LibrarySection 
            books={filteredBooks}
            filters={filters}
            onFilterChange={handleFilterChange}
            onAddToCart={handleAddToCart}
            availableGenres={availableGenres}
          />
        </div>
      </main>
    </div>
  )
}

export default AdvancedSearch

