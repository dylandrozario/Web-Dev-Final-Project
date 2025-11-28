import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './AIAssistant.css'
import { useBooks } from '../../../context/BooksContext'
import userReviewsData from '../../../data/reviews/userReviews.json'
import { generateBookDescription } from '../../../utils/bookUtils'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Initialize the Gemini AI client
const getGenAI = () => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    return null
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY)
}

// Debug: Log if API key is loaded (only in development)
if (import.meta.env.DEV) {
  console.log('Gemini API Key loaded:', GEMINI_API_KEY ? 'Yes (hidden)' : 'No - check .env file')
}

const NAV_OPTIONS = [
  { label: 'home', path: '/' },
  { label: 'advanced search', path: '/advanced-search' },
  { label: 'book reviews', path: '/book-reviews' },
  { label: 'resources', path: '/resources' },
  { label: 'my library', path: '/my-library' },
  { label: 'sign in', path: '/sign-in' }
]

const sanitizeJSON = (text = '') => {
  const trimmed = text.trim()
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/```json/gi, '').replace(/```/g, '').trim()
  }
  return trimmed
}

const initialMessage = {
  role: 'bot',
  text: "Hey there! I'm the AI Library Assistant. Ask me about books, reviews, BC library resources, or where to click next."
}

function AIAssistant() {
  const navigate = useNavigate()
  const { books } = useBooks()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([initialMessage])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Create enriched book data with reviews and descriptions
  const enrichedBooks = useMemo(() => {
    return books.map(book => {
      const reviews = userReviewsData.filter(r => r.bookIsbn === book.isbn)
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
        : book.rating || 0
      const totalLikes = reviews.reduce((sum, r) => sum + (r.likes || 0), 0)
      const description = book.description || generateBookDescription(book)
      const reviewTexts = reviews.map(r => r.review).join(' ')
      
      return {
        ...book,
        description,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length,
        totalLikes,
        reviewTexts,
        reviews: reviews.map(r => ({
          rating: r.rating,
          text: r.review,
          likes: r.likes
        }))
      }
    })
  }, [books])

  const siteContext = useMemo(() => {
    // Create detailed book information for recommendations
    const bookDetails = enrichedBooks.map(book => {
      const topReviews = book.reviews.slice(0, 2).map(r => r.text).join(' | ')
      return `Title: ${book.title} | Author: ${book.author} | Genre: ${book.genre || 'Fiction'} | Rating: ${book.avgRating}/5 | Pages: ${book.pages || 'N/A'} | Publisher: ${book.publisher || 'N/A'} | Description: ${book.description} | Reviews: ${topReviews} | ISBN: ${book.isbn}`
    }).join('\n')
    
    return [
      'You are the BC Library Catalog AI assistant. You ONLY answer questions about this website and its features.',
      '',
      'CRITICAL RULES:',
      '1. If user says "take me to X" or "go to X" where X is a page name → Navigate to that page',
      '2. If user says "what is X" or "tell me about X" → Provide explanation in chat (do NOT navigate)',
      '3. If user says "take me to X book" or "show me X book" where X is a book title → Navigate to that book\'s details page',
      '4. If user asks to "find a book", "recommend a book", "I want a book about X", "suggest a book", "help me find", or similar → Recommend books based on their preferences, matching by genre, rating, reviews, description, and specifications',
      '5. If the request is not about this website or cannot be understood → Respond with "Sorry, I couldn\'t understand that. I can only help with questions about this website, its pages, and books available here."',
      '',
      'BOOK RECOMMENDATION INSTRUCTIONS:',
      'When recommending books, analyze the user\'s request for:',
      '- Genre preferences (Fiction, Fantasy, Romance, Dystopian, etc.)',
      '- Rating preferences (highly rated, top rated, etc.)',
      '- Themes or topics mentioned (love, adventure, dystopia, society, etc.)',
      '- Book specifications (length, publisher, author style, etc.)',
      '- Review content (what reviewers liked about the book)',
      '',
      'Match books by:',
      '1. Genre match (exact or similar)',
      '2. Rating (prefer higher ratings)',
      '3. Review content (keywords in reviews)',
      '4. Description keywords (themes, topics)',
      '5. Specifications (pages, publisher, etc.)',
      '',
      'When recommending, provide SHORT, CLEAN responses:',
      '- Keep the main reply brief (1-2 sentences max)',
      '- List 1-3 book recommendations with just title, rating, and one short reason',
      '- Format: "Title (Rating/5) - Brief reason"',
      '- NO long explanations or repetitive text',
      '- Example: "The Lord of the Rings (4.9/5) - Epic fantasy adventure"',
      '',
      'Available Pages and Routes:',
      '- Home (/)',
      '- Advanced Search (/advanced-search)',
      '- Book Reviews (/book-reviews)',
      '- Resources (/resources)',
      '- My Library (/my-library)',
      '- Sign In (/sign-in)',
      '- About (/about)',
      '- FAQ (/faq)',
      '- Contact (/contact)',
      '- Privacy (/privacy)',
      '',
      'Page Descriptions:',
      '- Home: Browse new releases and featured books',
      '- Advanced Search: Search books by title, author, genre, and more',
      '- Book Reviews: View and read book reviews with ratings',
      '- Resources: Access BC library resources and services',
      '- My Library: View saved books, favorites, ratings, and reviews (requires sign-in with @bc.edu email)',
      '',
      'Available Books with Details:',
      bookDetails || 'No books available',
      '',
      'Response Format: Always respond with JSON:',
      '{"reply":"your response text","action":{"type":"navigate","target":"/path"} (optional), "bookIsbn":"isbn" (optional for book navigation), "recommendations":[{"title":"Book Title","isbn":"isbn","reason":"why it matches"}] (optional for recommendations)}',
      '',
      'Examples:',
      '- User: "take me to book reviews" → {"reply":"Taking you to Book Reviews.","action":{"type":"navigate","target":"/book-reviews"}}',
      '- User: "what is advanced search" → {"reply":"Advanced Search is a page where you can search books by title, author, genre, and more. It has filters to help you find exactly what you\'re looking for."}',
      '- User: "take me to The Great Gatsby book" → {"reply":"Taking you to The Great Gatsby.","action":{"type":"navigate","target":"/book/isbn/978-0-7432-7356-5"},"bookIsbn":"978-0-7432-7356-5"}',
      '- User: "find me a fantasy book" → {"reply":"Here are some fantasy recommendations:","recommendations":[{"title":"The Lord of the Rings","isbn":"978-0-544-00035-4","reason":"Epic fantasy (4.9/5)"},{"title":"The Hobbit","isbn":"978-0-547-92822-7","reason":"Classic adventure (4.8/5)"}]}',
      '- User: "I want a highly rated book about society" → {"reply":"Here are highly-rated books about society:","recommendations":[{"title":"To Kill a Mockingbird","isbn":"978-0-06-112008-4","reason":"Justice themes (4.8/5)"},{"title":"1984","isbn":"978-0-452-28423-4","reason":"Social commentary (4.7/5)"}]}',
      '- User: "what is the weather" → {"reply":"Sorry, I couldn\'t understand that. I can only help with questions about this website, its pages, and books available here."}'
    ].join('\n')
  }, [enrichedBooks])

  const toggleChat = () => {
    setIsOpen(prev => !prev)
  }

  const appendMessage = useCallback((message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const handleNavigation = useCallback((target) => {
    if (!target) return
    navigate(target)
  }, [navigate])

  const findBookByTitle = useCallback((title) => {
    if (!title || !books || books.length === 0) return null
    
    const lowerTitle = title.toLowerCase().trim()
    
    // Try exact match first
    let book = books.find(b => b.title.toLowerCase() === lowerTitle)
    if (book) return book
    
    // Try partial match (title contains search or search contains title)
    book = books.find(b => {
      const bookTitleLower = b.title.toLowerCase()
      return bookTitleLower.includes(lowerTitle) || lowerTitle.includes(bookTitleLower)
    })
    if (book) return book
    
    // Try matching by words (for multi-word titles)
    const titleWords = lowerTitle.split(/\s+/).filter(w => w.length > 1)
    if (titleWords.length > 0) {
      book = books.find(b => {
        const bookTitleLower = b.title.toLowerCase()
        // Check if all significant words match
        const matchingWords = titleWords.filter(word => bookTitleLower.includes(word))
        return matchingWords.length >= Math.min(titleWords.length, 2) // At least 2 words or all if less
      })
      if (book) return book
    }
    
    // Special case: if title is just a number (like "1984"), try to match it
    if (/^\d+$/.test(lowerTitle)) {
      book = books.find(b => b.title.toLowerCase().includes(lowerTitle))
      if (book) return book
    }
    
    return null
  }, [books])

  const interpretNavigation = useCallback((replyText, action, bookIsbn) => {
    // If bookIsbn is provided, navigate to book details
    if (bookIsbn) {
      handleNavigation(`/book/isbn/${bookIsbn}`)
      return
    }

    // If action is provided, use it
    if (action?.type === 'navigate' && action.target) {
      handleNavigation(action.target)
      return
    }

    // Fallback: try to extract navigation from text
    const navMatch = replyText.match(/NAVIGATE:([^\s]+)/i)
    if (navMatch?.[1]) {
      handleNavigation(navMatch[1])
      return
    }

    const lowerReply = replyText.toLowerCase()
    const found = NAV_OPTIONS.find(option => lowerReply.includes(option.label))
    if (found) {
      handleNavigation(found.path)
    }
  }, [handleNavigation])

  const requestAssistant = useCallback(async (userPrompt) => {
    const genAI = getGenAI()
    if (!genAI) {
      appendMessage({
        role: 'bot',
        text: 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file and restart the dev server.'
      })
      console.error('Gemini API key is missing. Check .env file and restart dev server.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      // Pre-process user prompt to detect patterns
      const lowerPrompt = userPrompt.toLowerCase()
      const isNavigationRequest = /take me to|go to|navigate to|show me|open/i.test(userPrompt)
      const isQuestionRequest = /what is|tell me about|explain|what's/i.test(userPrompt)
      const isRecommendationRequest = /find.*book|recommend.*book|suggest.*book|want.*book|looking for.*book|help.*find|book.*about/i.test(userPrompt)
      
      // Try to extract book title - check if prompt contains a book title
      let bookIsbn = null
      let detectedBook = null
      
      // First, try to find if the prompt mentions a book title (even without the word "book")
      // Check all books to see if any title is mentioned in the prompt
      for (const book of books) {
        const bookTitleLower = book.title.toLowerCase()
        // Check if book title appears in the prompt (exact match or contains)
        if (lowerPrompt.includes(bookTitleLower)) {
          detectedBook = book
          bookIsbn = book.isbn
          break
        }
        // Check if any significant word from book title appears in prompt
        const bookWords = bookTitleLower.split(/\s+/).filter(w => w.length > 2)
        const promptWords = lowerPrompt.split(/\s+/)
        // Check if all significant words from a short title are in the prompt
        if (bookWords.length <= 3 && bookWords.every(word => promptWords.some(pw => pw.includes(word) || word.includes(pw)))) {
          detectedBook = book
          bookIsbn = book.isbn
          break
        }
        // Special case: if book title is just a number (like "1984"), check if that number is in prompt
        if (/^\d+$/.test(bookTitleLower) && lowerPrompt.includes(bookTitleLower)) {
          detectedBook = book
          bookIsbn = book.isbn
          break
        }
      }
      
      // If no book found yet, try explicit book request patterns
      if (!detectedBook && /book/i.test(userPrompt)) {
        // Extract potential book title (everything after "take me to" or "show me" and before "book")
        const bookMatch = userPrompt.match(/(?:take me to|show me|find|go to|open)\s+(.+?)\s+book/i)
        if (bookMatch && bookMatch[1]) {
          const potentialTitle = bookMatch[1].trim()
          const foundBook = findBookByTitle(potentialTitle)
          if (foundBook) {
            detectedBook = foundBook
            bookIsbn = foundBook.isbn
          }
        } else {
          // Try to find book title in the prompt (title before "book")
          const words = userPrompt.split(/\s+/)
          const bookIndex = words.findIndex(w => w.toLowerCase() === 'book')
          if (bookIndex > 0) {
            const potentialTitle = words.slice(0, bookIndex).join(' ').replace(/^(take me to|show me|find|go to|open)\s+/i, '').trim()
            const foundBook = findBookByTitle(potentialTitle)
            if (foundBook) {
              detectedBook = foundBook
              bookIsbn = foundBook.isbn
            }
          }
        }
      }
      
      // If it's a navigation request and we found a book, it's definitely a book navigation
      const isBookNavigation = isNavigationRequest && detectedBook !== null

      // Try gemini-flash-latest first, fallback to gemini-pro
      const modelsToTry = ['gemini-flash-latest', 'gemini-pro-latest']
      let rawText = ''
      let lastError = null

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.4,
              topP: 0.8,
              topK: 32
            }
          })

          // Build prompt with detected book info if available
          let bookInfo = ''
          if (detectedBook) {
            bookInfo = `\n\nDETECTED BOOK: "${detectedBook.title}" by ${detectedBook.author} (ISBN: ${detectedBook.isbn})\nIf user wants this book, use bookIsbn: "${detectedBook.isbn}" and navigate to: "/book/isbn/${detectedBook.isbn}"`
          }
          
          let recommendationHint = ''
          if (isRecommendationRequest) {
            recommendationHint = '\n\nUSER IS REQUESTING BOOK RECOMMENDATIONS. Analyze their preferences (genre, themes, rating, etc.) and provide 1-3 book recommendations with ISBNs and reasons. Include the recommendations array in your JSON response.'
          }
          
          const prompt = `${siteContext}${bookInfo}${recommendationHint}\n\nUser question: "${userPrompt}"\n\nAnalyze the user's request and respond appropriately:\n- If they want to navigate to a page, include navigation action with target path\n- If they want to navigate to a book, use the bookIsbn provided above and set target to "/book/isbn/{isbn}"\n- If they're asking for book recommendations, provide recommendations array with title, isbn, and reason\n- If they're asking a question, provide explanation only (no navigation)\n- If you cannot understand, provide the "sorry couldn't understand" response\n\nIMPORTANT: If a book was detected and user wants to navigate to it, you MUST include both the reply AND the navigation action with bookIsbn.\n\nRespond with JSON format: {"reply":"your response","action":{"type":"navigate","target":"/path"} (optional), "bookIsbn":"isbn" (optional for book navigation), "recommendations":[{"title":"Book Title","isbn":"isbn","reason":"why it matches"}] (optional for recommendations)}`
          const result = await model.generateContent(prompt)
          const response = await result.response
          rawText = response.text()
          
          // Success - break out of loop
          break
        } catch (modelError) {
          console.log(`Model ${modelName} failed, trying next...`, modelError)
          lastError = modelError
          // Continue to next model
        }
      }

      if (!rawText) {
        throw lastError || new Error('All models failed to generate a response')
      }

      let replyText = rawText
      let action = null
      let responseBookIsbn = null
      let recommendations = null

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(sanitizeJSON(rawText))
        if (parsed.reply) replyText = parsed.reply
        if (parsed.action) action = parsed.action
        if (parsed.bookIsbn) responseBookIsbn = parsed.bookIsbn
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          recommendations = parsed.recommendations
        }
      } catch {
        // fall back to natural text if JSON parsing fails
      }

      // Use bookIsbn from pre-processing if available and response doesn't have one
      const finalBookIsbn = responseBookIsbn || bookIsbn

      // Send main reply first
      appendMessage({ role: 'bot', text: replyText })
      
      // Send recommendations as separate messages for cleaner display
      if (recommendations && recommendations.length > 0) {
        // Small delay to ensure messages appear in order
        setTimeout(() => {
          recommendations.forEach((rec, idx) => {
            setTimeout(() => {
              const recText = `${idx + 1}. ${rec.title} - ${rec.reason || 'Matches your preferences'}`
              appendMessage({ role: 'bot', text: recText })
            }, idx * 200) // Stagger messages by 200ms
          })
          
          // Add navigation hint as final message
          setTimeout(() => {
            appendMessage({ role: 'bot', text: 'Say "take me to [book title]" to see details.' })
          }, recommendations.length * 200)
        }, 300)
        
        console.log('Book recommendations provided:', recommendations)
      }
      
      // Navigate based on request type - prioritize book navigation
      if (finalBookIsbn && (isBookNavigation || (isNavigationRequest && !isQuestionRequest))) {
        // Book navigation - always navigate if book was detected and it's a navigation request
        console.log('Navigating to book:', finalBookIsbn, 'Title:', detectedBook?.title)
        // Use setTimeout to ensure message is displayed before navigation
        setTimeout(() => {
          handleNavigation(`/book/isbn/${finalBookIsbn}`)
        }, 100)
      } else if (isNavigationRequest && !isQuestionRequest) {
        // Regular page navigation
        if (action?.target) {
          console.log('Navigating to page from action:', action.target)
          setTimeout(() => {
            handleNavigation(action.target)
          }, 100)
        } else {
          // Try to infer navigation from text
          interpretNavigation(replyText, action, null)
        }
      }
    } catch (apiError) {
      console.error('AI Assistant error:', apiError)
      const errorMessage = apiError.message || 'Unable to reach the AI assistant right now. Please try again.'
      setError(errorMessage)
      appendMessage({
        role: 'bot',
        text: `Sorry, I encountered an error: ${errorMessage}. Please check your API key and try again.`
      })
    } finally {
      setIsLoading(false)
    }
  }, [siteContext, appendMessage, interpretNavigation, findBookByTitle])

  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    appendMessage({ role: 'user', text: trimmed })
    setInputValue('')
    await requestAssistant(trimmed)
  }

  return (
    <>
      <button 
        className={`ai-chat-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`ai-message ${msg.role === 'bot' ? 'ai-bot-message' : 'ai-user-message'}`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
            <div className="ai-message ai-bot-message">
                <p>Thinking...</p>
            </div>
            )}
            {error && <p className="ai-error-note">{error}</p>}
          </div>

          <div className="ai-chat-input-container">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask me anything about BC Library..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
            />
            <button className="ai-send-btn" onClick={handleSend} disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
