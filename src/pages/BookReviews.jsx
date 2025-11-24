import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import booksData from '../data/books.json'
import BookFilterModal from '../components/BookFilterModal'
import TopFilterModal from '../components/TopFilterModal'
import TimeRangeModal from '../components/TimeRangeModal'
import './BookReviews.css'

function BookReviews() {
  const navigate = useNavigate()
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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [userRatingsFilters, setUserRatingsFilters] = useState({
    following: false,
    followers: false,
    myself: false,
    others: false
  })
  const [excludeFilters, setExcludeFilters] = useState({
    rated: false,
    cataloged: false,
    wishlisted: false
  })
  const itemsPerPage = 25

  // Generate mock review data for books
  const booksWithReviews = useMemo(() => {
    return booksData.map((book, index) => {
      const baseRating = book.rating || 4.0
      const ratingCount = Math.floor(Math.random() * 50000) + 1000 // 1k to 51k ratings
      const reviewCount = Math.floor(ratingCount * 0.01) + Math.floor(Math.random() * 100) // ~1% of ratings
      const formattedRating = (baseRating + (Math.random() * 0.5 - 0.25)).toFixed(2)
      
      return {
        ...book,
        id: index + 1,
        rating: parseFloat(formattedRating),
        ratingCount,
        reviewCount,
        formattedRatingCount: ratingCount >= 1000 ? `${(ratingCount / 1000).toFixed(0)}k` : ratingCount.toString()
      }
    })
  }, [])

  // Filter books by time period
  const filteredByTime = useMemo(() => {
    if (timeFilter === 'all-time') return booksWithReviews
    
    const currentYear = new Date().getFullYear()
    let startYear, endYear
    
    if (timeFilter.includes('s')) {
      // Decade filter (e.g., "2020s")
      const decade = parseInt(timeFilter.replace('s', ''))
      startYear = decade
      endYear = decade + 9
    } else {
      // Year filter
      const year = parseInt(timeFilter)
      startYear = year
      endYear = year
    }
    
    return booksWithReviews.filter(book => {
      const bookYear = new Date(book.releaseDate).getFullYear()
      return bookYear >= startYear && bookYear <= endYear
    })
  }, [booksWithReviews, timeFilter])

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

  // Sort by rating (highest first)
  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => b.rating - a.rating)
  }, [filteredBooks])

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage)
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedBooks.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedBooks, currentPage])

  const handleTimeFilter = useCallback((filter) => {
    setTimeFilter(filter)
    setCurrentPage(1)
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
    setSelectedTimeRange(range)
    setCurrentPage(1)
    // Update timeFilter based on selected range
    if (range === 'All-time') {
      setTimeFilter('all-time')
    } else if (range === 'This Year') {
      setTimeFilter(new Date().getFullYear().toString())
    } else if (range === 'Last Year') {
      setTimeFilter((new Date().getFullYear() - 1).toString())
    } else if (range.includes('-')) {
      // Custom range format: "2020-2024"
      const [startYear, endYear] = range.split('-')
      // For now, use the end year as the filter
      setTimeFilter(endYear)
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
            <button className="header-icon-btn" title="Folder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button className="header-icon-btn" title="Bookmark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button className="recommendations-btn" onClick={() => navigate('/sign-in')}>
              <div className="recommendations-btn-text">
                <span className="recommendations-btn-title">Go to Recommendations</span>
                <span className="recommendations-btn-subtitle">Sign in to see recommendations based on your ratings</span>
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
                <button className="view-btn" title="Weekly">
                  Weekly: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </button>
                <button className="view-btn" title="Daily">
                  Daily: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </button>
                <button className="view-btn settings-btn" title="Settings">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
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
            <div className="book-chart">
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
                      <div className="chart-platforms">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
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
                    {selectedTimeRange}
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
              <a 
                href="#" 
                className="advanced-options-link" 
                onClick={(e) => {
                  e.preventDefault()
                  setShowAdvancedOptions(!showAdvancedOptions)
                }}
              >
                {showAdvancedOptions ? 'Hide advanced options' : 'Show advanced options'}
              </a>

              {/* Advanced Options Section */}
              {showAdvancedOptions && (
                <div className="advanced-options-section">
                  {/* Only include ratings from users */}
                  <div className="advanced-option-group">
                    <h4 className="advanced-option-title">Only include ratings from users...</h4>
                    <div className="advanced-checkbox-group">
                      <label className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={userRatingsFilters.following}
                          onChange={(e) => setUserRatingsFilters(prev => ({ ...prev, following: e.target.checked }))}
                        />
                        <span>I'm following</span>
                      </label>
                      <label className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={userRatingsFilters.followers}
                          onChange={(e) => setUserRatingsFilters(prev => ({ ...prev, followers: e.target.checked }))}
                        />
                        <span>My followers</span>
                      </label>
                      <label className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={userRatingsFilters.myself}
                          onChange={(e) => setUserRatingsFilters(prev => ({ ...prev, myself: e.target.checked }))}
                        />
                        <span>Myself</span>
                      </label>
                      <label className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={userRatingsFilters.others}
                          onChange={(e) => setUserRatingsFilters(prev => ({ ...prev, others: e.target.checked }))}
                        />
                        <span>Others</span>
                      </label>
                    </div>
                  </div>

                  {/* Exclude releases that I have */}
                  <div className="advanced-option-group">
                    <h4 className="advanced-option-title">Exclude releases that I have:</h4>
                    <div className="advanced-checkbox-group">
                      <label className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={excludeFilters.rated}
                          onChange={(e) => setExcludeFilters(prev => ({ ...prev, rated: e.target.checked }))}
                        />
                        <span>Rated</span>
                      </label>
                      <label className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={excludeFilters.cataloged}
                          onChange={(e) => setExcludeFilters(prev => ({ ...prev, cataloged: e.target.checked }))}
                        />
                        <span>Cataloged</span>
                      </label>
                      <label className="advanced-checkbox">
                        <input
                          type="checkbox"
                          checked={excludeFilters.wishlisted}
                          onChange={(e) => setExcludeFilters(prev => ({ ...prev, wishlisted: e.target.checked }))}
                        />
                        <span>Wishlisted</span>
                      </label>
                    </div>
                  </div>

                </div>
              )}

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

