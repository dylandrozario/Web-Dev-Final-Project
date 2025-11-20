import React, { useState, useRef, useEffect } from 'react'
import './SearchBar.css'

function SearchBar({ value, onChange, results, showResults, onResultClick }) {
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    onChange(e.target.value)
    setIsFocused(true)
  }

  const handleResultClick = (book) => {
    onResultClick(book)
    setIsFocused(false)
  }

  return (
    <div className="search-bar-container">
      <div className="search-form" ref={searchRef}>
        <input
          type="text"
          id="main-search-bar"
          className="search-input"
          placeholder="Search books by title, author, publisher, ..."
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
        />
      </div>
      {showResults && results.length > 0 && isFocused && (
        <div className="search-results" ref={resultsRef}>
          {results.map((book, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => handleResultClick(book)}
            >
              <div className="result-title">{book.title}</div>
              <div className="result-author">{book.author}</div>
              <div className="result-isbn">ISBN: {book.isbn}</div>
            </div>
          ))}
        </div>
      )}
      {showResults && results.length === 0 && isFocused && value.trim() !== '' && (
        <div className="search-results" ref={resultsRef}>
          <div className="no-results">No results found</div>
        </div>
      )}
    </div>
  )
}

export default SearchBar

