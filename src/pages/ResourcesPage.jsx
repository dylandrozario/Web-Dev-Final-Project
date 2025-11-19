import React, { useState } from 'react'

const RESOURCE_DATA = [
  {
    id: 1,
    category: 'event',
    tag: 'Event',
    title: 'Research Essentials Workshop',
    meta: "O'Neill Library, Instruction Room 307 • Oct 25, 2025 · 3:00–4:00 PM",
    body:
      'Learn how to navigate the library catalog, use subject databases, and cite sources correctly for your next paper.',
    cta: 'View details',
  },
  {
    id: 2,
    category: 'service',
    tag: 'Service',
    title: 'One-on-One Research Consultation',
    meta: 'By appointment • All BC Libraries',
    body:
      'Book a 30-minute session with a librarian to get personalized help with topic selection, search strategies, and organizing sources.',
    cta: 'Book a consultation',
  },
  {
    id: 3,
    category: 'guide',
    tag: 'Guide',
    title: 'First-Year Survival Guide to the Library',
    meta: 'Online guide • Updated Sept 2025',
    body:
      'A quickstart guide for new students covering study spaces, borrowing policies, printing, and where to start your research.',
    cta: 'Open guide',
  },
  {
    id: 4,
    category: 'database',
    tag: 'Database',
    title: 'JSTOR',
    meta: 'Multidisciplinary • Peer-reviewed journals & books',
    body:
      'Access thousands of academic articles across humanities, social sciences, and more, all through your BC login.',
    cta: 'Access database',
  },
  {
    id: 5,
    category: 'event',
    tag: 'Event',
    title: 'Late Night Study & Snacks',
    meta: 'Bapst Library Reading Room • Dec 10, 2025 · 8:00–11:00 PM',
    body:
      'Drop in for quiet study time, extended hours, and free snacks during finals week.',
    cta: 'Add to calendar',
  },
  {
    id: 6,
    category: 'service',
    tag: 'Service',
    title: 'Equipment & Tech Lending',
    meta: "O'Neill Library Help Desk",
    body:
      'Borrow laptops, chargers, cameras, microphones, and more for short-term academic use.',
    cta: 'See equipment list',
  },
  {
    id: 7,
    category: 'guide',
    tag: 'Guide',
    title: 'Citation Styles (APA, MLA, Chicago)',
    meta: 'Online guide • Writing & Citing',
    body:
      'Step-by-step instructions and examples for citing sources in APA, MLA, and Chicago style with links to templates.',
    cta: 'View citation help',
  },
  {
    id: 8,
    category: 'database',
    tag: 'Database',
    title: 'PsycINFO',
    meta: 'Psychology & social sciences',
    body:
      'Search journal articles, book chapters, and dissertations in psychology and related fields.',
    cta: 'Access database',
  },
]

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResources = RESOURCE_DATA.filter((item) => {
    const matchesFilter =
      activeFilter === 'all' || item.category === activeFilter
    const textBlob = `${item.title} ${item.meta} ${item.body}`.toLowerCase()
    const matchesSearch = textBlob.includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="page-shell resources-page">
      <section className="page-header-block">
        <h1>Resources &amp; Highlights</h1>
        <p className="page-subtitle">
          Explore events, services, guides, and databases available through the
          Boston College Libraries.
        </p>
      </section>

      <section className="filters-section">
        <div className="filter-buttons">
          <button
            className={
              'chip' + (activeFilter === 'all' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={
              'chip' + (activeFilter === 'event' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('event')}
          >
            Events
          </button>
          <button
            className={
              'chip' + (activeFilter === 'service' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('service')}
          >
            Services
          </button>
          <button
            className={
              'chip' + (activeFilter === 'guide' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('guide')}
          >
            Guides
          </button>
          <button
            className={
              'chip' + (activeFilter === 'database' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('database')}
          >
            Databases
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search resources by title, topic, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search resources"
          />
        </div>
      </section>

      <section className="cards-section" aria-label="Library resources">
        <div className="cards-grid">
          {filteredResources.map((item) => (
            <article
              key={item.id}
              className="card resource-card"
              data-category={item.category}
            >
              <div className="card-tag">{item.tag}</div>
              <h2 className="card-title">{item.title}</h2>
              <p className="card-meta">{item.meta}</p>
              <p className="card-body">{item.body}</p>
              <button className="card-cta">{item.cta}</button>
            </article>
          ))}

          {filteredResources.length === 0 && (
            <p className="empty-message">
              No resources match your search yet. Try a different keyword or
              filter.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
