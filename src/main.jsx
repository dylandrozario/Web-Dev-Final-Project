import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BooksProvider } from './context/BooksContext'
import { RecommendationBooksProvider } from './context/RecommendationBooksContext'
import { UserLibraryProvider } from './context/UserLibraryContext'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BooksProvider>
        <RecommendationBooksProvider>
          <UserLibraryProvider>
            <App />
          </UserLibraryProvider>
          </RecommendationBooksProvider>
        </BooksProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
