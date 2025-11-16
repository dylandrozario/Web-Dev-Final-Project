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
        {isOpen ? '✕' : '💬'}
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
              ✕
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
