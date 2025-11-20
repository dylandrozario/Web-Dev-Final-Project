import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import booksData from '../data/books.json'
import SearchBar from '../components/SearchBar'
import AIAssistant from '../components/AIAssistant'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  // Memoize sorted book arrays
  const newReleases = useMemo(() => 
    [...booksData].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)),
    []
  )

  const trendingBooks = useMemo(() => 
    [...booksData].sort((a, b) => b.rating - a.rating),
    []
  )

  const recommendations = useMemo(() => 
    [...booksData].sort((a, b) => b.rating - a.rating),
    []
  )

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const results = booksData.filter(book => {
      const lowerQuery = query.toLowerCase()
      return (
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.isbn.includes(query)
      )
    }).slice(0, 5)

    setSearchResults(results)
    setShowResults(true)
  }

  // Featured resources preview
  const featuredResources = [
    {
      title: 'Research Essentials Workshop',
      date: 'Oct 25, 2025',
      excerpt: 'Learn how to navigate the library catalog and use subject databases...'
    },
    {
      title: 'One-on-One Research Consultation',
      date: 'By appointment',
      excerpt: 'Book a 30-minute session with a librarian for personalized help...'
    }
  ]

  return (
    <div className="home">
      <div className="home-content">
        {/* AI Floating Button */}
        <AIAssistant />

        {/* Search Section */}
        <section className="search-section">
          <div className="search-wrapper">
            <div className="search-bar-container">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                results={searchResults}
                showResults={showResults}
                onResultClick={(book) => {
                  setShowResults(false)
                  setSearchQuery('')
                }}
              />
            </div>
            <button
              className="advanced-search-btn"
              onClick={() => navigate('/advanced-search')}
            >
              Advanced Search
            </button>
          </div>
        </section>

        {/* Two Column Layout: Currently Reading & News */}
        <section className="two-column-section">
          {/* Left: Currently Reading / Featured Books */}
          <div className="column-left">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Currently Trending</h2>
                <p className="section-subtitle">Top-rated books our community is reading</p>
              </div>
              <div className="featured-books-list">
                {trendingBooks.slice(0, 2).map((book, index) => (
                  <div key={book.isbn || index} className="featured-book-item">
                    {book.image && (
                      <div className="featured-book-cover">
                        <img src={book.image} alt={book.title} />
                      </div>
                    )}
                    <div className="featured-book-info">
                      <h3 className="featured-book-title">{book.title}</h3>
                      <p className="featured-book-author">by {book.author}</p>
                      <div className="featured-book-rating">
                        <span className="rating-stars">★★★★★</span>
                        <span className="rating-value">{book.rating.toFixed(1)}</span>
                      </div>
                      <button 
                        className="featured-book-btn"
                        onClick={() => navigate('/book-details')}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: News & Highlights */}
          <div className="column-right">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">News & Highlights</h2>
                <p className="section-subtitle">What's happening in our library</p>
              </div>
              <div className="news-list">
                {featuredResources.map((resource, index) => (
                  <article key={index} className="news-item">
                    <div className="news-date">{resource.date}</div>
                    <h3 className="news-title">{resource.title}</h3>
                    <p className="news-excerpt">{resource.excerpt}</p>
                    <button 
                      className="news-link"
                      onClick={() => navigate('/resources')}
                    >
                      Read more →
                    </button>
                  </article>
                ))}
                <button 
                  className="view-all-btn"
                  onClick={() => navigate('/resources')}
                >
                  View All Resources
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Reading Challenge / Stats Section */}
        <section className="challenge-section">
          <div className="section-card challenge-card">
            <div className="challenge-content">
              <div className="challenge-text">
                <h2 className="section-title">Your Reading Journey</h2>
                <p className="challenge-stats">You have explored <strong>{booksData.length}</strong> books in our collection</p>
                <p className="challenge-subtitle">Continue discovering new worlds and stories</p>
                <button 
                  className="challenge-btn"
                  onClick={() => navigate('/my-library')}
                >
                  View My Library
                </button>
              </div>
              <div className="challenge-visual">
                {trendingBooks[0] && (
                  <div className="challenge-book">
                    {trendingBooks[0].image && (
                      <img src={trendingBooks[0].image} alt={trendingBooks[0].title} />
                    )}
                    <div className="challenge-book-info">
                      <p className="challenge-book-title">{trendingBooks[0].title}</p>
                      <p className="challenge-book-author">{trendingBooks[0].author}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Want to Read / Recommendations Carousel */}
        <section className="recommendations-section">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Recommended for You</h2>
              <p className="section-subtitle">Find your next great read!</p>
            </div>
            <div className="books-carousel">
              {recommendations.slice(0, 6).map((book, index) => (
                <div 
                  key={book.isbn || index} 
                  className="carousel-book"
                  onClick={() => navigate('/book-details')}
                >
                  {book.image && (
                    <div className="carousel-book-cover">
                      <img src={book.image} alt={book.title} />
                    </div>
                  )}
                  <div className="carousel-book-title">{book.title}</div>
                  <div className="carousel-book-author">{book.author}</div>
                </div>
              ))}
            </div>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/advanced-search')}
            >
              Browse All Books
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
