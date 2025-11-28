import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import APP_CONFIG from '../../config/constants'
import { generateLibraryAvailability, formatDate, calculateReadTime, generateBookDescription } from '../../utils/bookUtils'
import './BookDetails.css'

export default function BookNotFound() {
  const { isbn } = useParams()

  // Generate mock book data based on ISBN
  const mockBook = useMemo(() => {
    // Generate a seed from ISBN for consistent mock data
    const seed = isbn ? isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
    
    // Generate mock title and author based on seed
    const titles = [
      'The Enigmatic Journey',
      'Whispers in the Dark',
      'Echoes of Tomorrow',
      'The Hidden Path',
      'Shadows and Light',
      'The Last Chapter',
      'Beyond the Horizon',
      'The Silent Witness'
    ]
    
    const authors = [
      'A. M. Writer',
      'J. K. Novelist',
      'M. R. Storyteller',
      'L. P. Author',
      'R. S. Wordsmith',
      'C. T. Narrator',
      'E. V. Chronicler',
      'D. W. Scribe'
    ]
    
    const genres = ['Fiction', 'Mystery', 'Fantasy', 'Romance', 'Science Fiction', 'Thriller', 'Drama', 'Adventure']
    
    const titleIndex = seed % titles.length
    const authorIndex = (seed * 7) % authors.length
    const genreIndex = (seed * 3) % genres.length
    
    // Generate a mock release date (random year between 1950-2020)
    const year = 1950 + (seed % 70)
    const month = (seed % 12) + 1
    const day = (seed % 28) + 1
    const releaseDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // Generate rating (3.5 to 4.8)
    const rating = 3.5 + ((seed % 13) / 10)
    
    return {
      title: titles[titleIndex],
      author: authors[authorIndex],
      genre: genres[genreIndex],
      isbn: isbn || '000-0-0000-0000-0',
      releaseDate,
      rating: parseFloat(rating.toFixed(1)),
      image: null // No image for mock books
    }
  }, [isbn])

  // Generate library availability (mock data)
  const libraryAvailability = useMemo(() => {
    return generateLibraryAvailability(mockBook.isbn)
  }, [mockBook.isbn])

  const formattedDate = formatDate(mockBook.releaseDate)
  const readTimeMinutes = calculateReadTime(APP_CONFIG.DEFAULT_ESTIMATED_PAGES)
  const description = generateBookDescription(mockBook)

  // Mock comments
  const mockComments = [
    {
      id: 1,
      username: 'reader123',
      avatar: 'R1',
      text: 'This is a placeholder book entry. The actual book details are not available in our catalog.',
      date: '1 day ago',
      likes: 0
    }
  ]

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        {/* Notice Banner */}
        <div style={{
          background: 'rgba(255, 193, 7, 0.2)',
          border: '1px solid rgba(255, 193, 7, 0.5)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          color: 'var(--gold)'
        }}>
          <strong>Note:</strong> This is a mock book entry. The book with ISBN <code>{isbn}</code> is not currently in our catalog.
        </div>

        {/* Main Content Grid */}
        <div className="book-details-grid">
          {/* Left: Book Cover */}
          <div className="book-cover-section">
            <div className="book-cover-wrapper">
              <div className="book-cover-placeholder" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                <span>📚</span>
              </div>
            </div>
          </div>

          {/* Middle: Book Information */}
          <div className="book-info-section">
            <div className="book-title-row">
              <h1 className="book-title">{mockBook.title}</h1>
              <button className="bookmark-btn" aria-label="Bookmark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            <p className="book-author">by {mockBook.author}</p>
            
            <div className="book-description">
              <p>{description}</p>
            </div>

            <div className="book-specifications">
              <h3 className="specs-title">Specifications</h3>
              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Released On:</span>
                  <span className="spec-value">{formattedDate}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Language:</span>
                  <span className="spec-value">{APP_CONFIG.DEFAULT_LANGUAGE}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Pages:</span>
                  <span className="spec-value">{APP_CONFIG.DEFAULT_ESTIMATED_PAGES}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Read Time*:</span>
                  <span className="spec-value">{readTimeMinutes} minutes</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">ISBN:</span>
                  <span className="spec-value">{mockBook.isbn}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">{mockBook.genre}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Publisher:</span>
                  <span className="spec-value">{APP_CONFIG.DEFAULT_PUBLISHER}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Availability Options */}
          <div className="purchase-section">
            <div className="purchase-box">
              <div className="availability-header">
                <h3 className="availability-title">Availability</h3>
                <div className={`availability-badge ${libraryAvailability.some(lib => lib.available) ? 'in-stock' : 'out-of-stock'}`}>
                  {libraryAvailability.some(lib => lib.available) ? 'Available' : 'Not Available'}
                </div>
              </div>

              <div className="library-list">
                {libraryAvailability.map((lib) => (
                  <div key={lib.library} className="library-item">
                    <div className="library-name-row">
                      <span className="library-name">{lib.library}</span>
                      <span className={`library-status ${lib.available ? 'available' : 'unavailable'}`}>
                        {lib.available ? `${lib.quantity} available` : 'Not available'}
                      </span>
                    </div>
                    {lib.available && (
                      <button className="btn-checkout">Checkout</button>
                    )}
                    {!lib.available && (
                      <button className="btn-request">Request</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="comments-header">
            <h2 className="comments-title">COMMENTS ({mockComments.length})</h2>
            <button className="sign-in-comment-btn">SIGN IN TO COMMENT</button>
          </div>

          <div className="comments-list">
            {mockComments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-user-info">
                  <div className="comment-avatar">{comment.avatar}</div>
                  <div className="comment-user-details">
                    <div className="comment-username">{comment.username}</div>
                    <div className="comment-date">{comment.date}</div>
                  </div>
                </div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-actions">
                  <button className="comment-like-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {comment.likes}
                  </button>
                  <button className="comment-reply-btn">Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

