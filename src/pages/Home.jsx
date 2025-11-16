import { useState } from 'react'
import booksData from '../data/books.json'
import SearchBar from '../components/SearchBar'
import AIAssistant from '../components/AIAssistant'
import BookSection from '../components/BookSection'
import BookSlideshow from '../components/BookSlideshow'
import './Home.css'

function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)


  // recently added books
  const newReleases = [...booksData]
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))

  // trending books
  const trendingBooks = [...booksData]
    .sort((a, b) => b.rating - a.rating)

  // personal recs
  const recommendations = [...booksData]
    .sort((a, b) => b.rating - a.rating)

  // handle search
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

  return (
    <div className="home">
      <div className="home-content">
        {/* AI Floating Button */}
        <AIAssistant />

        {/* search section */}
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
              onClick={() => {}}
            >
              Advanced Search
            </button>
          </div>
        </section>

        {/* personalized recommendations */}
        <BookSection
          title="Recommended for You"
          books={recommendations}
        />
        
        {/* uncomment to switch to slideshow */}
        {/* <section className="book-section">
          <h2 className="section-title">Recommended for You</h2>
          <BookSlideshow books={recommendations} />
        </section> */}

        {/* trending books */}
        <BookSection
          title="Trending Books"
          books={trendingBooks}
        />
        
        {/* uncomment to switch to slideshow */}
        {/* <section className="book-section">
          <h2 className="section-title">Trending Books</h2>
          <BookSlideshow books={trendingBooks} />
        </section> */}

        {/* recently added */}
        <BookSection
          title="Recently Added"
          books={newReleases}
        />
        
        {/* uncomment to switch to slideshow */}
        {/* <section className="book-section">
          <h2 className="section-title">Recently Added</h2>
          <BookSlideshow books={newReleases} />
        </section> */}
      </div>
    </div>
  )
}

export default Home

