# Library Catalog AI

An AI-powered library catalog frontend application designed to help Boston College students discover, explore, and engage with the library's collection. The application addresses the underutilization of BC's library catalog by providing an intuitive interface that encourages exploration and discovery.

## Project Overview

This web application transforms how students interact with Boston College's library catalog. Instead of requiring users to know exactly what they're looking for, the platform uses AI assistance and advanced search capabilities to help students discover books, read reviews, and build their personal library collections.

## Features

### Core Functionality

- **Home Page**: Browse new releases, featured books, and curated recommendations
- **Advanced Search**: Comprehensive search with filters for genre, language, publication date, and more
- **Book Reviews**: View and filter book reviews by time period, popularity, and diversity
- **Book Details**: Detailed book information including ratings, reviews, descriptions, and specifications
- **My Library**: Personal collection management with saved books, favorites, ratings, and reviews
- **Resources**: Access to BC library resources, services, and study room booking
- **AI Assistant**: Intelligent chatbot powered by Google Gemini that provides personalized book recommendations based on user preferences

### AI Assistant Capabilities

- Answers questions about BC libraries, study spaces, hours, and services
- Provides personalized book recommendations based on user's reading history
- Analyzes user's favorites, saved books, ratings, and reviews to suggest similar books
- Navigates users to different pages and book details
- Understands natural language queries about books and library resources

### User Features

- **Authentication**: Sign in with Google using BC email addresses
- **Personal Library**: Save books, mark favorites, rate books, and write reviews
- **Review System**: Rate books with or without written reviews, reply to reviews, and like reviews
- **Filtering**: Advanced filtering by genre, publication date, time ranges, and more
- **View Modes**: Switch between list and grid views for book displays
- **Pagination**: Navigate through large book collections with pagination

## Technology Stack

- **Frontend Framework**: React 18.2.0
- **Routing**: React Router DOM 6.30.2
- **Build Tool**: Vite 7.2.4
- **AI Integration**: Google Generative AI (Gemini)
- **Authentication**: Firebase Authentication
- **Search**: Fuse.js for fuzzy search (typo-tolerant, multi-field searching)
- **Styling**: CSS Modules and global CSS
- **Data Sources**: Open Library API, local JSON data

## Installation

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm or yarn package manager
- Google account for Firebase authentication
- Google Gemini API key (for AI Assistant features)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Web-Dev-Final-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Note: The AI Assistant will work without the API key but will display an error message. For full functionality, obtain a Gemini API key from Google AI Studio.

4. **Configure Firebase** (if using authentication)
   
   Update `src/config/firebase.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     // ... other config
   }
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   The application will be available at `http://localhost:5173` (or the port shown in terminal)

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── advanced-search/ # Search and filter components
│   ├── common/          # Shared components (Navbar, AIAssistant, etc.)
│   └── filters/         # Filter modal components
├── context/            # React Context providers
│   ├── AuthContext.jsx      # Authentication state
│   ├── BooksContext.jsx     # Books data management
│   ├── UserLibraryContext.jsx # User library state
│   └── RecommendationBooksContext.jsx # Extended book catalog for recommendations
├── pages/              # Page components
│   ├── home/           # Home page
│   ├── advanced-search/ # Search page (with fuzzy search)
│   ├── book-details/   # Book detail pages
│   ├── book-reviews/   # Book reviews page
│   ├── my-library/     # User library page
│   ├── recommendations/ # Personalized recommendations page
│   └── resources/      # Resources page
├── engine/             # Core algorithms
│   └── recommendationEngine.js # Recommendation similarity algorithm
├── hooks/              # Custom React hooks
│   ├── useRecommendations.js # Recommendation generation hook
│   ├── useBookFinder.js # Book search utilities
│   └── useBookActions.js # Book interaction utilities
├── services/           # API services
│   ├── booksApi.js     # Book data fetching
│   └── openLibraryApi.js # Open Library API integration
├── data/               # Static data files
│   ├── books/          # Book data
│   ├── reviews/        # Review data
│   └── resources/      # Resource data
├── config/             # Configuration files
│   ├── constants.js    # App constants
│   └── firebase.js     # Firebase configuration
├── styles/             # Global styles
└── utils/              # Utility functions
    ├── storageUtils.js  # LocalStorage utilities
    └── bookUtils.js     # Book-related utilities
```

## Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build production-ready application
- `npm run preview`: Preview production build locally

## Key Features Explained

### AI Assistant

The AI Assistant uses Google's Gemini API to provide intelligent responses about:
- Book recommendations based on user preferences
- BC library information (hours, services, study spaces) with web search grounding for current information
- Navigation assistance
- General questions about the application

The assistant analyzes user's reading history including:
- Favorite genres
- Preferred authors
- Rating patterns
- Review themes
- Saved and favorited books

### Recommendation System

The application features an intelligent book recommendation engine that provides personalized suggestions based on your reading preferences:

**How It Works:**
- **Similarity-Based Algorithm**: Calculates similarity scores between candidate books and your library
- **Primary Factors**: 
  - Genre matching (2 points) - Books in the same genre as your saved/favorited/rated books
  - Author matching (1 point) - Books by authors you've previously enjoyed
- **User Data Considered**:
  - Saved books
  - Favorited books
  - Rated books (only ratings above 3 stars)
- **Tiered Selection**: Recommendations are divided into three tiers (high, medium, low similarity) and shuffled within each tier to provide diverse suggestions
- **Smart Caching**: Recommendations are cached in localStorage and automatically regenerate when your library changes
- **Active Updates**: The system actively monitors your library changes (saves, favorites, ratings) and updates recommendations in real-time
- **No Recommendations**: If you don't have any saved, favorited, or highly-rated books, the system won't show recommendations (prevents irrelevant suggestions)

**Recommendation Reasons**: Each recommended book includes a reason explaining why it was suggested (e.g., "Similar to your Fantasy books" or "Same author as 'Book Title'").

**Display**: Recommendations are shown on a dedicated page with pagination (10 books per page) and categorized by genre or recommendation reason.

### Book Search and Filtering

- **Fuzzy Search**: Powered by Fuse.js for intelligent, typo-tolerant searching
  - Searches across book titles (40% weight), authors (30% weight), descriptions (20% weight), and genres (10% weight)
  - Handles typos, partial matches, and word order variations
  - Minimum match threshold of 0.4 for balanced precision and recall
- Real-time search as you type
- Filter by genre, publication date, language
- Time range filters (all-time, decades, years, custom ranges)
- Sorting options: Popular, Esoteric, Diverse
- Pagination for large result sets (10 books per page)

### User Library

Users can:
- Save books to their library
- Mark books as favorites
- Rate books (0-5 stars)
- Write and edit reviews
- View all their saved, rated, and reviewed books in one place

### Book Reviews

- View all reviews for a book
- Filter reviews by time period
- Sort by popularity, esotericism, or diversity
- Interactive review threads with replies
- Like reviews and replies

## Configuration

### Environment Variables

- `VITE_GEMINI_API_KEY`: Required for AI Assistant functionality

### Firebase Setup

If using Firebase authentication:
1. Create a Firebase project
2. Enable Google Authentication
3. Configure authorized domains
4. Update `src/config/firebase.js` with your credentials

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The application uses React Context for state management
- Local storage is used for persisting user library data
- Book data is cached in local storage with 1-hour expiration
- The AI Assistant requires an active internet connection
- Some features require user authentication (BC email)

## Future Enhancements

- Integration with actual BC library catalog API
- Real-time book availability checking
- Study room reservation system
- Book recommendation notifications
- Social features for sharing reviews

## License

This project is part of a web development course at Boston College.

## Contact

For questions or issues, please refer to the project repository or contact the development team.
