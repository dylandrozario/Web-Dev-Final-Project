import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import resourcesData from '../../data/resources/resources.json'
import './ResourceDetail.css'

function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const resource = useMemo(() => {
    return resourcesData.find(r => r.id === parseInt(id))
  }, [id])

  // Redirect to external URL if available
  if (resource?.externalUrl) {
    // Open in new tab
    window.open(resource.externalUrl, '_blank', 'noopener,noreferrer')
    return (
      <div className="resource-detail-page">
        <div className="resource-detail-container">
          <div className="resource-redirecting">
            <p>Opening {resource.title} in a new tab...</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
              If the page didn't open, <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>click here</a>.
            </p>
            <button onClick={() => navigate('/resources')} className="back-button" style={{ marginTop: '2rem' }}>
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="resource-detail-page">
        <div className="resource-detail-container">
          <div className="resource-not-found">
            <h1>Resource Not Found</h1>
            <p>The resource you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/resources')} className="back-button">
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Generate mock content based on resource type
  const mockContent = useMemo(() => {
    const contentMap = {
      1: {
        title: "Digital Archives & Special Collections",
        sections: [
          {
            heading: "About This Resource",
            text: "The Digital Archives & Special Collections provides online access to historical documents, rare manuscripts, and archival materials from Boston College's extensive collections. Our digitized materials span centuries of history, including personal papers, institutional records, photographs, maps, and multimedia content."
          },
          {
            heading: "What's Available",
            text: "Browse through thousands of digitized items including historical photographs, letters, diaries, official documents, and rare books. Collections are organized by topic, time period, and format for easy navigation."
          },
          {
            heading: "How to Access",
            text: "All digital archives are freely accessible online. Simply browse our collections, use the search function to find specific materials, or explore curated exhibits. No login required for viewing, though some features may require a BC account."
          },
          {
            heading: "Featured Collections",
            text: "Explore our featured collections including Boston College History, Irish Studies Archives, Catholic Collections, and University Archives. Each collection offers unique insights into different aspects of history and culture."
          }
        ],
        features: [
          "High-resolution image viewing",
          "Advanced search and filtering",
          "Curated digital exhibits",
          "Download options for research",
          "Citation tools"
        ]
      },
      2: {
        title: "Research Databases",
        sections: [
          {
            heading: "About This Resource",
            text: "Access comprehensive academic databases for scholarly research and articles. Our collection includes thousands of databases covering all academic disciplines, from humanities and social sciences to STEM fields and professional studies."
          },
          {
            heading: "Database Categories",
            text: "Browse databases by subject area including Arts & Humanities, Business & Economics, Education, Engineering, Health Sciences, Law, Science & Technology, and Social Sciences. Each category contains specialized databases tailored to your research needs."
          },
          {
            heading: "Popular Databases",
            text: "Access leading databases like JSTOR, ProQuest, EBSCO, ScienceDirect, and many more. These platforms provide access to millions of peer-reviewed articles, books, dissertations, and conference proceedings."
          },
          {
            heading: "Getting Started",
            text: "Use our database finder tool to locate the best databases for your research topic. All databases are accessible on-campus or remotely with your BC credentials. Need help? Contact our research librarians for assistance."
          }
        ],
        features: [
          "Access to 500+ databases",
          "Remote access with BC login",
          "Full-text articles",
          "Citation management tools",
          "Research guides and tutorials"
        ]
      },
      3: {
        title: "E-Book Collection",
        sections: [
          {
            heading: "About This Resource",
            text: "Access thousands of digital books available for instant download and reading. Our e-book collection includes academic texts, reference materials, fiction, and non-fiction titles across all disciplines. Read on your computer, tablet, or mobile device."
          },
          {
            heading: "E-Book Platforms",
            text: "Browse e-books through multiple platforms including OverDrive, EBSCO eBooks, ProQuest Ebook Central, and SpringerLink. Each platform offers different features and reading experiences to suit your preferences."
          },
          {
            heading: "How to Borrow",
            text: "Most e-books can be borrowed instantly with your BC account. Simply find the book you want, click 'Borrow' or 'Download', and start reading. Loan periods vary by platform, typically ranging from 7 to 21 days."
          },
          {
            heading: "Reading Options",
            text: "Read e-books online in your browser, download to your device, or use dedicated e-reader apps. Many e-books support features like highlighting, note-taking, and text-to-speech for enhanced accessibility."
          }
        ],
        features: [
          "Instant access to thousands of titles",
          "Multiple reading formats",
          "Offline reading options",
          "Highlighting and annotations",
          "Mobile-friendly apps"
        ]
      },
      4: {
        title: "Study Spaces & Equipment",
        sections: [
          {
            heading: "About This Resource",
            text: "Reserve study rooms, access computers, and borrow technology equipment. Our library offers a variety of study spaces to accommodate different learning styles, from quiet individual study areas to collaborative group spaces."
          },
          {
            heading: "Study Rooms",
            text: "Reserve private study rooms for individual or group work. Rooms are equipped with whiteboards, projectors, and comfortable seating. Reservations can be made online up to two weeks in advance."
          },
          {
            heading: "Technology Equipment",
            text: "Borrow laptops, tablets, cameras, audio recorders, and other technology equipment for your academic projects. Equipment loans are available for short-term use, typically 3-7 days depending on the item."
          },
          {
            heading: "Computer Labs",
            text: "Access public computer labs with specialized software for research, data analysis, and multimedia production. Labs include both Windows and Mac computers with access to Adobe Creative Suite, statistical software, and more."
          }
        ],
        features: [
          "Online room reservations",
          "Technology equipment loans",
          "24/7 study spaces",
          "Collaborative work areas",
          "Specialized software access"
        ]
      },
      5: {
        title: "Research Guides & Tutorials",
        sections: [
          {
            heading: "About This Resource",
            text: "Get expert help and step-by-step guides for your academic research projects. Our research guides are created by subject librarians and provide curated resources, search strategies, and research tips tailored to specific disciplines and courses."
          },
          {
            heading: "Subject Guides",
            text: "Browse research guides organized by academic discipline. Each guide includes recommended databases, key resources, search strategies, and citation help specific to that field of study."
          },
          {
            heading: "Tutorials & Workshops",
            text: "Access online tutorials covering topics like database searching, citation management, evaluating sources, and avoiding plagiarism. Attend live workshops or watch recorded sessions at your convenience."
          },
          {
            heading: "Research Help",
            text: "Schedule one-on-one consultations with subject librarians for personalized research assistance. Get help developing research questions, finding sources, and refining your search strategies."
          }
        ],
        features: [
          "Subject-specific research guides",
          "Video tutorials and workshops",
          "One-on-one consultations",
          "Citation management help",
          "Research strategy guidance"
        ]
      },
      6: {
        title: "Interlibrary Loan Services",
        sections: [
          {
            heading: "About This Resource",
            text: "Request books and materials from other libraries across the network. If we don't have a book or article you need, our Interlibrary Loan (ILL) service can borrow it from another library for you, usually at no cost."
          },
          {
            heading: "What You Can Request",
            text: "Request books, articles, dissertations, and other materials not available in our collection. Most requests are fulfilled within 1-2 weeks, though delivery times may vary depending on the lending library."
          },
          {
            heading: "How to Request",
            text: "Submit requests through our online ILL system using your BC credentials. For articles, you'll typically receive a digital copy via email. For books, you'll be notified when the item arrives and can pick it up at the library."
          },
          {
            heading: "Loan Periods & Policies",
            text: "Loan periods are set by the lending library, typically 2-4 weeks. Renewals may be possible depending on the lending library's policies. Some materials may be library-use-only and cannot be taken home."
          }
        ],
        features: [
          "Free service for BC affiliates",
          "Fast article delivery",
          "Access to millions of items",
          "Online request system",
          "Email notifications"
        ]
      }
    }
    return contentMap[resource.id] || contentMap[1]
  }, [resource])

  return (
    <div className="resource-detail-page">
      <div className="resource-detail-container">
        {/* Header */}
        <div className="resource-detail-header" style={{ backgroundColor: resource.color }}>
          <button onClick={() => navigate('/resources')} className="back-button-header">
            ← Back to Resources
          </button>
          <div className="resource-detail-icon">{resource.icon}</div>
          <h1 className="resource-detail-title">{resource.title}</h1>
          <p className="resource-detail-description">{resource.description}</p>
          <div className="resource-detail-stats">
            <span className="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {resource.likes} likes
            </span>
            <span className="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {resource.comments} comments
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="resource-detail-content">
          {mockContent.sections.map((section, index) => (
            <section key={index} className="content-section">
              <h2 className="section-heading">{section.heading}</h2>
              <p className="section-text">{section.text}</p>
            </section>
          ))}

          {/* Features List */}
          <section className="content-section">
            <h2 className="section-heading">Key Features</h2>
            <ul className="features-list">
              {mockContent.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          {/* Call to Action */}
          <div className="resource-cta-section">
            <button className="resource-cta-button" onClick={() => navigate('/resources')}>
              Explore More Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetail

