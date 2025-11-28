import './FAQ.css'
import faqsData from '../../data/config/faqs.json'

function FAQ() {
  const faqs = faqsData

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <div className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.question} className="faq-item">
              <h2 className="faq-question">{faq.question}</h2>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ

