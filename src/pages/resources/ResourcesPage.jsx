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
