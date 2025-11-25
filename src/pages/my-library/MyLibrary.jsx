import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import myLibraryData from '../../data/books/myLibrary.json'
import libraryStatsData from '../../data/config/libraryStats.json'
import { useAuth } from '../../context/AuthContext'
import './MyLibrary.css'

export default function MyLibrary() {
  const [activeFilter, setActiveFilter] = useState('all')
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const filteredBooks = useMemo(() => {
    return myLibraryData.filter((book) => {
      if (activeFilter === 'saved') return book.saved
      if (activeFilter === 'favorite') return book.favorite
      if (activeFilter === 'rated') return book.rated
      if (activeFilter === 'reviewed') return book.reviewed
      return true
    })
  }, [activeFilter])

  const stats = useMemo(() => {
    const favorites = myLibraryData.filter((b) => b.favorite).length
    const saved = myLibraryData.filter((b) => b.saved).length
    const rated = myLibraryData.filter((b) => b.rated)
    const reviewed = myLibraryData.filter((b) => b.reviewed).length
    const queueCount = myLibraryData.filter((b) => b.saved && !b.rated).length

    const avgRating =
      rated.length > 0
        ? (
            rated.reduce((sum, b) => {
              const rating = parseFloat(b.ratingLabel.replace(/[^0-9.]/g, '')) || 0
              return sum + rating
            }, 0) / rated.length
          ).toFixed(1)
        : libraryStatsData.averageRating

    const completionRate = saved > 0 ? Math.round((rated.length / saved) * 100) : 0

    return {
      favorites: favorites || libraryStatsData.favorites,
      savedBooks: saved || libraryStatsData.savedBooks,
      averageRating: avgRating,
      favoriteGenre: libraryStatsData.favoriteGenre,
      ratedTitles: rated.length || libraryStatsData.ratedTitles || 0,
      reviewedTitles: reviewed || libraryStatsData.reviewedTitles || 0,
      queueCount: queueCount || Math.max(saved - rated.length, 0),
      completionRate
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="my-library-page my-library-locked">
        <section className="locked-panel">
          <p className="locked-eyebrow">Private stacks</p>
          <h1>Sign in to view My Library</h1>
          <p className="locked-description">
            Keep your saved shelves, ratings, and reviews in sync across devices. Sign in with your catalog credentials to continue curating.
          </p>
          <div className="locked-actions">
            <button
              className="locked-primary-btn"
              onClick={() => navigate('/sign-in', { state: { from: '/my-library' } })}
            >
              Access My Library
            </button>
            <button
              className="locked-secondary-btn"
              onClick={() => navigate('/resources')}
            >
              Browse resources
            </button>
          </div>
        </section>
      </div>
    )
  }

  const displayName = user?.name?.split(' ')[0] || 'Reader'

  return (
    <div className="my-library-page">
      <section className="my-library-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Personal stacks · {displayName}</p>
          <h1>My Library</h1>
          <p className="hero-description">
            View your saved books, favorites, ratings, and reading patterns in one place.
          </p>
          <div className="hero-pill-row" aria-hidden="true">
            <span className="hero-pill">Saved lists</span>
            <span className="hero-pill">Favorites</span>
            <span className="hero-pill">Reviews</span>
          </div>
        </div>
        <div className="hero-stats-grid">
          <div className="hero-stat-card">
            <p className="hero-stat-label">Saved books</p>
            <p className="hero-stat-value">{stats.savedBooks}</p>
            <span className="hero-stat-subtext">ready to read</span>
          </div>
          <div className="hero-stat-card">
            <p className="hero-stat-label">Favorites</p>
            <p className="hero-stat-value">{stats.favorites}</p>
            <span className="hero-stat-subtext">most-loved picks</span>
          </div>
          <div className="hero-stat-card">
            <p className="hero-stat-label">Average rating</p>
            <p className="hero-stat-value">{stats.averageRating}</p>
            <span className="hero-stat-subtext">based on your reviews</span>
          </div>
          <div className="hero-stat-card">
            <p className="hero-stat-label">Favorite genre</p>
            <p className="hero-stat-value">{stats.favoriteGenre}</p>
            <span className="hero-stat-subtext">most explored</span>
          </div>
        </div>
      </section>

      <div className="page-shell my-library-shell">
        <section className="stats-section library-panel snapshot-panel">
          <header className="panel-header">
            <div>
              <p className="panel-eyebrow">Snapshot</p>
              <h2>Reading momentum</h2>
            </div>
            <p className="panel-description">
              Fresh signals that surface how consistently you're logging ratings, reviews, and future reads.
            </p>
          </header>
          <div className="snapshot-grid">
            <article className="snapshot-card">
              <p className="snapshot-label">Rated titles</p>
              <p className="snapshot-value">{stats.ratedTitles}</p>
              <span className="snapshot-subtext">books with personal scores</span>
            </article>
            <article className="snapshot-card">
              <p className="snapshot-label">Reviews logged</p>
              <p className="snapshot-value">{stats.reviewedTitles}</p>
              <span className="snapshot-subtext">shared thoughts and highlights</span>
            </article>
            <article className="snapshot-card">
              <p className="snapshot-label">Queue count</p>
              <p className="snapshot-value">{stats.queueCount}</p>
              <span className="snapshot-subtext">saved but not rated yet</span>
            </article>
            <article className="snapshot-card snapshot-progress-card">
              <p className="snapshot-label">Completion rate</p>
              <p className="snapshot-value">{stats.completionRate}%</p>
              <div
                className="snapshot-progress"
                role="img"
                aria-label={`Library completion rate ${stats.completionRate} percent`}
              >
                <div
                  className="snapshot-progress-fill"
                  style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                />
              </div>
              <span className="snapshot-subtext">rated vs saved titles</span>
            </article>
          </div>
        </section>

        <section className="filters-section library-panel tonal-panel">
          <header className="panel-header">
            <div>
              <p className="panel-eyebrow">Filters</p>
              <h2>Focus your shelves</h2>
            </div>
            <p className="panel-description">
              Toggle through quick filters to highlight a specific slice of your library.
            </p>
          </header>
          <div className="filter-buttons">
            <button
              className={'chip' + (activeFilter === 'all' ? ' chip-active' : '')}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={'chip' + (activeFilter === 'saved' ? ' chip-active' : '')}
              onClick={() => setActiveFilter('saved')}
            >
              Saved
            </button>
            <button
              className={'chip' + (activeFilter === 'favorite' ? ' chip-active' : '')}
              onClick={() => setActiveFilter('favorite')}
            >
              Favorites
            </button>
            <button
              className={'chip' + (activeFilter === 'rated' ? ' chip-active' : '')}
              onClick={() => setActiveFilter('rated')}
            >
              Rated
            </button>
            <button
              className={'chip' + (activeFilter === 'reviewed' ? ' chip-active' : '')}
              onClick={() => setActiveFilter('reviewed')}
            >
              Reviewed
            </button>
          </div>
        </section>

        <section className="cards-section library-panel tonal-panel" aria-label="My saved books">
          <header className="panel-header">
            <div>
              <p className="panel-eyebrow">Collection</p>
              <h2>Books you're tracking</h2>
            </div>
            <p className="panel-description">
              Tap a card to dive deeper, leave a review, or move a title into your next reading sprint.
            </p>
          </header>
          <div className="cards-grid my-library-grid">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="card book-card my-library-card"
                data-saved={book.saved}
                data-favorite={book.favorite}
                data-rated={book.rated}
                data-reviewed={book.reviewed}
              >
                <div className="card-tag">{book.tag}</div>
                <h2 className="card-title">{book.title}</h2>
                <p className="card-meta">
                  <span>{book.author}</span> • <span>Rating: {book.ratingLabel}</span>
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
                No books match this filter yet. Try switching to a different filter.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
