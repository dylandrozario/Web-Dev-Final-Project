import React, { useState } from 'react'
import styles from './SearchForm.module.css'

const SearchForm = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim())
    }
  }

  const handleDropdownClick = (e) => {
    e.stopPropagation()
    // Could add dropdown menu here
    console.log('Search category dropdown clicked')
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <div className={styles.searchDropdown}>
        <button 
          type="button" 
          className={styles.dropdownButton}
          onClick={handleDropdownClick}
        >
          ALL <span className={styles.arrow}>▼</span>
        </button>
      </div>
      <input 
        type="search"
        id="search-input"
        name="search"
        className={styles.searchInput}
        placeholder="Search books by title, author, publisher, ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit" className={styles.searchButton}>
        Search
      </button> 
    </form>
  )
}

export default SearchForm

