import './Contact.css'

function Contact() {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>
        <div className="contact-content">
          <section className="contact-section">
            <h2>Get in Touch</h2>
            <p>
              Have a question, suggestion, or need assistance? We're here to help!
            </p>
          </section>

          <section className="contact-section">
            <h2>Library Locations</h2>
            <div className="contact-info">
              <div className="contact-item">
                <h3>O'Neill Library</h3>
                <p>140 Commonwealth Avenue<br />Chestnut Hill, MA 02467</p>
                <p>Phone: (617) 552-8000</p>
              </div>
              <div className="contact-item">
                <h3>Burns Library</h3>
                <p>140 Commonwealth Avenue<br />Chestnut Hill, MA 02467</p>
                <p>Phone: (617) 552-3282</p>
              </div>
              <div className="contact-item">
                <h3>Bapst Library</h3>
                <p>140 Commonwealth Avenue<br />Chestnut Hill, MA 02467</p>
                <p>Phone: (617) 552-8000</p>
              </div>
              <div className="contact-item">
                <h3>Law Library</h3>
                <p>885 Centre Street<br />Newton, MA 02459</p>
                <p>Phone: (617) 552-4000</p>
              </div>
            </div>
          </section>

          <section className="contact-section">
            <h2>Email Us</h2>
            <p>
              For general inquiries: <a href="mailto:library@example.edu">library@example.edu</a>
            </p>
            <p>
              For technical support: <a href="mailto:support@example.edu">support@example.edu</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Contact

