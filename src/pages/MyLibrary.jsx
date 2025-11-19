import React, { useState } from 'react'

const BOOK_DATA = [
  {
    id: 1,
    tag: 'Favorite',
    title: 'Kindred',
    author: 'Octavia E. Butler',
    ratingLabel: '★★★★★',
    description:
      'A classic time-travel narrative that explores slavery, memory, and inherited trauma.',
    saved: true,
    favorite: true,
    rated: true,
    reviewed: false,
  },
  {
    id: 2,
    tag: 'Reviewed',
    title: 'The Body Keeps the Score',
    author: 'Bessel van der Kolk',
    ratingLabel: '★★★★☆',
    description:
      'A deep dive into trauma, the brain, and approaches to healing that combine science and practice.',
    saved: true,
    favorite: false,
    rated: true,
    reviewed: true,
  },
  {
    id: 3,
    tag: 'Saved',
    title: 'Algorithms of Oppression',
    author: 'Safiya Umoja Noble',
    ratingLabel: '—',
    description:
      'Examines how search engines reinforce racism and bias, especially against Black women and girls.',
    saved: true,
    favorite: false,
    rated: false,
    reviewed: false,
  },
  {
    id: 4,
    tag: 'Favorite',
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    ratingLabel: '★★★★★',
    description:
      'A foundational sci-fi novel that explores gender, politics, and power on the icy planet Gethen.',
    saved: true,
    favorite: true,
    rated: true,
    reviewed: true,
  },
  {
    id: 5,
    tag: 'Rated',
    title: 'Invisible Man',
    author: 'Ralph Ellison',
    ratingLabel: '★★★★☆',
    description:
      'A powerful exploration of identity, race, and invisibility in twentieth-century America.',
    saved: true,
    favorite: false,
    rated: true,
    reviewed: false,
  },
]

export default function MyLibrary() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredBooks = BOOK_DATA.filter((book) => {
    if (activeFilter === 'saved') return book.saved
    if (activeFilter === 'favorite') return book.favorite
    if (activeFilter === 'rated') return book.rated
    if (activeFilter === 'reviewed') return book.reviewed
    return true
  })

  return (
    <div className="page-shell account-page">
      <section className="page-header-block">
        <h1>My Library</h1>
        <p className="page-subtitle">
          View your saved books, favorites, ratings, and reading patterns in one
          place.
        </p>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <article className="stat-card">
            <p className="stat-label">Favorites</p>
            <p className="stat-value">12</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Saved Books</p>
            <p className="stat-value">34</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Average Rating</p>
            <p className="stat-value">4.3</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Favorite Genre</p>
            <p className="stat-value">Speculative Fiction</p>
          </article>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="filter-buttons">
          <button
            className={
              'chip' + (activeFilter === 'all' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={
              'chip' + (activeFilter === 'saved' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('saved')}
          >
            Saved
          </button>
          <button
            className={
              'chip' + (activeFilter === 'favorite' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('favorite')}
          >
            Favorites
          </button>
          <button
            className={
              'chip' + (activeFilter === 'rated' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('rated')}
          >
            Rated
          </button>
          <button
            className={
              'chip' + (activeFilter === 'reviewed' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('reviewed')}
          >
            Reviewed
          </button>
        </div>
      </section>

      {/* Book Cards */}
      <section className="cards-section" aria-label="My saved books">
        <div className="cards-grid">
          {filteredBooks.map((book) => (
            <article
              key={book.id}
              className="card book-card"
              data-saved={book.saved}
              data-favorite={book.favorite}
              data-rated={book.rated}
              data-reviewed={book.reviewed}
            >
              <div className="card-tag">{book.tag}</div>
              <h2 className="card-title">{book.title}</h2>
              <p className="card-meta">
                <span>{book.author}</span> •{' '}
                <span>Rating: {book.ratingLabel}</span>
              </p>
              <p className="card-body">{book.description}</p>
              <div className="card-badges">
                {book.saved && <span className="badge">Saved</span>}
                {book.favorite && <span className="badge">Favorite</span>}
                {book.rated && <span className="badge">Rated</span>}
                {book.reviewed && <span className="badge">Reviewed</span>}
              </div>
            </article>
          ))}

          {filteredBooks.length === 0 && (
            <p className="empty-message">
              No books match this filter yet. Try switching to a different
              filter.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
