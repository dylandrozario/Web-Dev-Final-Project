import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './AIAssistant.css'
import { useBooks } from '../../../context/BooksContext'
import { useUserLibrary } from '../../../context/UserLibraryContext'
import { useAuth } from '../../../context/AuthContext'
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
  const { library, getAllBooks } = useUserLibrary()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([initialMessage])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Create enriched book data with reviews and descriptions
  const enrichedBooks = useMemo(() => {
    return books.map(book => {
      const reviews = userReviewsData.filter(r => r.bookIsbn === book.isbn)
      const calculatedAvgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + Math.min(5, Math.max(0, r.rating || 0)), 0) / reviews.length 
        : Math.min(5, Math.max(0, book.rating || 0))
      const avgRating = Math.max(0, Math.min(5.0, calculatedAvgRating))
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

  // Analyze user's reading preferences from their library
  const userPreferences = useMemo(() => {
    if (!isAuthenticated || !library || Object.keys(library).length === 0) {
      return null
    }

    const userBooks = getAllBooks()
    if (userBooks.length === 0) {
      return null
    }

    // Analyze genres
    const genreCounts = {}
    userBooks.forEach(book => {
      if (book.genre) {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1
      }
    })
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre)

    // Analyze ratings
    const ratedBooks = userBooks.filter(book => book.rated && book.rating)
    const avgUserRating = ratedBooks.length > 0
      ? ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / ratedBooks.length
      : null
    const favoriteBooks = userBooks.filter(book => book.favorite)
    const savedBooks = userBooks.filter(book => book.saved)
    const reviewedBooks = userBooks.filter(book => book.reviewed && book.review)

    // Extract themes from reviews
    const reviewTexts = reviewedBooks
      .map(book => book.review)
      .filter(Boolean)
      .join(' ')

    // Analyze authors
    const authorCounts = {}
    userBooks.forEach(book => {
      if (book.author) {
        authorCounts[book.author] = (authorCounts[book.author] || 0) + 1
      }
    })
    const favoriteAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([author]) => author)

    return {
      totalBooks: userBooks.length,
      topGenres,
      avgUserRating,
      favoriteBooks: favoriteBooks.map(b => ({ title: b.title, author: b.author, genre: b.genre, rating: b.rating })),
      savedBooks: savedBooks.map(b => ({ title: b.title, author: b.author, genre: b.genre })),
      ratedBooks: ratedBooks.map(b => ({ title: b.title, author: b.author, genre: b.genre, rating: b.rating })),
      reviewedBooks: reviewedBooks.map(b => ({ title: b.title, author: b.author, genre: b.genre, review: b.review })),
      reviewTexts,
      favoriteAuthors
    }
  }, [isAuthenticated, library, getAllBooks])

  const siteContext = useMemo(() => {
    // Create detailed book information for recommendations
    const bookDetails = enrichedBooks.map(book => {
      const topReviews = book.reviews.slice(0, 2).map(r => r.text).join(' | ')
      return `Title: ${book.title} | Author: ${book.author} | Genre: ${book.genre || 'Fiction'} | Rating: ${book.avgRating}/5 | Pages: ${book.pages || 'N/A'} | Publisher: ${book.publisher || 'N/A'} | Description: ${book.description} | Reviews: ${topReviews} | ISBN: ${book.isbn}`
    }).join('\n')

    // Build user preferences section
    let userPreferencesSection = ''
    if (userPreferences) {
      const prefs = userPreferences
      userPreferencesSection = [
        '',
        'USER READING PREFERENCES (use these to personalize recommendations):',
        `- Total books in library: ${prefs.totalBooks}`,
        prefs.topGenres.length > 0 ? `- Favorite genres: ${prefs.topGenres.join(', ')}` : '',
        prefs.avgUserRating ? `- Average rating given: ${prefs.avgUserRating.toFixed(1)}/5` : '',
        prefs.favoriteAuthors.length > 0 ? `- Favorite authors: ${prefs.favoriteAuthors.join(', ')}` : '',
        prefs.favoriteBooks.length > 0 ? `- Favorite books (${prefs.favoriteBooks.length}): ${prefs.favoriteBooks.slice(0, 5).map(b => `${b.title} by ${b.author}${b.rating ? ` (rated ${b.rating}/5)` : ''}`).join('; ')}` : '',
        prefs.ratedBooks.length > 0 ? `- Rated books (${prefs.ratedBooks.length}): ${prefs.ratedBooks.slice(0, 5).map(b => `${b.title} by ${b.author} (${b.rating}/5)`).join('; ')}` : '',
        prefs.reviewedBooks.length > 0 ? `- Reviewed books (${prefs.reviewedBooks.length}): ${prefs.reviewedBooks.slice(0, 3).map(b => `${b.title} by ${b.author}`).join('; ')}` : '',
        prefs.reviewTexts ? `- Themes from user reviews: ${prefs.reviewTexts.substring(0, 500)}` : '',
        '',
        'When making recommendations, prioritize:',
        '1. Books in the user\'s favorite genres',
        '2. Books by authors the user has favorited or rated highly',
        '3. Books with similar themes to what the user has reviewed',
        '4. Books with ratings similar to what the user typically rates',
        '5. Books similar to the user\'s favorites or highly-rated books'
      ].filter(Boolean).join('\n')
    }
    
    return [
      'You are the BC Library Catalog AI assistant. You answer questions about this website, its features, AND Boston College libraries, services, and resources.',
      '',
      'CRITICAL RULES:',
      '1. If user says "take me to X" or "go to X" where X is a page name → Navigate to that page',
      '2. If user says "book a study room", "reserve a study room", "book study room", or similar phrases about study rooms → Navigate to /resources page',
      '3. If user says "what is X" or "tell me about X" → Provide explanation in chat (do NOT navigate)',
      '4. If user says "take me to X book" or "show me X book" where X is a book title → Navigate to that book\'s details page',
      '5. If user asks to "find a book", "recommend a book", "I want a book about X", "suggest a book", "help me find", or similar → Recommend books based on their preferences, matching by genre, rating, reviews, description, and specifications',
      '6. If user asks about BC libraries, study spaces, hours, services, printing, borrowing, or any library-related questions → Answer using the BC Library knowledge base below',
      '7. If the request is not about this website, BC libraries, or cannot be understood → Respond with "Sorry, I couldn\'t understand that. I can help with questions about this website, BC libraries, and books available here."',
      '',
      'BOSTON COLLEGE LIBRARIES KNOWLEDGE BASE:',
      '',
      '## Libraries Overview:',
      'Boston College has 8 libraries with nearly 3 million volumes:',
      '- O\'Neill Library: Main research library on Chestnut Hill campus, over 1,400 seats',
      '- Bapst Library: Quiet/art-focused library with Gothic architecture, 400 quiet study spaces, 51,000+ volumes on art/architecture/museum studies/photography',
      '- Burns Library: Rare books and special collections, 300,000+ books, 17 million rare manuscripts/artifacts, largest Irish collection in Western Hemisphere',
      '- Educational Resource Center (ERC): K-12 education resources, interactive technology room, 50-seat multimedia classroom',
      '- Law Library: 500,000+ volumes, 400+ online databases (Bloomberg Law, LexisNexis, Westlaw), restricted to Law School students',
      '- Social Work Library: Group study spaces, charging stations, technology lab in McGuinn Hall',
      '- Theology & Ministry Library: 250,000 volumes on biblical studies, Catholic theology, canon law, Jesuitica',
      '- O\'Connor Library: Earth sciences materials (seismology, geology, geophysics) at Weston Observatory, access by appointment',
      '',
      '## Study Spaces & Environments:',
      '',
      'O\'Neill Library:',
      '- 1,400+ seats: individual carrels, lounge chairs, tables, group-study rooms',
      '- Quiet study: Levels 4 and 5 (and some parts of level 3) designated for quiet/individual study',
      '- Group/collaborative spaces:',
      '  * Group study rooms on 5th floor (whiteboards, projection, seating for ~6) - reservable',
      '  * 1st floor collaboration room, 3rd floor group tables',
      '- Graduate-only spaces: graduate reading room (4th floor) and graduate-only group study room (Room 511)',
      '',
      'Bapst Library:',
      '- Quiet-study oriented:',
      '  * Gargan Hall (4th floor): Large quiet reading/study room with oak tables and stained glass, books with certain call numbers shelved here',
      '  * Kresge Reading Room (3rd floor): Individual study spaces, computers, printers, scanners, periodicals/reference stacks for in-library use, mezzanine above has study carrels',
      '- Art Stacks (2nd floor): Oak tables, individual study spaces, shared/collaborative area for group work',
      '',
      'Other Libraries:',
      '- Smaller libraries (Social Work, Theology & Ministry, ERC, etc.) provide quiet or collaborative study spaces depending on the library',
      '',
      '## Hours & Access:',
      '- O\'Neill Library: 24/5 during Fall and Spring semesters (open 24 hours Sunday morning through Thursday night, closes Friday evening, reopens Sunday morning)',
      '- Extended/24-7 access: During exam periods, O\'Neill and Bapst\'s Gargan Hall may offer extended/24-7-style access',
      '- Hours vary by season, holiday, and specific library - check official BC Library Hours calendar for up-to-date info',
      '- During holidays/breaks, libraries may have reduced hours or be closed',
      '',
      '## Borrowing & Services:',
      '- Students, faculty, staff, and BC-affiliated users can borrow physical items (books, audiovisual materials) from O\'Neill, Bapst, Social Work, Law, ERC, etc.',
      '- Borrower services at O\'Neill: library-account access (renewals, due dates, course reserves), office pickup/renewal, lockers, general circulation',
      '- Access to 1 million+ e-books and 43,000+ electronic subscriptions',
      '- Interlibrary loans available',
      '- Remote access to library materials for alumni for a few months post-graduation',
      '',
      '## Printing, Tech & Facilities:',
      'O\'Neill Library:',
      '- Technology Walk-in Help Desk on main floor (Level 3): printers, scanners, fax machine, basic computer support for BC community',
      '- Printing pricing (Print Bucks): black & white $0.03/page, color $0.50/page, duplex printing counts two sides accordingly',
      '- Short-term lockers (24-hour) and long-term lockers (academic-year) available at O\'Neill and Bapst (first-come, first-serve)',
      '  * Short-term keys from Level 3 desk',
      '  * Long-term assignments begin in late August',
      '- Connors Family Learning Center (2nd floor): tutoring, writing and academic support',
      '- Digital Studio (2nd floor): digital media work, creation, and analysis',
      '- Reference assistance available both in person and online 24/7',
      '',
      '## Restricted/Special-Access Libraries:',
      '- Law Library: Reserved for Law School students',
      '- Burns Library: Generally for researchers using special collections; general studying may be restricted',
      '',
      '## Digital Resources:',
      '- Digital Collections and Scholarship: Jesuit Online Bibliography, University Repository (theses and dissertations)',
      '- Digital Scholarship Group: expertise in 3D modeling, data visualization, GIS/mapping, web development',
      '- Research guides available',
      '',
      '## Common Questions & Answers:',
      'Q: "Where can I study late at BC?"',
      'A: O\'Neill Library offers 24/5 study during fall and spring semesters (open 24 hours Sunday morning through Thursday night). During exam periods, O\'Neill and Bapst\'s Gargan Hall may have extended 24/7-style hours.',
      '',
      'Q: "Does BC Library have quiet and group study spaces?"',
      'A: Yes. O\'Neill has 1,400+ seats including quiet individual carrels on levels 4-5, reservable group-study rooms on 5th floor, and collaborative spaces. Bapst offers 400 quiet study spaces including Gargan Hall and Kresge Reading Room, plus Art Stacks for group work.',
      '',
      'Q: "Can I print or scan on campus?"',
      'A: Yes. O\'Neill Library has printers, scanners, and a tech-help desk on Level 3. Printing uses Print Bucks: $0.03/page (black-white) or $0.50/page (color).',
      '',
      'Q: "Can I borrow books or materials from BC Library?"',
      'A: Yes. BC-affiliated students, faculty, and staff can borrow physical items (books, AV materials) from major libraries (O\'Neill, Bapst, etc.). Access library account for renewals, due dates, and course reserves.',
      '',
      'Q: "Are there lockers for storage?"',
      'A: Yes. Both short-term (24-hour) and long-term (academic-year) lockers are available at O\'Neill and Bapst (first-come, first-serve). Short-term locker keys can be signed out at the Level 3 desk in O\'Neill.',
      '',
      'Q: "Where can I get academic help or digital media support?"',
      'A: O\'Neill Library houses the Connors Family Learning Center (2nd floor) for writing/tutoring and the Digital Studio (2nd floor) for digital-media work.',
      '',
      'Q: "Are there libraries restricted to certain students?"',
      'A: Yes. The Law Library is for Law School members only. Special-collections libraries like Burns are for researchers; general studying may be limited in those.',
      '',
      'Q: "What are the library hours?"',
      'A: O\'Neill is 24/5 during fall and spring semesters. Hours vary by library, time of week, and academic calendar. Check the official BC Library Hours page for up-to-date information.',
      '',
      'BOOK RECOMMENDATION INSTRUCTIONS:',
      'When recommending books, analyze the user\'s request AND their reading history (if available):',
      '- Genre preferences (from request OR user\'s favorite genres from their library)',
      '- Rating preferences (from request OR user\'s typical ratings from their rated books)',
      '- Themes or topics mentioned (from request OR themes extracted from user\'s reviews)',
      '- Book specifications (length, publisher, author style, etc.)',
      '- Review content (what reviewers liked about the book)',
      '- User\'s favorite authors (prioritize books by authors they\'ve favorited or rated highly)',
      '- Similarity to user\'s favorites, saved, or highly-rated books',
      '',
      'Match books by priority (if user preferences are available, use them first):',
      '1. User\'s favorite genres (if available) OR genre match from request',
      '2. Books by user\'s favorite authors (if available)',
      '3. Similar themes to user\'s reviews (if available) OR themes from request',
      '4. Rating similar to user\'s average rating (if available) OR high ratings',
      '5. Similarity to user\'s favorites/saved/rated books',
      '6. Review content (keywords in reviews)',
      '7. Description keywords (themes, topics)',
      '8. Specifications (pages, publisher, etc.)',
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
      userPreferencesSection,
      '',
      'Available Books with Details:',
      bookDetails || 'No books available',
      '',
      'Response Format: Always respond with JSON:',
      '{"reply":"your response text","action":{"type":"navigate","target":"/path"} (optional), "bookIsbn":"isbn" (optional for book navigation), "recommendations":[{"title":"Book Title","isbn":"isbn","reason":"why it matches"}] (optional for recommendations)}',
      '',
      'Examples:',
      '- User: "take me to book reviews" → {"reply":"Taking you to Book Reviews.","action":{"type":"navigate","target":"/book-reviews"}}',
      '- User: "take me to book a study room" → {"reply":"Taking you to Resources where you can book a study room.","action":{"type":"navigate","target":"/resources"}}',
      '- User: "book a study room" → {"reply":"Taking you to Resources where you can book a study room.","action":{"type":"navigate","target":"/resources"}}',
      '- User: "reserve a study room" → {"reply":"Taking you to Resources where you can reserve a study room.","action":{"type":"navigate","target":"/resources"}}',
      '- User: "what is advanced search" → {"reply":"Advanced Search is a page where you can search books by title, author, genre, and more. It has filters to help you find exactly what you\'re looking for."}',
      '- User: "take me to The Great Gatsby book" → {"reply":"Taking you to The Great Gatsby.","action":{"type":"navigate","target":"/book/isbn/978-0-7432-7356-5"},"bookIsbn":"978-0-7432-7356-5"}',
      '- User: "find me a fantasy book" → {"reply":"Here are some fantasy recommendations:","recommendations":[{"title":"The Lord of the Rings","isbn":"978-0-544-00035-4","reason":"Epic fantasy (4.9/5)"},{"title":"The Hobbit","isbn":"978-0-547-92822-7","reason":"Classic adventure (4.8/5)"}]}',
      '- User: "I want a highly rated book about society" → {"reply":"Here are highly-rated books about society:","recommendations":[{"title":"To Kill a Mockingbird","isbn":"978-0-06-112008-4","reason":"Justice themes (4.8/5)"},{"title":"1984","isbn":"978-0-452-28423-4","reason":"Social commentary (4.7/5)"}]}',
      '- User: "where can I study late at BC?" → {"reply":"O\'Neill Library offers 24/5 study during fall and spring semesters (open 24 hours Sunday morning through Thursday night). During exam periods, O\'Neill and Bapst\'s Gargan Hall may have extended 24/7-style hours."}',
      '- User: "can I print at the library?" → {"reply":"Yes! O\'Neill Library has printers, scanners, and a tech-help desk on Level 3. Printing uses Print Bucks: $0.03/page for black & white or $0.50/page for color."}',
      '- User: "what is the weather" → {"reply":"Sorry, I couldn\'t understand that. I can help with questions about this website, BC libraries, and books available here."}'
    ].join('\n')
  }, [enrichedBooks, userPreferences])

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
      const isStudyRoomRequest = /book.*study room|reserve.*study room|study room.*book|study room.*reserve/i.test(userPrompt)
      const isNavigationRequest = /take me to|go to|navigate to|show me|open/i.test(userPrompt)
      const isQuestionRequest = /what is|tell me about|explain|what's/i.test(userPrompt)
      const isRecommendationRequest = /find.*book|recommend.*book|suggest.*book|want.*book|looking for.*book|help.*find|book.*about/i.test(userPrompt)
      
      // Known page navigation phrases - skip book detection for these
      const knownPagePhrases = [
        'my library', 'my-library', 'my library page',
        'book a study room', 'book study room', 'reserve study room', 'study room',
        'home', 'advanced search', 'book reviews', 'resources', 'sign in', 'sign-in',
        'about', 'faq', 'contact', 'privacy'
      ]
      const isKnownPageNavigation = knownPagePhrases.some(phrase => lowerPrompt.includes(phrase))
      
      // Try to extract book title - check if prompt contains a book title
      // BUT skip if it's a study room request or known page navigation
      let bookIsbn = null
      let detectedBook = null
      
      // Only try to detect books if it's not a study room request or known page navigation
      if (!isStudyRoomRequest && !isKnownPageNavigation) {
        // First, try to find if the prompt mentions a book title (even without the word "book")
        // Check all books to see if any title is mentioned in the prompt
        for (const book of books) {
          const bookTitleLower = book.title.toLowerCase()
          // Check if book title appears in the prompt (exact match or contains)
          // But make sure it's not just a partial word match (e.g., "library" matching "My Library")
          if (lowerPrompt.includes(bookTitleLower)) {
            // Additional check: make sure it's not matching a common word that happens to be in a book title
            // Skip if the match is too short or if it's part of a known navigation phrase
            const titleWords = bookTitleLower.split(/\s+/)
            const isLikelyBookMatch = titleWords.length > 1 || bookTitleLower.length > 5
            if (isLikelyBookMatch) {
              detectedBook = book
              bookIsbn = book.isbn
              break
            }
          }
          // Check if any significant word from book title appears in prompt
          const bookWords = bookTitleLower.split(/\s+/).filter(w => w.length > 2)
          const promptWords = lowerPrompt.split(/\s+/)
          // Only match if it's a multi-word title and all words match (more strict)
          if (bookWords.length >= 2 && bookWords.length <= 3 && bookWords.every(word => promptWords.some(pw => pw.includes(word) || word.includes(pw)))) {
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
          // But skip if it's "book a study room" or similar
          if (!isStudyRoomRequest) {
            const bookMatch = userPrompt.match(/(?:take me to|show me|find|go to|open)\s+(.+?)\s+book/i)
            if (bookMatch && bookMatch[1]) {
              const potentialTitle = bookMatch[1].trim()
              // Skip if the potential title is a known page phrase
              if (!knownPagePhrases.some(phrase => potentialTitle.toLowerCase().includes(phrase))) {
                const foundBook = findBookByTitle(potentialTitle)
                if (foundBook) {
                  detectedBook = foundBook
                  bookIsbn = foundBook.isbn
                }
              }
            } else {
              // Try to find book title in the prompt (title before "book")
              const words = userPrompt.split(/\s+/)
              const bookIndex = words.findIndex(w => w.toLowerCase() === 'book')
              if (bookIndex > 0) {
                const potentialTitle = words.slice(0, bookIndex).join(' ').replace(/^(take me to|show me|find|go to|open)\s+/i, '').trim()
                // Skip if the potential title is a known page phrase
                if (!knownPagePhrases.some(phrase => potentialTitle.toLowerCase().includes(phrase))) {
                  const foundBook = findBookByTitle(potentialTitle)
                  if (foundBook) {
                    detectedBook = foundBook
                    bookIsbn = foundBook.isbn
                  }
                }
              }
            }
          }
        }
      }
      
      // If it's a navigation request and we found a book, it's definitely a book navigation
      const isBookNavigation = isNavigationRequest && detectedBook !== null

      // Detect if question is specifically about BC libraries (needs web search)
      const isBCLibraryQuestion = /bc.*library|boston college.*library|library.*hours|library.*services|library.*study|library.*printing|library.*borrowing|o'neill|bapst|burns.*library|library.*access|library.*resources/i.test(userPrompt) && 
                                  !isNavigationRequest && 
                                  !isRecommendationRequest

      // Try gemini-flash-latest first, fallback to gemini-pro
      const modelsToTry = ['gemini-flash-latest', 'gemini-pro-latest']
      let rawText = ''
      let lastError = null

      for (const modelName of modelsToTry) {
        try {
          // Configure model with grounding (Google Search) for BC library questions
          let modelConfig = {
            model: modelName,
            generationConfig: {
              temperature: 0.4,
              topP: 0.8,
              topK: 32
            }
          }

          // Enable Google Search grounding for BC library questions
          // Note: This requires Gemini API with grounding enabled
          // If grounding is not available, the model will fall back to standard responses
          if (isBCLibraryQuestion) {
            modelConfig.tools = [{
              googleSearchRetrieval: {}
            }]
          }

          const model = genAI.getGenerativeModel(modelConfig)

          // Build prompt with detected book info if available
          let bookInfo = ''
          if (detectedBook) {
            bookInfo = `\n\nDETECTED BOOK: "${detectedBook.title}" by ${detectedBook.author} (ISBN: ${detectedBook.isbn})\nIf user wants this book, use bookIsbn: "${detectedBook.isbn}" and navigate to: "/book/isbn/${detectedBook.isbn}"`
          }
          
          let recommendationHint = ''
          if (isRecommendationRequest) {
            recommendationHint = '\n\nUSER IS REQUESTING BOOK RECOMMENDATIONS. Analyze their preferences (genre, themes, rating, etc.) and provide 1-3 book recommendations with ISBNs and reasons. Include the recommendations array in your JSON response.'
          }

          let webSearchHint = ''
          if (isBCLibraryQuestion) {
            webSearchHint = '\n\nIMPORTANT: This is a question about BC (Boston College) libraries. Use Google Search grounding to find the most current and accurate information from the BC Library website (library.bc.edu) and other official BC sources. Provide up-to-date information about library hours, services, policies, study spaces, and resources. Cite sources when possible.'
          }
          
          const prompt = `${siteContext}${bookInfo}${recommendationHint}${webSearchHint}\n\nUser question: "${userPrompt}"\n\nAnalyze the user's request and respond appropriately:\n- If they want to navigate to a page, include navigation action with target path\n- If they want to navigate to a book, use the bookIsbn provided above and set target to "/book/isbn/{isbn}"\n- If they're asking for book recommendations, provide recommendations array with title, isbn, and reason\n- If they're asking a question about BC libraries, use web search to find current information and provide a detailed, accurate answer\n- If they're asking a question, provide explanation only (no navigation)\n- If you cannot understand, provide the "sorry couldn't understand" response\n\nIMPORTANT: If a book was detected and user wants to navigate to it, you MUST include both the reply AND the navigation action with bookIsbn.\n\nRespond with JSON format: {"reply":"your response","action":{"type":"navigate","target":"/path"} (optional), "bookIsbn":"isbn" (optional for book navigation), "recommendations":[{"title":"Book Title","isbn":"isbn","reason":"why it matches"}] (optional for recommendations)}`
          
          // Try to generate with grounding, fallback if not available
          let result
          try {
            result = await model.generateContent(prompt)
          } catch (groundingError) {
            // If grounding fails (not available), try without tools
            if (isBCLibraryQuestion && (groundingError.message?.includes('tools') || groundingError.message?.includes('grounding') || groundingError.message?.includes('googleSearch'))) {
              console.warn('Google Search grounding not available, falling back to standard model')
              const fallbackConfig = {
                model: modelName,
                generationConfig: {
                  temperature: 0.4,
                  topP: 0.8,
                  topK: 32
                }
              }
              const fallbackModel = genAI.getGenerativeModel(fallbackConfig)
              result = await fallbackModel.generateContent(prompt)
            } else {
              throw groundingError
            }
          }
          
          const response = await result.response
          rawText = response.text()
          
          // Success - break out of loop
          break
        } catch (modelError) {
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
        
      }
      
      // Navigate based on request type - prioritize study room, known pages, then book navigation
      if (isStudyRoomRequest) {
        // Study room booking - navigate to resources page
        setTimeout(() => {
          handleNavigation('/resources')
        }, 100)
      } else if (isKnownPageNavigation && isNavigationRequest) {
        // Known page navigation - handle directly
        if (lowerPrompt.includes('my library') || lowerPrompt.includes('my-library')) {
          setTimeout(() => {
            handleNavigation('/my-library')
          }, 100)
        } else if (lowerPrompt.includes('home')) {
          setTimeout(() => {
            handleNavigation('/')
          }, 100)
        } else if (lowerPrompt.includes('advanced search')) {
          setTimeout(() => {
            handleNavigation('/advanced-search')
          }, 100)
        } else if (lowerPrompt.includes('book reviews')) {
          setTimeout(() => {
            handleNavigation('/book-reviews')
          }, 100)
        } else if (lowerPrompt.includes('resources')) {
          setTimeout(() => {
            handleNavigation('/resources')
          }, 100)
        } else if (lowerPrompt.includes('sign in') || lowerPrompt.includes('sign-in')) {
          setTimeout(() => {
            handleNavigation('/sign-in')
          }, 100)
        }
      } else if (finalBookIsbn && (isBookNavigation || (isNavigationRequest && !isQuestionRequest))) {
        // Book navigation - always navigate if book was detected and it's a navigation request
        // Use setTimeout to ensure message is displayed before navigation
        setTimeout(() => {
          handleNavigation(`/book/isbn/${finalBookIsbn}`)
        }, 100)
      } else if (isNavigationRequest && !isQuestionRequest) {
        // Regular page navigation
        if (action?.target) {
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
