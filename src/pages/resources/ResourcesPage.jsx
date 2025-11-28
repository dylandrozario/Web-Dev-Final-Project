import { useState, useMemo } from 'react'
import './ResourcesPage.css'
import resourcesData from '../../data/resources/resourcesData.json'

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResources = useMemo(() => {
    return resourcesData.filter((item) => {
    const matchesFilter =
      activeFilter === 'all' || item.category === activeFilter
      const textBlob = `${item.title} ${item.meta} ${item.body}`.toLowerCase()
      const matchesSearch = textBlob.includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [activeFilter, searchTerm])

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
              className={`filter-chip ${activeFilter === 'event' ? 'active' : ''}`}
              onClick={() => setActiveFilter('event')}
            >
              Events
            </button>
            <button
              className={`filter-chip ${activeFilter === 'service' ? 'active' : ''}`}
              onClick={() => setActiveFilter('service')}
            >
              Services
            </button>
            <button
              className={`filter-chip ${activeFilter === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveFilter('guide')}
            >
              Guides
            </button>
            <button
              className={`filter-chip ${activeFilter === 'database' ? 'active' : ''}`}
              onClick={() => setActiveFilter('database')}
            >
              Databases
            </button>
          </div>

          <div className="resources-search">
            <input
              type="text"
              placeholder="Search resources by title, topic, or description..."
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
              data-category={item.category}
            >
              <div className="resource-tag">{item.tag}</div>
              <h2 className="resource-card-title">{item.title}</h2>
              <p className="resource-card-meta">{item.meta}</p>
              <p className="resource-card-body">{item.body}</p>
              <button className="resource-card-cta">{item.cta}</button>
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
