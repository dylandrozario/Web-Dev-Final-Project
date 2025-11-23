import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import booksData from '../data/books.json'
import './BookDetails.css'

export default function BookDetails() {
  const { id, isbn } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Find the book by ID (using ISBN or index)
  const book = useMemo(() => {
    // Check if we have ISBN in params
    const bookIdentifier = isbn || id || location.pathname.split('/').pop()
    
    if (bookIdentifier) {
      // Try to find by ISBN first (handle with or without dashes)
      const foundByIsbn = booksData.find(b => {
        const bookIsbn = b.isbn.replace(/-/g, '')
        const searchIsbn = bookIdentifier.replace(/-/g, '')
        return b.isbn === bookIdentifier || bookIsbn === searchIsbn
      })
      if (foundByIsbn) return foundByIsbn
      
      // Otherwise try by index
      const index = parseInt(bookIdentifier)
      if (!isNaN(index) && index >= 0 && index < booksData.length) {
        return booksData[index]
      }
    }
    // Default to first book if no ID or not found
    return booksData[0]
  }, [id, isbn, location.pathname])

  // Calculate read time (approximate: 200 words per minute, average book ~50k words)
  const estimatedPages = 184 // Default, could be calculated
  const readTimeMinutes = Math.round(estimatedPages * 1.5)

  // Format release date
  const releaseDate = new Date(book.releaseDate)
  const formattedDate = releaseDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  // Generate description if not available
  const description = `${
    book.title
  } is a timeless classic that captures the essence of ${
    book.genre.toLowerCase()
  } literature. Written by the acclaimed author ${
    book.author
  }, this work explores themes of human experience, society, and the complexities of life. Through its vivid prose and unforgettable characters, this novel continues to resonate with readers across generations.`

  // Generate library availability (mock data based on book)
  const libraryAvailability = useMemo(() => {
    const libraries = ["O'Neill", "Burns", "Bapst", "Law Library"]
    // Generate availability based on book ISBN for consistency
    const seed = book.isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return libraries.map((library, index) => {
      const available = (seed + index) % 3 !== 0 // Some libraries have it, some don't
      const quantity = available ? Math.floor((seed + index) % 5) + 1 : 0
      return { library, available, quantity }
    })
  }, [book.isbn])

  // Mock comments data
  const [comments] = useState([
    {
      id: 1,
      username: 'booklover42',
      avatar: 'BL',
      text: 'This is one of my all-time favorites! The character development is incredible.',
      date: '2 days ago',
      likes: 12
    },
    {
      id: 2,
      username: 'readerscorner',
      avatar: 'RC',
      text: 'Just finished reading this. The ending was perfect! Highly recommend to anyone who enjoys classic literature.',
      date: '5 days ago',
      likes: 8
    },
    {
      id: 3,
      username: 'literaturefan',
      avatar: 'LF',
      text: 'The prose is beautiful and the themes are timeless. A must-read for any book enthusiast.',
      date: '1 week ago',
      likes: 15
    },
    {
      id: 4,
      username: 'bookworm99',
      avatar: 'BW',
      text: 'I\'ve read this multiple times and it gets better with each reading. The symbolism is incredible.',
      date: '2 weeks ago',
      likes: 20
    }
  ])

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        {/* Main Content Grid */}
        <div className="book-details-grid">
          {/* Left: Book Cover */}
          <div className="book-cover-section">
            <div className="book-cover-wrapper">
              {book.image ? (
                <img src={book.image} alt={book.title} className="book-cover-image" />
              ) : (
                <div className="book-cover-placeholder">
                  <span>{book.title.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Middle: Book Information */}
          <div className="book-info-section">
            <div className="book-title-row">
              <h1 className="book-title">{book.title}</h1>
              <button className="bookmark-btn" aria-label="Bookmark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            <p className="book-author">by {book.author}</p>
            
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
                  <span className="spec-value">English</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Pages:</span>
                  <span className="spec-value">{estimatedPages}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Read Time*:</span>
                  <span className="spec-value">{readTimeMinutes} minutes</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">ISBN:</span>
                  <span className="spec-value">{book.isbn}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">{book.genre}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Publisher:</span>
                  <span className="spec-value">Library Catalog Publishing</span>
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
                {libraryAvailability.map((lib, index) => (
                  <div key={index} className="library-item">
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
            <h2 className="comments-title">COMMENTS ({comments.length})</h2>
            <button className="sign-in-comment-btn">SIGN IN TO COMMENT</button>
          </div>

          <div className="comments-list">
            {comments.map(comment => (
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
