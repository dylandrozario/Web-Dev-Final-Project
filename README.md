# Library Catalog AI

A modern React-based library catalog frontend with AI integration capabilities. This application provides an intuitive interface for browsing and searching through a book collection with features like advanced search, genre exploration, personalized recommendations, and more.

## Features

- **AI Assistant** - Placeholder for future AI integration
- **Main Search Bar** - Search by title, author, or ISBN with dropdown results
- **Advanced Search** - Filter books by multiple criteria (genre, rating, date, etc.)
- **Genre Slideshows** - Rotating displays of books by genre
- **New Releases** - Recently published books
- **Trending Books** - Popular books based on ratings and recency
- **Personalized Recommendations** - Top-rated books for users
- **Top Contributors Leaderboard** - Most active reviewers

## Tech Stack

- React 18
- React Router DOM
- Vite
- CSS3 with custom color scheme

## Color Scheme

- Dark Maroon: `#6B1F1F`
- Gold: `#D4AF37`
- White: `#FFFFFF`

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Page components
├── data/            # JSON data files
├── App.jsx          # Main app component with routing
└── main.jsx         # Entry point
```

## Book Data Format

Each book in the catalog follows this structure:

```json
{
  "title": "Book Title",
  "author": "Author Name",
  "releaseDate": "YYYY-MM-DD",
  "isbn": "ISBN-13",
  "rating": 4.5,
  "genre": "Genre Name"
}
```

## Future Backend Integration

The application is designed to easily integrate with a backend API. Key integration points:

- Replace `booksData` import with API calls
- Connect AI Assistant to backend service
- Implement user authentication for personalized features
- Connect leaderboard to real review data
- Add user search history tracking

## License

MIT

