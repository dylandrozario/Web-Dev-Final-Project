import '../../styles/common.css'
import './About.css'

function About() {
  return (
    <div className="about-page gradient-bg-diagonal">
      <div className="page-container">
        <h1 className="page-title">About Library Catalog AI</h1>
        <div className="about-content">
          <section className="about-section content-section">
            <h2 className="section-title">Our Mission</h2>
            <p>
              Library Catalog AI is dedicated to providing an innovative and user-friendly platform 
              for discovering, exploring, and accessing books from our extensive collection. We aim 
              to make literature more accessible and help readers find their next great read.
            </p>
          </section>

          <section className="about-section content-section">
            <h2 className="section-title">What We Offer</h2>
            <ul>
              <li>Comprehensive book catalog with detailed information</li>
              <li>Advanced search and filtering capabilities</li>
              <li>User reviews and ratings</li>
              <li>Library availability tracking</li>
              <li>Personalized recommendations</li>
            </ul>
          </section>

          <section className="about-section content-section">
            <h2 className="section-title">Our Collection</h2>
            <p>
              Our library houses thousands of books across various genres including fiction, 
              fantasy, romance, mystery, and more. We continuously update our catalog to include 
              new releases and classic literature.
            </p>
          </section>

          <section className="about-section content-section">
            <h2 className="section-title">Contact Us</h2>
            <p>
              For inquiries, suggestions, or support, please visit our Contact page or reach out 
              to our library staff.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default About

