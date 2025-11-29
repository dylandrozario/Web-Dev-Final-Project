import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './ResourcesPage.css'
import resourcesData from '../../data/resources/resources.json'

export default function ResourcesPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResources = useMemo(() => {
    return resourcesData.filter((item) => {
      // Filter by category
      const matchesFilter = activeFilter === 'all' || item.category === activeFilter
      
      // Filter by search term
      const textBlob = `${item.title} ${item.description}`.toLowerCase()
      const matchesSearch = searchTerm.trim() === '' || textBlob.includes(searchTerm.toLowerCase())
      
      return matchesFilter && matchesSearch
    })
  }, [activeFilter, searchTerm])

  const handleResourceClick = (resource) => {
    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank')
    } else {
      navigate(`/resources/${resource.id}`)
    }
  }

  return (
    <div className="resources-page">
      <div className="resources-container">
        {/* Page Header */}
        <div className="resources-header">
          <h1 className="resources-title">Resources &amp; Highlights</h1>
          <p className="resources-subtitle">
            Explore events, services, guides, and databases available through the
            Boston College Libraries.
          </p>
        </div>

        {/* Filters Section */}
        <div className="resources-filters">
          <div className="filter-buttons">
            <button
              className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-chip ${activeFilter === 'service' ? 'active' : ''}`}
              onClick={() => setActiveFilter('service')}
            >
              Services
            </button>
            <button
              className={`filter-chip ${activeFilter === 'database' ? 'active' : ''}`}
              onClick={() => setActiveFilter('database')}
            >
              Databases
            </button>
            <button
              className={`filter-chip ${activeFilter === 'collection' ? 'active' : ''}`}
              onClick={() => setActiveFilter('collection')}
            >
              Collections
            </button>
          </div>

          <div className="resources-search">
            <input
              type="text"
              placeholder="Search resources by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search resources"
            />
          </div>
        </div>

        {/* Resources Grid */}
        <div className="resources-grid">
          {filteredResources.map((item) => (
            <article
              key={item.id}
              className="resource-card"
              onClick={() => handleResourceClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="resource-card-icon" style={{ backgroundColor: item.color }}>
                <span className="resource-icon-emoji">{item.icon}</span>
              </div>
              <h2 className="resource-card-title">{item.title}</h2>
              <p className="resource-card-body">{item.description}</p>
              <div className="resource-card-stats">
                <span className="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {item.likes}
                </span>
                <span className="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {item.comments}
                </span>
              </div>
              <button 
                className="resource-card-cta"
                onClick={(e) => {
                  e.stopPropagation()
                  handleResourceClick(item)
                }}
              >
                {item.externalUrl ? 'Visit Website' : 'View Details'}
              </button>
            </article>
          ))}

          {filteredResources.length === 0 && (
            <p className="resources-empty">
              No resources match your search yet. Try a different keyword or
              filter.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
