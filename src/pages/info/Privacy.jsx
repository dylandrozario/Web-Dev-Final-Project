import '../../styles/common.css'
import './Privacy.css'

function Privacy() {
  return (
    <div className="privacy-page gradient-bg-diagonal">
      <div className="page-container">
        <h1 className="page-title">Privacy Policy</h1>
        <div className="privacy-content">
          <section className="privacy-section content-section">
            <h2 className="section-title">Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, 
              search for books, or leave reviews. This may include your name, email address, and reading preferences.
            </p>
          </section>

          <section className="privacy-section content-section">
            <h2 className="section-title">How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide and improve our library catalog services</li>
              <li>Personalize your experience and recommendations</li>
              <li>Communicate with you about your account and our services</li>
              <li>Analyze usage patterns to enhance our platform</li>
            </ul>
          </section>

          <section className="privacy-section content-section">
            <h2 className="section-title">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="privacy-section content-section">
            <h2 className="section-title">Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. 
              You can manage your account settings or contact us for assistance.
            </p>
          </section>

          <section className="privacy-section content-section">
            <h2 className="section-title">Contact</h2>
            <p className="section-text">
              If you have questions about this Privacy Policy, please contact us at 
              <a href="mailto:privacy@example.edu" className="link-gold"> privacy@example.edu</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Privacy

