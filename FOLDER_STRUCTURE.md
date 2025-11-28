# Folder Structure

This document describes the clean, modular folder structure of the application.

## Overview

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (routes)
├── data/               # JSON data files
├── config/             # Configuration files
├── styles/             # Global styles
└── utils/              # Utility functions (future)
```

## Components (`src/components/`)

Components are organized by their purpose:

### Common Components (`components/common/`)
Shared components used across multiple pages:
- **Navbar/** - Main navigation bar
- **AIAssistant/** - Floating AI assistant button
- **BookSection/** - Reusable book display section

### Filter Components (`components/filters/`)
Filter modal components:
- **BookFilterModal/** - Book format filter modal
- **TopFilterModal/** - Top/Popular filter modal
- **TimeRangeModal/** - Time range filter modal

### Feature-Specific Components (`components/advanced-search/`)
Components specific to the advanced search feature:
- **BookCard/** - Individual book card
- **BooksGrid/** - Grid layout for books
- **FilterGroup/** - Filter group component
- **FiltersSidebar/** - Sidebar with filters
- **LibrarySection/** - Library section wrapper
- **SearchForm/** - Search input form
- **TrendingSection/** - Trending books section

## Pages (`src/pages/`)

Pages are organized by feature/route:

### Main Pages
- **home/** - Homepage
- **advanced-search/** - Advanced search page
- **book-details/** - Individual book details page
- **book-reviews/** - Book reviews/charts page
- **book-list/** - Book list page (critic reviews)
- **resources/** - Resources page
- **my-library/** - User's library page

### Auth Pages (`pages/auth/`)
- **SignIn/** - Sign in page

### Info Pages (`pages/info/`)
Static information pages:
- **About/** - About page
- **FAQ/** - FAQ page
- **Contact/** - Contact page
- **Privacy/** - Privacy policy page

Each page folder contains:
- `[PageName].jsx` - Page component
- `[PageName].css` or `[PageName].module.css` - Page styles
- `index.js` - Export file for cleaner imports

## Data (`src/data/`)

Data files are organized by category:

### Books (`data/books/`)
- `books.json` - Main book catalog
- `comments.json` - Book comments (keyed by ISBN)
- `myLibrary.json` - User's library data

### Reviews (`data/reviews/`)
- `userReviews.json` - User review data
- `criticSources.json` - Critic review sources

### Resources (`data/resources/`)
- `resources.json` - Homepage resources
- `resourcesData.json` - Resources page data

### Config (`data/config/`)
Configuration and reference data:
- `faqs.json` - FAQ questions and answers
- `genres.json` - Genre list
- `libraries.json` - Library names
- `libraryStats.json` - Library statistics
- `publications.json` - Publication names

## Configuration (`src/config/`)

- `constants.js` - Application-wide constants and configuration

## Styles (`src/styles/`)

- `index.css` - Global styles and CSS variables

## Import Examples

### Importing Components
```javascript
// Common components
import Navbar from './components/common/Navbar'
import AIAssistant from './components/common/AIAssistant'

// Filter components
import BookFilterModal from './components/filters/BookFilterModal'
```

### Importing Pages
```javascript
// Main pages
import Home from './pages/home'
import BookDetails from './pages/book-details'

// Info pages (multiple exports)
import { About, FAQ, Contact, Privacy } from './pages/info'
```

## Benefits

1. **Clear Organization** - Easy to find files by feature/purpose
2. **Modularity** - Components and pages are self-contained
3. **Scalability** - Easy to add new features without cluttering
4. **Maintainability** - Related files are grouped together
5. **Clean Imports** - Index files allow cleaner import paths

