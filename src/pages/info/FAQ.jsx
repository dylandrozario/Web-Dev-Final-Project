import '../../styles/common.css'
import './FAQ.css'
import faqsData from '../../data/config/faqs.json'

function FAQ() {
  const faqs = faqsData

  return (
    <div className="faq-page gradient-bg-diagonal">
      <div className="page-container">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <div className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.question} className="faq-item content-section">
              <h2 className="faq-question">{faq.question}</h2>
              <p className="faq-answer section-text">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ

