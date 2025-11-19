import { useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (path) => {
    navigate(path)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <h1 className="navbar-logo">Library Catalog AI</h1>
      </div>
      <div className="navbar-links">
        <button
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => handleNavClick('/')}
        >
          Home
        </button>
        <button
          className={`nav-link ${
            location.pathname === '/advanced-search' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/advanced-search')}
        >
          Advanced Search
        </button>
        <button
          className={`nav-link ${
            location.pathname === '/resources' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/resources')}
        >
          Resources
        </button>
        <button
          className={`nav-link ${
            location.pathname === '/my-library' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/my-library')}
        >
          My Library
        </button>
        <button
          className={`nav-link ${
            location.pathname === '/sign-in' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/sign-in')}
        >
          Sign In
        </button>
      </div>
    </nav>
  )
}

export default Navbar

