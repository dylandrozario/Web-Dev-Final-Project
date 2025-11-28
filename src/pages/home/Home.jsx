import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import resourcesData from '../../data/resources/resources.json'
import APP_CONFIG from '../../config/constants'
import AIAssistant from '../../components/common/AIAssistant'
import { useBooks } from '../../context/BooksContext'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const { books: booksData } = useBooks()


  // Memoize sorted book arrays - optimize by sorting once and slicing
  const newReleases = useMemo(() => 
    [...booksData].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)),
    [booksData]
  )

  // Generate mock review counts for books (user scores out of 5)
  // Using seed-based approach for stable values across renders
  const booksWithScores = useMemo(() => {
    return newReleases.map((book, index) => {
      const seed = book.isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index
      const userScore = parseFloat((book.rating + ((seed % 8 - 4) * 0.05)).toFixed(1))
      const userCount = APP_CONFIG.USER_COUNT_MIN + ((seed * 7) % (APP_CONFIG.USER_COUNT_MAX - APP_CONFIG.USER_COUNT_MIN + 1))
      return {
        ...book,
        userScore: Math.max(0, Math.min(5, userScore)), // Clamp between 0-5
        userCount
      }
    })
  }, [newReleases])

  // Memoize sliced arrays to avoid recalculation
  const displayedNewReleases = useMemo(() => booksWithScores.slice(0, 14), [booksWithScores])

  return (
    <div className="home">
      <div className="home-content">
        {/* AI Floating Button */}
        <AIAssistant />

        {/* NEW RELEASES Section - AOTY Style */}
        <section className="new-releases-section">
          <div className="section-header-aoty">
            <h2 className="section-title-aoty">NEW RELEASES</h2>
            <div className="section-header-links">
              <button className="header-link active">BOOKS</button>
              <button className="header-link" onClick={() => navigate('/advanced-search')}>
                VIEW ALL
              </button>
            </div>
          </div>
          <div className="books-grid-aoty">
            {displayedNewReleases.map((book, index) => (
              <div 
                key={book.isbn || index} 
                className="book-card-aoty"
                onClick={() => navigate(`/book/isbn/${book.isbn}`)}
              >
                <div className="book-cover-aoty">
                  {book.image ? (
                    <img src={book.image} alt={book.title} />
                  ) : (
                    <div className="book-cover-placeholder-aoty">
                      <span>{book.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="book-info-aoty">
                  <p className="book-artist-aoty">{book.author}</p>
                  <h3 className="book-title-aoty">{book.title}</h3>
                  <div className="book-scores-aoty">
                    <div className="score-line">
                      <span className="score-value">{book.userScore}/5</span>
                      <span className="score-label">user score ({book.userCount.toLocaleString()})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RESOURCES Section */}
        <section className="newsworthy-section">
          <div className="section-header-aoty">
            <h2 className="section-title-aoty">RESOURCES</h2>
            <button className="header-link" onClick={() => navigate('/resources')}>
              VIEW ALL
            </button>
          </div>
          <div className="newsworthy-grid">
            {resourcesData.map((item) => (
              <article 
                key={item.id} 
                className="newsworthy-card"
                onClick={() => navigate('/resources')}
              >
                <div className="newsworthy-image" style={{ backgroundColor: item.color }}>
                  <div className="resource-icon">{item.icon}</div>
                </div>
                <div className="newsworthy-content">
                  <p className="newsworthy-source">Library Resources</p>
                  <h3 className="newsworthy-title">{item.title}</h3>
                  <p className="newsworthy-description">{item.description}</p>
                  <div className="newsworthy-stats">
                    <span className="stat-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {item.likes}
                    </span>
                    <span className="stat-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {item.comments}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="browse-by-section">
            <h3 className="browse-by-title">BROWSE BY</h3>
            <div className="browse-by-buttons">
              {APP_CONFIG.BROWSE_OPTIONS.map((option) => (
                <button 
                  key={option}
                  className="browse-btn" 
                  onClick={() => navigate('/book-reviews')}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <div className="footer-columns">
            <div className="footer-column">
              <h4 className="footer-title">BOOKS</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigate('/book-reviews')}>Highest Rated</button></li>
                <li><button onClick={() => navigate('/book-reviews')}>Overview</button></li>
                <li><button onClick={() => navigate('/')}>On This Day</button></li>
                <li><button onClick={() => navigate('/')}>New Releases</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">AUTHORS</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigate('/advanced-search')}>Browse</button></li>
                <li><button onClick={() => navigate('/advanced-search', { state: { sortBy: 'popular' } })}>Popular</button></li>
                <li><button onClick={() => navigate('/advanced-search', { state: { sortBy: 'new' } })}>New</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">GENRE</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigate('/advanced-search', { state: { genre: 'Fiction' } })}>Fiction</button></li>
                <li><button onClick={() => navigate('/advanced-search', { state: { genre: 'Fantasy' } })}>Fantasy</button></li>
                <li><button onClick={() => navigate('/advanced-search', { state: { genre: 'Romance' } })}>Romance</button></li>
                <li><button onClick={() => navigate('/advanced-search', { state: { genre: 'Mystery' } })}>Mystery</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">MORE</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigate('/resources')}>Resources</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">SITE DETAILS</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigate('/faq')}>FAQ</button></li>
                <li><button onClick={() => navigate('/about')}>About</button></li>
                <li><button onClick={() => navigate('/contact')}>Contact</button></li>
                <li><button onClick={() => navigate('/privacy')}>Privacy</button></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home
