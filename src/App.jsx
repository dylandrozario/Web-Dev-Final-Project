import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import Navbar from './components/common/Navbar'
import Home from './pages/home'
import AdvancedSearch from './pages/advanced-search'
import BookDetails from './pages/book-details/BookDetails'
import BookNotFound from './pages/book-details/BookNotFound'
import BookReviews from './pages/book-reviews'
import ResourcesPage from './pages/resources'
import MyLibrary from './pages/my-library'
import SignIn from './pages/auth'
import { About, FAQ, Contact, Privacy } from './pages/info'
import BookList from './pages/book-list'
import booksData from './data/books/books.json'
import { AuthProvider } from './context/AuthContext'
import './App.css'

// Component to check if book exists and render appropriate component
function BookDetailsWithFallback() {
  const { isbn } = useParams()
  
  const bookExists = useMemo(() => {
    if (!isbn) return false
    
    const normalizedIsbn = isbn.replace(/-/g, '')
    return booksData.some(b => {
      const bookIsbn = b.isbn.replace(/-/g, '')
      return b.isbn === isbn || bookIsbn === normalizedIsbn
    })
  }, [isbn])
  
  return bookExists ? <BookDetails /> : <BookNotFound />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/advanced-search" element={<AdvancedSearch />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/book-details" element={<BookDetails />} />
            <Route path="/book/isbn/:isbn" element={<BookDetailsWithFallback />} />
            <Route path="/book-reviews" element={<BookReviews />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/my-library" element={<MyLibrary />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/book-list/:listType" element={<BookList />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
