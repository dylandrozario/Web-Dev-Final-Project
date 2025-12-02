import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import APP_CONFIG from '../../config/constants'
import BookFilterModal from '../../components/filters/BookFilterModal'
import TopFilterModal from '../../components/filters/TopFilterModal'
import TimeRangeModal from '../../components/filters/TimeRangeModal'
import { useBooks } from '../../context/BooksContext';
import './BookReviews.css';

function BookReviews() {
  const navigate = useNavigate();
  const { books: booksData } = useBooks();
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

  const booksWithReviews = useMemo(() => {
    return booksData.map((book, index) => {
      const baseRating = book.rating || 4.0;
      const seed = book.isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
      const ratingCount = APP_CONFIG.RATING_COUNT_MIN + ((seed * 11) % (APP_CONFIG.RATING_COUNT_MAX - APP_CONFIG.RATING_COUNT_MIN + 1));
      const reviewCount = Math.floor(ratingCount * 0.01) + APP_CONFIG.REVIEW_COUNT_MIN + ((seed * 7) % (APP_CONFIG.REVIEW_COUNT_MAX - APP_CONFIG.REVIEW_COUNT_MIN + 1));
      const calculatedRating = baseRating + ((seed % 10 - 5) * 0.05);
      const formattedRating = Math.max(0, Math.min(5.0, calculatedRating)).toFixed(2);
      
      return {
        ...book,
        id: index + 1,
        rating: parseFloat(formattedRating),
        ratingCount,
        reviewCount,
        formattedRatingCount: ratingCount >= 1000 ? `${(ratingCount / 1000).toFixed(0)}k` : ratingCount.toString()
      };
    });
  }, [booksData]);

  const parseTimeFilter = useCallback((filter) => {
    if (filter === 'all-time') return null;
    
    if (filter.includes('-') && !filter.includes('s')) {
      const [start, end] = filter.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) return { startYear: start, endYear: end };
    } else if (filter.includes('s')) {
      const decade = parseInt(filter.replace('s', ''));
      if (!isNaN(decade)) return { startYear: decade, endYear: decade + 9 };
    } else {
      const year = parseInt(filter);
      if (!isNaN(year)) return { startYear: year, endYear: year };
    }
    
    return null;
  }, []);

  const filteredByTime = useMemo(() => {
    const range = parseTimeFilter(timeFilter);
    if (!range) return booksWithReviews;
    
    return booksWithReviews.filter(book => {
      if (!book.releaseDate) return false;
      const bookYear = new Date(book.releaseDate).getFullYear();
      return !isNaN(bookYear) && bookYear >= range.startYear && bookYear <= range.endYear;
    });
  }, [booksWithReviews, timeFilter, parseTimeFilter]);

  const filteredBooks = useMemo(() => {
    let filtered = filteredByTime;
    
    if (genreFilter) {
      const lowerGenre = genreFilter.toLowerCase();
      filtered = filtered.filter(book => book.genre?.toLowerCase().includes(lowerGenre));
    }
    
    if (searchFilter) {
      const lowerSearch = searchFilter.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch) ||
        book.genre?.toLowerCase().includes(lowerSearch)
      );
    }
    
    return filtered;
  }, [filteredByTime, genreFilter, searchFilter]);

  const sortBooks = useCallback((books, option) => {
    const sorted = [...books];
    
    switch (option) {
      case 'Popular':
        return sorted.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
      
      case 'Esoteric': {
        const getEsotericScore = (book) => (book.rating || 0) * (1 / Math.log((book.ratingCount || 1) + 1));
        return sorted.sort((a, b) => getEsotericScore(b) - getEsotericScore(a));
      }
      
      case 'Diverse': {
        const authorMap = new Map();
        books.forEach(book => {
          const author = (book.author?.toLowerCase() || 'unknown').trim();
          const existing = authorMap.get(author);
          if (!existing || (book.rating || 0) > (existing.rating || 0)) {
            authorMap.set(author, book);
          }
        });
        return Array.from(authorMap.values()).sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      case 'Top':
      default:
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  }, []);

  const sortedBooks = useMemo(() => {
    return sortBooks(filteredBooks, selectedTopOption);
  }, [filteredBooks, selectedTopOption, sortBooks]);

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBooks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedBooks, currentPage, itemsPerPage]);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const formatTimeRangeDisplay = useCallback((filter) => {
    if (filter === 'all-time') return 'All-time';
    if (filter.includes('s')) return filter;
    if (filter.includes('-')) return filter;
    
    const year = parseInt(filter);
    const currentYear = new Date().getFullYear();
    if (year === currentYear) return 'This Year';
    if (year === currentYear - 1) return 'Last Year';
    return filter;
  }, []);

  const handleTimeFilter = useCallback((filter) => {
    setTimeFilter(filter);
    resetPage();
    setSelectedTimeRange(formatTimeRangeDisplay(filter));
  }, [formatTimeRangeDisplay, resetPage]);

  const handleGenreFilter = useCallback((genre) => {
    setGenreFilter(genre);
    resetPage();
  }, [resetPage]);

  const handleSearchChange = useCallback((e) => {
    setSearchFilter(e.target.value);
    resetPage();
  }, [resetPage]);

  const handleBookFormatSelect = useCallback((format) => {
    setSelectedBookFormat(format);
    resetPage();
  }, [resetPage]);

  const handleTopOptionSelect = useCallback((option) => {
    setSelectedTopOption(option);
    resetPage();
  }, [resetPage]);

  const handleTimeRangeSelect = useCallback((range) => {
    resetPage();
    const currentYear = new Date().getFullYear();
    
    const rangeMap = {
      'All-time': { filter: 'all-time', display: 'All-time' },
      'This Year': { filter: currentYear.toString(), display: 'This Year' },
      'Last Year': { filter: (currentYear - 1).toString(), display: 'Last Year' }
    };
    
    if (rangeMap[range]) {
      setTimeFilter(rangeMap[range].filter);
      setSelectedTimeRange(rangeMap[range].display);
    } else if (range.includes('-')) {
      setTimeFilter(range);
      setSelectedTimeRange(range);
    } else {
      setTimeFilter('all-time');
      setSelectedTimeRange('All-time');
    }
  }, [resetPage]);


  return (
    <div className="book-reviews-page">
      <div className="reviews-container">
        {/* Top Header */}
        <div className="reviews-header">
          <h1 className="reviews-title">Top books of all time</h1>
          </div>

        <div className="reviews-layout">
          {/* Left Column - Main Chart */}
          <div className="reviews-main">
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
                {(() => {
                const getPageNumbers = () => {
                  if (totalPages <= 5) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1);
                  }
                  if (currentPage <= 3) {
                    return [1, 2, 3, 4, 5];
                  }
                  if (currentPage >= totalPages - 2) {
                    return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
                  }
                  return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
                };

                const pages = getPageNumbers();
                return pages.map((pageNum) => {
                  const isVisible = pageNum === 1 || pageNum === totalPages || 
                                   (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                  const isEllipsis = pageNum === currentPage - 2 || pageNum === currentPage + 2;
                  
                  if (isVisible) {
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (isEllipsis) {
                    return <span key={pageNum} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                });
              })()}
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            <div className={`book-chart ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
              {paginatedBooks.map((book, index) => {
                const rank = (currentPage - 1) * itemsPerPage + index + 1;
                const formattedDate = new Date(book.releaseDate).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                });
                
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
                      <div className="chart-date">{formattedDate}</div>
                      {book.genre && (
                        <div className="chart-genres">
                          <span className="genre-tag">{book.genre}</span>
                        </div>
                      )}
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
                );
              })}
            </div>
          </div>

          {/* Right Column - Filters and Sidebar */}
          <div className="reviews-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Add filters</h3>
              <p className="sidebar-description">
                There are unlimited ways to filter charts: You can make a personalized chart based on any combination of genres, descriptors, countries, languages and more.
              </p>
              <div className="filter-dropdowns">
                <div className="filter-select-wrapper">
                  <button 
                    className="filter-select filter-select-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTopModalOpen(true);
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
                <div className="filter-select-wrapper">
                  <button 
                    className="filter-select filter-select-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsFilterModalOpen(true);
                    }}
                  >
                    {selectedBookFormat || 'Books'}
                  </button>
                  {isFilterModalOpen && (
                    <BookFilterModal
                      isOpen={isFilterModalOpen}
                      onClose={() => setIsFilterModalOpen(false)}
                      onSelect={handleBookFormatSelect}
                    />
                  )}
                </div>
                <div className="filter-select-wrapper">
                  <button 
                    className="filter-select filter-select-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTimeRangeModalOpen(true);
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
                      currentSelection={selectedTimeRange}
                    />
                  )}
                </div>
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

