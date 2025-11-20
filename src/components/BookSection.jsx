import React from 'react'
import './BookSection.css'

function BookSection({ title, books }) {
  if (books.length === 0) return null

  return (
    <section className="book-section">
      <h2 className="section-title">{title}</h2>
      <div className="books-grid">
        {books.slice(0, 8).map((book, index) => (
          <div key={index} className="book-card-large">
            {book.image && (
              <div className="book-card-cover">
                <img 
                  src={book.image} 
                  alt={`${book.title} cover`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="book-card-header">
              <h3 className="book-card-title">{book.title}</h3>
              <div className="book-rating">
                <span className="rating-number">{book.rating.toFixed(1)} / 5</span>
              </div>
            </div>
            <div className="book-card-body">
              <p className="book-card-author">by {book.author}</p>
              <p className="book-card-date">
                Released: {new Date(book.releaseDate).toLocaleDateString()}
              </p>
              <p className="book-card-isbn">ISBN: {book.isbn}</p>
              <span className="book-card-genre">{book.genre}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BookSection

