import { Routes, Route, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import Navbar from './components/common/Navbar'
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop'
import AIAssistant from './components/common/AIAssistant'
import Home from './pages/home'
import AdvancedSearch from './pages/advanced-search'
import BookDetails from './pages/book-details/BookDetails'
import BookNotFound from './pages/book-details/BookNotFound'
import AllReviews from './pages/book-details/AllReviews'
import BookReviews from './pages/book-reviews'
import ResourcesPage from './pages/resources'
import ResourceDetail from './pages/resources/ResourceDetail'
import SignIn from './pages/auth/SignIn'
import MyLibrary from './pages/my-library'
import { About, FAQ, Contact, Privacy } from './pages/info'
import { useBooks } from './context/BooksContext'
import { isbnMatches } from './utils/bookUtils'
import './App.css'

// Component to check if book exists and render appropriate component
function BookDetailsWithFallback() {
  const { isbn } = useParams()
  
  const { books, loading } = useBooks()

  const bookExists = useMemo(() => {
    // load wait
    if (loading || !books || books.length === 0) return null
    if (!isbn) return false
    return books.some(b => isbnMatches(b.isbn, isbn))
  }, [isbn, books, loading])
  
  // loading delay
  if (loading || bookExists === null) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
            <p>Loading book details...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return bookExists ? <BookDetails /> : <BookNotFound />
}

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <AIAssistant />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/my-library" element={<MyLibrary />} />
        <Route path="/advanced-search" element={<AdvancedSearch />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/book-details" element={<BookDetails />} />
        <Route path="/book/isbn/:isbn" element={<BookDetailsWithFallback />} />
        <Route path="/book/isbn/:isbn/reviews" element={<AllReviews />} />
        <Route path="/book-reviews" element={<BookReviews />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </div>
  )
}

export default App

