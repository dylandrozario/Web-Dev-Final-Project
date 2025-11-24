import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AdvancedSearch from './pages/AdvancedSearch'
import BookDetails from './pages/BookDetails'
import BookReviews from './pages/BookReviews'
import ResourcesPage from './pages/ResourcesPage'
import MyLibrary from './pages/MyLibrary'
import SignIn from './pages/SignIn'
import About from './pages/About'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import BookList from './pages/BookList'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/book-details" element={<BookDetails />} />
          <Route path="/book/isbn/:isbn" element={<BookDetails />} />
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
    </Router>
  )
}

export default App
