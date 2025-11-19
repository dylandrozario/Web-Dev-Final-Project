import React, { useState, useCallback, useMemo } from 'react'
import booksData from '../data/books.json'
import TrendingSection from '../components/advanced-search/TrendingSection/TrendingSection'
import LibrarySection from '../components/advanced-search/LibrarySection/LibrarySection'
import SearchForm from '../components/advanced-search/SearchForm/SearchForm'
import styles from './AdvancedSearch.module.css'

function AdvancedSearch() {
  const [cartCount, setCartCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: [],
    languages: [],
    age: [],
    availability: []
  })

  // Map books data to include availability and normalize genre
  const allBooks = useMemo(() => {
    return booksData.map((book, index) => ({
      id: index + 1,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre?.toLowerCase() || 'fiction',
      availability: Math.floor(Math.random() * 5) + 1, // Mock availability
      rating: book.rating,
      releaseDate: book.releaseDate
    }))
  }, [])

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
  }, [])

  const handleAddToCart = useCallback((book) => {
    setCartCount(prev => prev + 1)
    console.log('Added to cart:', book)
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

  // Filter books based on search term and filters
  const filteredBooks = useMemo(() => {
    let filtered = allBooks

    // Apply search term filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch) ||
        book.isbn.includes(searchTerm)
      )
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(book => {
        const bookGenre = book.genre || 'fiction'
        return filters.category.some(cat => {
          if (cat === 'fiction') return bookGenre === 'fiction'
          if (cat === 'non-fiction') return bookGenre === 'non-fiction'
          return bookGenre === cat
        })
      })
    }

    // Apply availability filter
    if (filters.availability.length > 0) {
      filtered = filtered.filter(book => {
        if (filters.availability.includes('in-stock')) {
          return book.availability > 0
        }
        if (filters.availability.includes('not-in-stock')) {
          return book.availability === 0
        }
        return true
      })
    }

    // Note: languages and age filters are available in the UI but not yet implemented
    // in the filtering logic as the books data doesn't include these fields yet

    return filtered
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
        <h1 className={styles.pageTitle}>Advanced Search</h1>
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

