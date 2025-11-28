import { useState } from 'react'
import './BookFilterModal.css'

function BookFilterModal({ isOpen, onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [selectedType, setSelectedType] = useState('books')

  if (!isOpen) return null

  // All book formats
  const allFormats = [
    'Hardcover',
    'Paperback',
    'eBook',
    'Audiobook',
    'First Edition',
    'Reprint',
    'Mass Market',
    'Library Binding',
    'Digital'
  ]

  // Main/popular formats
  const mainFormats = [
    'Hardcover',
    'Paperback',
    'eBook',
    'Audiobook'
  ]

  // Book-specific formats
  const bookFormats = [
    'Hardcover',
    'Paperback',
    'eBook',
    'Audiobook',
    'First Edition',
    'Reprint',
    'Mass Market',
    'Library Binding'
  ]

  // Get formats to display based on active tab
  const getDisplayFormats = () => {
    switch (activeTab) {
      case 'main':
        return mainFormats
      case 'books':
        return bookFormats
      case 'all':
      default:
        return allFormats
    }
  }

  const displayFormats = getDisplayFormats()

  const handleFormatClick = (format) => {
    setSelectedFormat(format === selectedFormat ? null : format)
  }

  const handleClear = () => {
    setSelectedFormat(null)
    setActiveTab('all')
    setSelectedType('books')
  }

  const handleClose = () => {
    if (onSelect && selectedFormat) {
      onSelect(selectedFormat)
    }
    onClose()
  }

  return (
    <>
      <div className="book-filter-modal-overlay" onClick={handleClose}></div>
      <div className="book-filter-modal-wrapper">
        <div className="book-filter-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="book-filter-header">
            <div className="book-filter-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className="book-filter-header-text">
              <h3 className="book-filter-title">Book releases</h3>
              <p className="book-filter-subtitle">Books, Journals, Articles, etc.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="book-filter-tabs">
            <button
              className={`book-filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              all
            </button>
            <span className="book-filter-separator">|</span>
            <button
              className={`book-filter-tab ${activeTab === 'main' ? 'active' : ''}`}
              onClick={() => setActiveTab('main')}
            >
              main
            </button>
            <span className="book-filter-separator">|</span>
            <button
              className={`book-filter-tab ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              books
            </button>
            <span className="book-filter-separator">|</span>
            <button
              className={`book-filter-tab ${activeTab === 'journals' ? 'active' : ''}`}
              onClick={() => setActiveTab('journals')}
            >
              journals
            </button>
            <span className="book-filter-separator">|</span>
            <button
              className={`book-filter-tab ${activeTab === 'clear' ? 'active' : ''}`}
              onClick={handleClear}
            >
              clear
            </button>
          </div>

          {/* Format Grid */}
          <div className="book-filter-grid">
            {displayFormats.map((format) => (
              <button
                key={format}
                className={`book-filter-format-btn ${selectedFormat === format ? 'selected' : ''}`}
                onClick={() => handleFormatClick(format)}
              >
                {format}
              </button>
            ))}
          </div>

          {/* Radio Options - Only show for 'all' and 'main' tabs */}
          {(activeTab === 'all' || activeTab === 'main') && (
            <div className="book-filter-radio-group">
              <label className="book-filter-radio">
                <input
                  type="radio"
                  name="bookType"
                  value="books"
                  checked={selectedType === 'books'}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                <span>Books</span>
              </label>
              <label className="book-filter-radio">
                <input
                  type="radio"
                  name="bookType"
                  value="journals"
                  checked={selectedType === 'journals'}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                <span>Journals</span>
              </label>
              <label className="book-filter-radio">
                <input
                  type="radio"
                  name="bookType"
                  value="articles"
                  checked={selectedType === 'articles'}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                <span>Articles</span>
              </label>
            </div>
          )}

          {/* Close Button */}
          <div className="book-filter-actions">
            <button className="book-filter-close-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default BookFilterModal

