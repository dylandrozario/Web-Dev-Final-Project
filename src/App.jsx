import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AdvancedSearch from './pages/AdvancedSearch'
import ResourcesPage from './pages/ResourcesPage'
import MyLibrary from './pages/MyLibrary'
import SignIn from './pages/SignIn'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/my-library" element={<MyLibrary />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
