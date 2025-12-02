import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { path: '/advanced-search', label: 'Advanced Search', icon: 'search' },
  { path: '/book-reviews', label: 'Book Reviews', icon: 'star' },
  { path: '/resources', label: 'Resources', icon: 'book' }
];

const ICONS = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  book: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleNavClick = useCallback((path) => {
    navigate(path);
    setIsAccountDropdownOpen(false);
  }, [navigate]);

  const handleSignOut = useCallback(() => {
    logout();
    setIsAccountDropdownOpen(false);
    navigate('/');
  }, [logout, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };

    if (isAccountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountDropdownOpen]);

  const accountInitials = user?.name
    ? user.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
    : null;

  const isActive = (path) => location.pathname === path;
  const isAccountActive = () => isActive('/my-library') || isActive('/sign-in');

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <h1 className="navbar-logo">Library Catalog AI</h1>
      </div>
      <div className="navbar-links">
        {NAV_LINKS.map(({ path, label, icon }) => (
          <button
            key={path}
            className={`nav-link icon-link ${isActive(path) ? 'active' : ''}`}
            onClick={() => handleNavClick(path)}
            aria-label={label}
          >
            {ICONS[icon]}
          </button>
        ))}
        
        <div className="account-dropdown-wrapper" ref={dropdownRef}>
          <button
            className={`nav-link icon-link account-trigger ${isAccountActive() ? 'active' : ''}`}
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            aria-label="Account"
          >
            {accountInitials ? (
              <span className="account-initials">{accountInitials}</span>
            ) : (
              ICONS.user
            )}
          </button>
          {isAccountDropdownOpen && (
            <div className="account-dropdown">
              {isAuthenticated && (
                <div className="dropdown-info">
                  <p className="dropdown-name">{user?.name || 'User'}</p>
                  <p className="dropdown-role">{user?.email || ''}</p>
                </div>
              )}
              <button className="dropdown-item" onClick={() => handleNavClick('/my-library')}>
                My Library
              </button>
              {isAuthenticated ? (
                <button className="dropdown-item" onClick={handleSignOut}>
                  Sign Out
                </button>
              ) : (
                <button className="dropdown-item" onClick={() => handleNavClick('/sign-in')}>
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar

