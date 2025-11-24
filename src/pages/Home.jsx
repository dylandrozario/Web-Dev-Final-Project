import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import booksData from '../data/books.json'
import AIAssistant from '../components/AIAssistant'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  // Memoize sorted book arrays
  const newReleases = useMemo(() => 
    [...booksData].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)),
    []
  )

  const trendingBooks = useMemo(() => 
    [...booksData].sort((a, b) => b.rating - a.rating),
    []
  )



  // Generate mock review counts for books (user scores out of 5)
  const booksWithScores = useMemo(() => {
    return newReleases.map(book => ({
      ...book,
      userScore: parseFloat((book.rating + (Math.random() * 0.4 - 0.2)).toFixed(1)), // Score out of 5
      userCount: Math.floor(Math.random() * 500) + 50
    }))
  }, [newReleases])

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
            {booksWithScores.slice(0, 14).map((book, index) => (
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
                  {index < 3 && (
                    <div className="book-star-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff8c00" stroke="#ff8c00">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
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
            {[
              {
                color: '#4A90E2',
                icon: '📚',
                title: 'Digital Archives & Special Collections',
                description: 'Access historical documents, rare manuscripts, and archival materials online',
                likes: 124,
                comments: 23
              },
              {
                color: '#50C878',
                icon: '🔍',
                title: 'Research Databases',
                description: 'Comprehensive academic databases for scholarly research and articles',
                likes: 89,
                comments: 15
              },
              {
                color: '#FF6B6B',
                icon: '📖',
                title: 'E-Book Collection',
                description: 'Thousands of digital books available for instant download and reading',
                likes: 156,
                comments: 31
              },
              {
                color: '#9B59B6',
                icon: '🖥️',
                title: 'Study Spaces & Equipment',
                description: 'Reserve study rooms, access computers, and borrow technology equipment',
                likes: 67,
                comments: 12
              },
              {
                color: '#F39C12',
                icon: '📝',
                title: 'Research Guides & Tutorials',
                description: 'Expert help and step-by-step guides for your academic research projects',
                likes: 203,
                comments: 45
              },
              {
                color: '#1ABC9C',
                icon: '📦',
                title: 'Interlibrary Loan Services',
                description: 'Request books and materials from other libraries across the network',
                likes: 178,
                comments: 28
              }
            ].map((item, index) => (
              <article 
                key={index} 
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
              <button className="browse-btn" onClick={() => navigate('/advanced-search')}>Decade</button>
              <button className="browse-btn" onClick={() => navigate('/advanced-search')}>Year</button>
              <button className="browse-btn" onClick={() => navigate('/advanced-search')}>Month</button>
              <button className="browse-btn" onClick={() => navigate('/advanced-search')}>Week</button>
            </div>
          </div>
        </section>

        {/* HIGHLY ANTICIPATED Section with Sidebar */}
        <section className="anticipated-section">
          <div className="anticipated-main">
            <div className="section-header-aoty">
              <h2 className="section-title-aoty">HIGHLY ANTICIPATED BOOKS</h2>
              <button className="header-link" onClick={() => navigate('/advanced-search')}>
                VIEW ALL
              </button>
            </div>
            <div className="anticipated-grid">
              {trendingBooks.slice(0, 6).map((book, index) => {
                const releaseDate = new Date(book.releaseDate)
                const formattedDate = releaseDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })
                const comments = Math.floor(Math.random() * 500) + 50
                const views = Math.floor(Math.random() * 2000) + 200
                
                return (
                  <div 
                    key={book.isbn || index} 
                    className="anticipated-card"
                    onClick={() => navigate(`/book/isbn/${book.isbn}`)}
                  >
                    <div className="anticipated-cover">
                      {book.image ? (
                        <img src={book.image} alt={book.title} />
                      ) : (
                        <div className="anticipated-placeholder">
                          <span>{book.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="anticipated-info">
                      <p className="anticipated-author">{book.author}</p>
                      <h3 className="anticipated-title">{book.title}</h3>
                      <p className="anticipated-date">{formattedDate}</p>
                      <div className="anticipated-stats">
                        <span className="stat-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          {comments}
                        </span>
                        <span className="stat-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          {views}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="anticipated-sidebar">
            <div className="sidebar-list">
              <h3 className="sidebar-title">USERS' BEST</h3>
              {trendingBooks.slice(0, 5).map((book, index) => {
                const userRating = parseFloat((book.rating + (Math.random() * 0.4 - 0.2)).toFixed(1))
                return (
                  <div 
                    key={book.isbn || index} 
                    className="sidebar-item"
                    onClick={() => navigate(`/book/isbn/${book.isbn}`)}
                  >
                    <div className="sidebar-image">
                      {book.image ? (
                        <img src={book.image} alt={book.title} />
                      ) : (
                        <div className="sidebar-placeholder">
                          <span>{book.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="sidebar-content">
                      <p className="sidebar-artist">{book.author}</p>
                      <p className="sidebar-album">{book.title}</p>
                    </div>
                    <div className="sidebar-rating">{userRating}/5</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* POPULAR NOW Section */}
        <section className="popular-now-section">
          <div className="section-header-aoty">
            <h2 className="section-title-aoty">POPULAR NOW</h2>
            <div className="section-header-links">
              <button className="header-link active">BOOKS</button>
              <button className="header-link" onClick={() => navigate('/advanced-search')}>
                VIEW MORE
              </button>
            </div>
          </div>
          <div className="popular-scroll">
            {trendingBooks.slice(0, 10).map((book, index) => (
              <div 
                key={book.isbn || index} 
                className="popular-card"
                onClick={() => navigate(`/book/isbn/${book.isbn}`)}
              >
                <div className="popular-cover">
                  {book.image ? (
                    <img src={book.image} alt={book.title} />
                  ) : (
                    <div className="popular-placeholder">
                      <span>{book.title.charAt(0)}</span>
                    </div>
                  )}
                  {index < 2 && (
                    <div className="popular-star-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff8c00" stroke="#ff8c00">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* POPULAR USER REVIEWS Section */}
        <section className="user-reviews-section">
          <div className="section-header-aoty">
            <h2 className="section-title-aoty">POPULAR USER REVIEWS</h2>
            <button className="header-link" onClick={() => navigate('/advanced-search')}>
              VIEW MORE
            </button>
          </div>
          <div className="reviews-scroll">
            {[
              {
                book: booksData[0],
                reviewer: 'BookLover42',
                rating: 4.8,
                review: 'One day I\'m gonna tell my grandkids that I was alive when this masterpiece was published and they weren\'t. This book captures the essence of its era so perfectly. The prose is absolutely stunning, and the characters feel so real. It\'s hard to believe this was written so long ago - it feels timeless.',
                likes: 358,
                comments: 29
              },
              {
                book: booksData[1],
                reviewer: 'LiteraryFan',
                rating: 5.0,
                review: 'This is one of the most astonishing and original works to come out of this period. You don\'t have to even like the style to know that it is at this point in literary history that their creative genius was overflowing beyond what seemed "imaginable."',
                likes: 244,
                comments: 4
              },
              {
                book: booksData[2],
                reviewer: 'ClassicReader',
                rating: 4.5,
                review: 'This book broke boundaries and continues to resonate with readers today. The social commentary is sharp, the narrative is compelling, and the impact is undeniable. A must-read for anyone interested in classic literature.',
                likes: 1783,
                comments: 93
              }
            ].map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-cover">
                  {review.book.image ? (
                    <img src={review.book.image} alt={review.book.title} />
                  ) : (
                    <div className="review-placeholder">
                      <span>{review.book.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="review-content">
                  <div className="review-header">
                    <div className="review-rating-section">
                      <span className="review-rating-value">{review.rating}/5</span>
                    </div>
                    {review.reviewer && (
                      <span className="review-reviewer">{review.reviewer}</span>
                    )}
                  </div>
                  <p className="review-text">{review.review}</p>
                  <div className="review-stats">
                    <span className="stat-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {review.likes}
                    </span>
                    <span className="stat-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {review.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* UNDER THE RADAR Section */}
        <section className="under-radar-section">
          <div className="section-header-aoty">
            <h2 className="section-title-aoty">UNDER THE RADAR</h2>
            <button className="header-link" onClick={() => navigate('/advanced-search')}>
              VIEW MORE
            </button>
          </div>
          <div className="radar-scroll">
            {booksData.slice(3, 9).map((book, index) => (
              <div 
                key={book.isbn || index} 
                className="radar-card"
                onClick={() => navigate(`/book/isbn/${book.isbn}`)}
              >
                <div className="radar-cover">
                  {book.image ? (
                    <img src={book.image} alt={book.title} />
                  ) : (
                    <div className="radar-placeholder">
                      <span>{book.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="radar-info">
                  <p className="radar-author">{book.author}</p>
                  <p className="radar-title">{book.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ON THIS DAY Section */}
        <section className="on-this-day-section">
          <div className="section-header-aoty">
            <h2 className="section-title-aoty">ON THIS DAY</h2>
            <button className="header-link" onClick={() => navigate('/advanced-search')}>
              VIEW MORE
            </button>
          </div>
          <div className="on-this-day-grid">
            {[
              {
                yearsAgo: 10,
                book: booksData.find(b => b.title === "The Great Gatsby") || booksData[0],
                userScore: 4.2,
                userCount: 3096
              },
              {
                yearsAgo: 30,
                book: booksData.find(b => b.title === "1984") || booksData[2],
                userScore: 4.5,
                userCount: 139
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="on-this-day-card"
                onClick={() => navigate(`/book/isbn/${item.book.isbn}`)}
              >
                <div className="on-this-day-label">{item.yearsAgo} YEARS AGO</div>
                <div className="on-this-day-content">
                  <div className="on-this-day-cover">
                    {item.book.image ? (
                      <img src={item.book.image} alt={item.book.title} />
                    ) : (
                      <div className="on-this-day-placeholder">
                        <span>{item.book.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="on-this-day-info">
                    <p className="on-this-day-author">{item.book.author}</p>
                    <h3 className="on-this-day-title">{item.book.title}</h3>
                    <div className="on-this-day-scores">
                      <div className="on-this-day-score-line">
                        <div className="on-this-day-score-bar">
                          <div 
                            className="on-this-day-score-fill" 
                            style={{ width: `${(item.userScore / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="on-this-day-score-text">
                          {item.userScore}/5 user score ({item.userCount.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RECENTLY ADDED Section */}
        <section className="recently-added-section">
          <div className="section-header-aoty">
            <h2 className="section-title-aoty">RECENTLY ADDED</h2>
            <button className="header-link" onClick={() => navigate('/advanced-search')}>
              VIEW MORE
            </button>
          </div>
          <div className="recently-added-scroll">
            {booksData.slice(0, 6).map((book, index) => (
              <div 
                key={book.isbn || index} 
                className="recently-added-card"
                onClick={() => navigate(`/book/isbn/${book.isbn}`)}
              >
                <div className="recently-added-cover">
                  {book.image ? (
                    <img src={book.image} alt={book.title} />
                  ) : (
                    <div className="recently-added-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Three Column Section */}
        <section className="bottom-section">
          <div className="bottom-three-columns">
            {/* Left: Users' Best */}
            <div className="bottom-column">
              <h3 className="bottom-column-title">USERS' BEST BOOKS OF 2025</h3>
              <div className="bottom-list">
                {trendingBooks.slice(0, 5).map((book, index) => (
                  <div 
                    key={book.isbn || index} 
                    className="bottom-list-item"
                    onClick={() => navigate(`/book/isbn/${book.isbn}`)}
                  >
                    <div className="bottom-list-image">
                      {book.image ? (
                        <img src={book.image} alt={book.title} />
                      ) : (
                        <div className="bottom-list-placeholder">
                          <span>{book.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="bottom-list-content">
                      <p className="bottom-list-title">{book.title}</p>
                      <p className="bottom-list-author">{book.author}</p>
                    </div>
                    <div className="bottom-list-rating">{Math.floor(book.rating * 20)}</div>
                  </div>
                ))}
              </div>
              <div className="bottom-buttons">
                <button className="bottom-btn primary" onClick={() => navigate('/my-library')}>
                  MY LIBRARY
                </button>
                <button className="bottom-btn secondary" onClick={() => navigate('/sign-in')}>
                  SIGN IN
                </button>
              </div>
            </div>

            {/* Middle: Best Books */}
            <div className="bottom-column">
              <h3 className="bottom-column-title">BEST BOOKS OF 2025</h3>
              <div className="publication-links">
                {['THE NEW YORK TIMES', 'THE GUARDIAN', 'NPR', 'BOOKLIST', 'PUBLISHERS WEEKLY'].map((pub, index) => (
                  <button
                    key={index}
                    className="publication-link-btn"
                    onClick={() => navigate(`/book-list/${pub.toLowerCase().replace(/\s+/g, '-')}`)}
                  >
                    {pub}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Popular Genres */}
            <div className="bottom-column">
              <h3 className="bottom-column-title">POPULAR GENRES</h3>
              <div className="genres-list">
                {['Fiction', 'Fantasy', 'Romance', 'Mystery', 'Science Fiction', 'Non-Fiction'].map((genre, index) => (
                  <button 
                    key={index}
                    className="genre-item"
                    onClick={() => navigate('/advanced-search')}
                  >
                    {genre}
                  </button>
                ))}
              </div>
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
                <li><button onClick={() => navigate('/my-library')}>My Library</button></li>
                <li><button onClick={() => navigate('/sign-in')}>Sign In</button></li>
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
          <div className="footer-social">
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home
