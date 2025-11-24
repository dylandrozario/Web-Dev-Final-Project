import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import booksData from '../data/books.json'
import './BookList.css'

function BookList() {
  const navigate = useNavigate()
  const { listType } = useParams()
  const [decadeFilter, setDecadeFilter] = useState('2020s')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [genreFilter, setGenreFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('2025')

  // Get books based on list type
  const books = useMemo(() => {
    let filtered = [...booksData]
    
    // Filter by year
    filtered = filtered.filter(book => {
      const bookYear = new Date(book.releaseDate).getFullYear()
      return bookYear === parseInt(yearFilter)
    })

    // Filter by genre if not "All"
    if (genreFilter !== 'All') {
      filtered = filtered.filter(book => 
        book.genre?.toLowerCase() === genreFilter.toLowerCase()
      )
    }

    // Sort by rating (highest first)
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    return filtered
  }, [yearFilter, genreFilter])

  // Generate critic scores for books
  const booksWithScores = useMemo(() => {
    return books.map((book, index) => {
      const seed = book.isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const criticScore = 70 + (seed % 30) // Scores between 70-100
      const source = ['Pitchfork', 'The New York Times', 'The Guardian', 'NPR', 'Booklist', 'Publishers Weekly'][seed % 6]
      
      return {
        ...book,
        rank: index + 1,
        criticScore,
        source
      }
    })
  }, [books])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="book-list-page">
      <div className="book-list-container">
        <div className="book-list-layout">
          {/* Main Content */}
          <div className="book-list-main">
            <h1 className="book-list-title">Highest Rated Books of {yearFilter}</h1>
            
            {/* Filters */}
            <div className="book-list-filters">
              <select 
                className="filter-select"
                value={decadeFilter}
                onChange={(e) => setDecadeFilter(e.target.value)}
              >
                <option>DECADE 2020s</option>
              </select>
              <select 
                className="filter-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option>SOURCE All</option>
                <option>SOURCE Pitchfork</option>
                <option>SOURCE The New York Times</option>
                <option>SOURCE The Guardian</option>
                <option>SOURCE NPR</option>
                <option>SOURCE Booklist</option>
                <option>SOURCE Publishers Weekly</option>
              </select>
              <select 
                className="filter-select"
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
              >
                <option>GENRE All</option>
                <option>GENRE Fiction</option>
                <option>GENRE Fantasy</option>
                <option>GENRE Romance</option>
                <option>GENRE Dystopian</option>
              </select>
            </div>

            {/* Year Navigation */}
            <div className="year-navigation">
              <button className="year-nav-btn">‹</button>
              {['2020s', '2020', '2021', '2022', '2023', '2024', '2025'].map(year => (
                <button
                  key={year}
                  className={`year-nav-btn ${yearFilter === year ? 'active' : ''}`}
                  onClick={() => setYearFilter(year)}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Book List */}
            <div className="book-list-items">
              {booksWithScores.map((book) => (
                <div 
                  key={book.isbn} 
                  className="book-list-item"
                  onClick={() => navigate(`/book/isbn/${book.isbn}`)}
                >
                  <div className="book-list-rank">{book.rank}.</div>
                  <div className="book-list-cover">
                    {book.image ? (
                      <img src={book.image} alt={book.title} />
                    ) : (
                      <div className="book-list-placeholder">
                        <span>{book.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="book-list-info">
                    <div className="book-list-title-author">
                      <span className="book-list-book-title">{book.title}</span>
                      {book.author && (
                        <span className="book-list-book-author"> - {book.author}</span>
                      )}
                    </div>
                    <div className="book-list-meta">
                      <span className="book-list-date">{formatDate(book.releaseDate)}</span>
                      <span className="book-list-genre">{book.genre}</span>
                    </div>
                    <div className="book-list-score-section">
                      <div className="book-list-score-box">
                        <span className="book-list-score-label">SCORE</span>
                        <span className="book-list-score-value">{book.criticScore}</span>
                      </div>
                      <span className="book-list-source">Source →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="book-list-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">NEW BOOK RELEASES</h3>
              <div className="sidebar-releases">
                {booksData.slice(0, 5).map((book, index) => {
                  const seed = book.isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  const score = 70 + (seed % 30)
                  return (
                    <div 
                      key={book.isbn}
                      className="sidebar-release-item"
                      onClick={() => navigate(`/book/isbn/${book.isbn}`)}
                    >
                      <span className="sidebar-release-score">{score}</span>
                      <div className="sidebar-release-score-bar" style={{ width: `${score}%` }}></div>
                      <span className="sidebar-release-title">{book.title}</span>
                    </div>
                  )
                })}
              </div>
              <button className="more-releases-btn">MORE RELEASES</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookList

