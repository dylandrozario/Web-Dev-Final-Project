import { useState } from 'react'
import styles from './SearchForm.module.css'

const SearchForm = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchTerm.trim())
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    // Call onSearch immediately to handle clearing and real-time search
    if (onSearch) {
      onSearch(value.trim())
    }
  }

  const handleDropdownClick = (e) => {
    e.stopPropagation()
    // TODO: Implement dropdown menu functionality
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <div className={styles.searchDropdown}>
        <button 
          type="button" 
          className={styles.dropdownButton}
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
        onChange={handleChange}
      />
      <button type="submit" className={styles.searchButton}>
        Search
      </button> 
    </form>
  )
}

export default SearchForm

