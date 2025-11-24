import { useState } from 'react'
import './AIAssistant.css'

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const handleSend = () => {
    // No functionality yet - just visual
    setMessage('')
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className={`ai-chat-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="ai-chat-box">
          <div className="ai-chat-header">
            <h3>AI Library Assistant</h3>
            <button 
              className="ai-chat-close"
              onClick={toggleChat}
              aria-label="Close AI Assistant"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="ai-chat-messages">
            <div className="ai-message ai-bot-message">
              <p>Hello! I'm your AI Library Assistant. How can I help you today?</p>
            </div>
            <p className="ai-placeholder-note">AI Assistant features coming soon...</p>
          </div>
          <div className="ai-chat-input-container">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask me anything about books..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend()
                }
              }}
            />
            <button className="ai-send-btn" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
