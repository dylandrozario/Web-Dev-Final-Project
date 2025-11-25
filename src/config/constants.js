// Application-wide constants and configuration

export const APP_CONFIG = {
  // Reading time calculation
  WORDS_PER_MINUTE: 200,
  AVERAGE_WORDS_PER_PAGE: 250,
  
  // Default values
  DEFAULT_LANGUAGE: 'English',
  DEFAULT_PUBLISHER: 'Library Catalog Publishing',
  DEFAULT_ESTIMATED_PAGES: 184,
  
  // Rating configuration
  MAX_RATING: 5,
  MIN_RATING: 0,
  
  // Browse options
  BROWSE_OPTIONS: ['Decade', 'Year', 'Month', 'Week'],
  
  // Time range options
  TIME_RANGE_OPTIONS: ['All-time', 'This Year', 'Last Year', 'Custom Range'],
  
  // Filter options
  BOOK_FORMATS: ['Books', 'Journals', 'Articles'],
  
  // Pagination
  ITEMS_PER_PAGE: 25,
  
  // Random data ranges (for mock data generation - should be replaced with API)
  RATING_COUNT_MIN: 1000,
  RATING_COUNT_MAX: 51000,
  REVIEW_COUNT_MIN: 50,
  REVIEW_COUNT_MAX: 500,
  USER_COUNT_MIN: 50,
  USER_COUNT_MAX: 550,
  COMMENTS_MIN: 50,
  COMMENTS_MAX: 550,
  VIEWS_MIN: 200,
  VIEWS_MAX: 2200,

  // Authentication
  AUTH_STORAGE_KEY: 'libraryCatalogAuthUser'
}

export default APP_CONFIG

