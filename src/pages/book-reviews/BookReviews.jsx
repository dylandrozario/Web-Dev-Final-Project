import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import APP_CONFIG from '../../config/constants'
import BookFilterModal from '../../components/filters/BookFilterModal'
import TopFilterModal from '../../components/filters/TopFilterModal'
import TimeRangeModal from '../../components/filters/TimeRangeModal'
import { useBooks } from '../../context/BooksContext'
import { useAuth } from '../../context/AuthContext'
import './BookReviews.css'

function BookReviews() {
  const navigate = useNavigate()
  const { books: booksData } = useBooks()
  const { isAuthenticated, user } = useAuth()
  const [timeFilter, setTimeFilter] = useState('all-time')
  const [viewMode, setViewMode] = useState('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [genreFilter, setGenreFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isTopModalOpen, setIsTopModalOpen] = useState(false)
  const [isTimeRangeModalOpen, setIsTimeRangeModalOpen] = useState(false)
  const [selectedBookFormat, setSelectedBookFormat] = useState(null)
  const [selectedTopOption, setSelectedTopOption] = useState('Top')
  const [selectedTimeRange, setSelectedTimeRange] = useState('All-time')
  const itemsPerPage = APP_CONFIG.ITEMS_PER_PAGE

  // Generate mock review data for books
  // Using seed-based approach for stable values across renders
  const booksWithReviews = useMemo(() => {
    return booksData.map((book, index) => {
      const baseRating = book.rating || 4.0
      const seed = book.isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index
      const ratingCount = APP_CONFIG.RATING_COUNT_MIN + ((seed * 11) % (APP_CONFIG.RATING_COUNT_MAX - APP_CONFIG.RATING_COUNT_MIN + 1))
      const reviewCount = Math.floor(ratingCount * 0.01) + APP_CONFIG.REVIEW_COUNT_MIN + ((seed * 7) % (APP_CONFIG.REVIEW_COUNT_MAX - APP_CONFIG.REVIEW_COUNT_MIN + 1))
      const calculatedRating = baseRating + ((seed % 10 - 5) * 0.05)
      const formattedRating = Math.max(0, Math.min(5.0, calculatedRating)).toFixed(2)
      
      return {
        ...book,
        id: index + 1,
        rating: parseFloat(formattedRating),
        ratingCount,
        reviewCount,
        formattedRatingCount: ratingCount >= 1000 ? `${(ratingCount / 1000).toFixed(0)}k` : ratingCount.toString()
      }
    })
  }, [booksData])

  // Memoize current year to avoid recalculation
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  // Filter books by time period
  const filteredByTime = useMemo(() => {
    if (timeFilter === 'all-time') return booksWithReviews
    
    let startYear, endYear
    
    // Handle custom range format: "2020-2024"
    if (timeFilter.includes('-') && !timeFilter.includes('s')) {
      const parts = timeFilter.split('-')
      if (parts.length === 2) {
        startYear = parseInt(parts[0])
        endYear = parseInt(parts[1])
        if (isNaN(startYear) || isNaN(endYear)) {
          return booksWithReviews
        }
      } else {
        return booksWithReviews
      }
    } else if (timeFilter.includes('s')) {
      // Decade filter (e.g., "2020s")
      const decade = parseInt(timeFilter.replace('s', ''))
      if (isNaN(decade)) return booksWithReviews
      startYear = decade
      endYear = decade + 9
    } else {
      // Single year filter
      const year = parseInt(timeFilter)
      if (isNaN(year)) return booksWithReviews
      startYear = year
      endYear = year
    }
    
    return booksWithReviews.filter(book => {
      if (!book.releaseDate) return false
      const bookYear = new Date(book.releaseDate).getFullYear()
      if (isNaN(bookYear)) return false
      return bookYear >= startYear && bookYear <= endYear
    })
  }, [booksWithReviews, timeFilter, currentYear])

  // Filter by genre and search
  const filteredBooks = useMemo(() => {
    let filtered = filteredByTime
    
    if (genreFilter) {
      filtered = filtered.filter(book => 
        book.genre?.toLowerCase().includes(genreFilter.toLowerCase())
      )
    }
    
    if (searchFilter) {
      const lowerSearch = searchFilter.toLowerCase()
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch) ||
        book.genre?.toLowerCase().includes(lowerSearch)
      )
    }
    
    return filtered
  }, [filteredByTime, genreFilter, searchFilter])

  // Sort books based on selected top option
  const sortedBooks = useMemo(() => {
    let sorted = [...filteredBooks]
    
    switch (selectedTopOption) {
      case 'Popular':
        // Sort by number of ratings (most ratings first)
        sorted.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
        break
      
      case 'Esoteric':
        // Sort by rating first, then by fewer ratings (high rating but less known)
        // Calculate esoteric score: rating * (1 / log(ratingCount + 1))
        sorted.sort((a, b) => {
          const aRating = a.rating || 0
          const bRating = b.rating || 0
          const aCount = a.ratingCount || 1
          const bCount = b.ratingCount || 1
          
          // Esoteric score: higher rating with fewer ratings gets higher score
          const aScore = aRating * (1 / Math.log(aCount + 1))
          const bScore = bRating * (1 / Math.log(bCount + 1))
          
          return bScore - aScore
        })
        break
      
      case 'Diverse':
        // Limit to one book per author (highest rated), then sort by rating
        const authorMap = new Map()
        filteredBooks.forEach(book => {
          const author = (book.author?.toLowerCase() || 'unknown').trim()
          if (!authorMap.has(author)) {
            // First occurrence - add it
            authorMap.set(author, book)
          } else {
            // Already have a book by this author - keep the one with higher rating
            const existingBook = authorMap.get(author)
            if ((book.rating || 0) > (existingBook.rating || 0)) {
              authorMap.set(author, book)
            }
          }
        })
        sorted = Array.from(authorMap.values())
        // Sort by rating after limiting to one per author
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      
      case 'Top':
      default:
        // Sort by rating (highest first)
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }
    
    return sorted
  }, [filteredBooks, selectedTopOption])

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage)
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedBooks.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedBooks, currentPage])

  const handleTimeFilter = useCallback((filter) => {
    setTimeFilter(filter)
    setCurrentPage(1)
    // Update selectedTimeRange to match the filter for display consistency
    if (filter === 'all-time') {
      setSelectedTimeRange('All-time')
    } else if (filter.includes('s')) {
      // Decade format - keep as is for display
      setSelectedTimeRange(filter)
    } else if (filter.includes('-')) {
      // Custom range - keep as is
      setSelectedTimeRange(filter)
    } else {
      // Single year - format for display
      const year = parseInt(filter)
      const currentYear = new Date().getFullYear()
      if (year === currentYear) {
        setSelectedTimeRange('This Year')
      } else if (year === currentYear - 1) {
        setSelectedTimeRange('Last Year')
      } else {
        setSelectedTimeRange(filter)
      }
    }
  }, [])

  const handleGenreFilter = useCallback((genre) => {
    setGenreFilter(genre)
    setCurrentPage(1)
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchFilter(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleBookFormatSelect = useCallback((format) => {
    setSelectedBookFormat(format)
    setCurrentPage(1)
  }, [])

  const handleTopOptionSelect = useCallback((option) => {
    setSelectedTopOption(option)
    setCurrentPage(1)
  }, [])

  const handleTimeRangeSelect = useCallback((range) => {
    setCurrentPage(1)
    // Update timeFilter based on selected range
    if (range === 'All-time') {
      setTimeFilter('all-time')
      setSelectedTimeRange('All-time')
    } else if (range === 'This Year') {
      const currentYear = new Date().getFullYear().toString()
      setTimeFilter(currentYear)
      setSelectedTimeRange('This Year')
    } else if (range === 'Last Year') {
      const lastYear = (new Date().getFullYear() - 1).toString()
      setTimeFilter(lastYear)
      setSelectedTimeRange('Last Year')
    } else if (range.includes('-')) {
      // Custom range format: "2020-2024" - keep the full range format
      setTimeFilter(range)
      // Format for display: "2020-2024"
      setSelectedTimeRange(range)
    } else {
      // Fallback to all-time if unknown format
      setTimeFilter('all-time')
      setSelectedTimeRange('All-time')
    }
  }, [])

  const getGenres = useMemo(() => {
    const genres = new Set()
    booksWithReviews.forEach(book => {
      if (book.genre) {
        genres.add(book.genre)
      }
    })
    return Array.from(genres).sort()
  }, [booksWithReviews])

  return (
    <div className="book-reviews-page">
      <div className="reviews-container">
        {/* Top Header */}
        <div className="reviews-header">
          <h1 className="reviews-title">Top books of all time</h1>
          <div className="reviews-header-icons">
            <button className="header-icon-btn" onClick={() => navigate('/')} title="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>
            <button 
              className="header-icon-btn" 
              title="My Library"
              onClick={() => navigate('/my-library')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button 
              className="recommendations-btn" 
              onClick={() => {
                if (isAuthenticated) {
                  // User is logged in - could navigate to recommendations page or show recommendations
                  // For now, navigate to My Library which shows their saved/rated books
                  navigate('/my-library')
                } else {
                  // User not logged in - navigate to sign in
                  navigate('/sign-in')
                }
              }}
            >
              <div className="recommendations-btn-text">
                <span className="recommendations-btn-title">
                  {isAuthenticated ? 'View My Recommendations' : 'Go to Recommendations'}
                </span>
                <span className="recommendations-btn-subtitle">
                  {isAuthenticated 
                    ? 'See personalized recommendations based on your ratings' 
                    : 'Sign in to see recommendations based on your ratings'}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="reviews-layout">
          {/* Left Column - Main Chart */}
          <div className="reviews-main">
            {/* Time Filter Buttons */}
            <div className="time-filters">
              {['all-time', '2025', '2024', '2023', '2022', '2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s'].map(filter => (
                <button
                  key={filter}
                  className={`time-filter-btn ${timeFilter === filter ? 'active' : ''}`}
                  onClick={() => handleTimeFilter(filter)}
                >
                  {filter === 'all-time' ? 'All time' : filter}
                </button>
              ))}
            </div>

            {/* View Options and Pagination */}
            <div className="view-controls">
              <div className="view-options">
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </button>
              </div>
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="pagination-ellipsis">...</span>
                  }
                  return null
                })}
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Book Chart */}
            <div className={`book-chart ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
              {paginatedBooks.map((book, index) => {
                const rank = (currentPage - 1) * itemsPerPage + index + 1
                return (
                  <div 
                    key={book.isbn || book.id} 
                    className="chart-item"
                    onClick={() => navigate(`/book/isbn/${book.isbn}`)}
                  >
                    <div className="chart-rank">{rank}</div>
                    <div className="chart-cover">
                      {book.image ? (
                        <img src={book.image} alt={book.title} />
                      ) : (
                        <div className="chart-placeholder">
                          <span>{book.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="chart-info">
                      <div className="chart-title">{book.title}</div>
                      <div className="chart-artist">{book.author}</div>
                      <div className="chart-date">
                        {new Date(book.releaseDate).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="chart-genres">
                        {book.genre && (
                          <span className="genre-tag">{book.genre}</span>
                        )}
                      </div>
                    </div>
                    <div className="chart-rating">
                      <div className="rating-star">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff8c00" stroke="#ff8c00">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <span className="rating-value">{book.rating.toFixed(2)}</span>
                      <span className="rating-count">/{book.formattedRatingCount}</span>
                      <span className="review-count">{book.reviewCount}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Filters and Sidebar */}
          <div className="reviews-sidebar">
            {/* Add Filters Section */}
            <div className="sidebar-section" style={{ position: 'relative' }}>
              <h3 className="sidebar-title">Add filters</h3>
              <p className="sidebar-description">
                There are unlimited ways to filter charts: You can make a personalized chart based on any combination of genres, descriptors, countries, languages and more.
              </p>
              <div className="filter-dropdowns" style={{ position: 'relative' }}>
                <div className="filter-select-wrapper" style={{ position: 'relative' }}>
                  <button 
                    className="filter-select filter-select-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsTopModalOpen(true)
                    }}
                  >
                    {selectedTopOption}
                  </button>
                  {isTopModalOpen && (
                    <TopFilterModal
                      isOpen={isTopModalOpen}
                      onClose={() => setIsTopModalOpen(false)}
                      onSelect={handleTopOptionSelect}
                    />
                  )}
                </div>
                <div className="filter-select-wrapper" style={{ position: 'relative' }}>
                  <button 
                    className="filter-select filter-select-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsFilterModalOpen(true)
                    }}
                  >
                    {selectedBookFormat || 'Books'}
                  </button>
                </div>
                <div className="filter-select-wrapper" style={{ position: 'relative' }}>
                  <button 
                    className="filter-select filter-select-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsTimeRangeModalOpen(true)
                    }}
                  >
                    {selectedTimeRange.includes('-') && !selectedTimeRange.includes('s')
                      ? `Custom: ${selectedTimeRange.split('-')[0]}-${selectedTimeRange.split('-')[1]}`
                      : selectedTimeRange}
                  </button>
                  {isTimeRangeModalOpen && (
                    <TimeRangeModal
                      isOpen={isTimeRangeModalOpen}
                      onClose={() => setIsTimeRangeModalOpen(false)}
                      onSelect={handleTimeRangeSelect}
                    />
                  )}
                </div>
                {isFilterModalOpen && (
                  <BookFilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    onSelect={handleBookFormatSelect}
                  />
                )}
              </div>
              <input
                type="text"
                className="filter-search"
                placeholder="Filter this chart by genre, country, language, location or descriptor."
                value={searchFilter}
                onChange={handleSearchChange}
              />
              <div className="update-chart-container">
                <button className="update-chart-btn">Update chart</button>
              </div>
            </div>

            {/* Saved Charts Section */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Saved charts</h3>
              <p className="sidebar-description">
                Press the <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle' }}>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg> icon at the top of the chart to save it here for easy access in the future.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default BookReviews

