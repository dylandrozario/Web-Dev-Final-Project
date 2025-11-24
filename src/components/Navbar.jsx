import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleNavClick = (path) => {
    navigate(path)
    setIsAccountDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false)
      }
    }

    if (isAccountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountDropdownOpen])

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <h1 className="navbar-logo">Library Catalog AI</h1>
      </div>
      <div className="navbar-links">
        <button
          className={`nav-link icon-link ${
            location.pathname === '/advanced-search' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/advanced-search')}
          aria-label="Advanced Search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        <button
          className={`nav-link icon-link ${
            location.pathname === '/book-reviews' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/book-reviews')}
          aria-label="Book Reviews"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
        <button
          className={`nav-link icon-link ${
            location.pathname === '/resources' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/resources')}
          aria-label="Resources"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </button>
        <div className="account-dropdown-wrapper" ref={dropdownRef}>
          <button
            className={`nav-link icon-link ${
              location.pathname === '/my-library' || location.pathname === '/sign-in' ? 'active' : ''
            }`}
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            aria-label="Account"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          {isAccountDropdownOpen && (
            <div className="account-dropdown">
              <button
                className="dropdown-item"
                onClick={() => handleNavClick('/my-library')}
              >
                My Library
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleNavClick('/sign-in')}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

