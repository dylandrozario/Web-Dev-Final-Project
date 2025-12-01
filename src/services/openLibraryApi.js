
const generateMockRating = () => {
  // Generate rating between 3.5 and 5.0 with one decimal place, clamped to max 5.0
  return Math.min(5.0, Math.round((Math.random() * 1.5 + 3.5) * 10) / 10);
};

const getFirstIsbn = (isbnArray) => {
  if (!isbnArray || !Array.isArray(isbnArray) || isbnArray.length === 0) {
    return null;
  }
  const isbn13 = isbnArray.find(isbn => isbn && isbn.length === 13);
  return isbn13 || isbnArray[0];
};

const formatIsbn = (isbn) => {
  if (!isbn) return null;
  const cleanIsbn = isbn.replace(/-/g, '');
  if (cleanIsbn.length === 13) {
    return `${cleanIsbn.slice(0, 3)}-${cleanIsbn.slice(3, 5)}-${cleanIsbn.slice(5, 10)}-${cleanIsbn.slice(10, 12)}-${cleanIsbn.slice(12)}`;
  }
  if (cleanIsbn.length === 10) {
    return `${cleanIsbn.slice(0, 1)}-${cleanIsbn.slice(1, 6)}-${cleanIsbn.slice(6, 9)}-${cleanIsbn.slice(9)}`;
  }
  return isbn;
};

const getCoverImage = (coverId, isbn) => {
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  }
  if (isbn) {
    const cleanIsbn = isbn.replace(/-/g, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
  }
  return null;
};

const getAuthorName = (authorArray) => {
  if (!authorArray || !Array.isArray(authorArray) || authorArray.length === 0) {
    return 'Unknown Author';
  }
  return authorArray[0];
};
const getGenre = (subjectArray) => {
  if (!subjectArray || !Array.isArray(subjectArray) || subjectArray.length === 0) {
    return 'Fiction';
  }
  const specificGenres = subjectArray.filter(subject => 
    subject && typeof subject === 'string' && subject.length < 30
  );
  return specificGenres[0] || subjectArray[0] || 'Fiction';
};

const formatReleaseDate = (year) => {
  if (!year) return new Date().toISOString().split('T')[0];
  return `${year}-01-01`;
};

const mapOpenLibraryBook = (olBook) => {
  const isbn = getFirstIsbn(olBook.isbn);
  const formattedIsbn = formatIsbn(isbn);
  const coverId = olBook.cover_i;
  
  // Don't use Open Library's first_sentence - we'll get descriptions from Google Books API instead
  // This prevents duplicate sentences and random words issues
  
  return {
    title: olBook.title || 'Untitled',
    author: getAuthorName(olBook.author_name),
    releaseDate: formatReleaseDate(olBook.first_publish_year),
    isbn: formattedIsbn || `OL${olBook.key?.replace('/works/', '') || Date.now()}`,
    rating: generateMockRating(),
    genre: getGenre(olBook.subject),
    image: getCoverImage(coverId, isbn),
    description: null, // Will be fetched from Google Books API
    // store original open lib data for reference
    olKey: olBook.key,
    olEditionKey: olBook.edition_key?.[0],
  };
};

export const fetchBooksFromOpenLibrary = async (limit = 50) => {
  try {
    const query = 'subject:fiction OR subject:nonfiction OR subject:science OR subject:history';
    // Removed first_sentence from fields since we're using Google Books API for descriptions
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,isbn,cover_i,subject,key,edition_key`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.docs || !Array.isArray(data.docs)) {
      throw new Error('Invalid response format from Open Library');
    }
    
    const books = data.docs
      .filter(book => book.title && (book.author_name?.length > 0 || book.isbn?.length > 0))
      .map(mapOpenLibraryBook)
      .slice(0, limit);
    
    return books;
  } catch (error) {
    console.error('Error fetching books from Open Library:', error);
    throw error;
  }
};

