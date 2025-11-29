
const generateMockRating = () => {
  // Generate rating between 3.5 and 5.0 with one decimal place
  return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
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
  
  const firstSentence = Array.isArray(olBook.first_sentence) 
    ? olBook.first_sentence.join(' ') 
    : olBook.first_sentence || null;
  
  return {
    title: olBook.title || 'Untitled',
    author: getAuthorName(olBook.author_name),
    releaseDate: formatReleaseDate(olBook.first_publish_year),
    isbn: formattedIsbn || `OL${olBook.key?.replace('/works/', '') || Date.now()}`,
    rating: generateMockRating(),
    genre: getGenre(olBook.subject),
    image: getCoverImage(coverId, isbn),
    description: firstSentence, // will be enhanced by fetchBooksFromOpenLibrary
    // store original open lib data for reference
    olKey: olBook.key,
    olEditionKey: olBook.edition_key?.[0],
  };
};

export const fetchBooksFromOpenLibrary = async (limit = 50) => {
  try {
    const query = 'subject:fiction OR subject:nonfiction OR subject:science OR subject:history';
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,isbn,cover_i,subject,key,edition_key,first_sentence`;
    
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
    

    Promise.all(
      books.map(async (book) => {
        if (book.olKey && !book.description) {
          try {
            // fetch description from work api
            const workUrl = `https://openlibrary.org${book.olKey}.json`;
            const workResponse = await fetch(workUrl);
            if (workResponse.ok) {
              const workData = await workResponse.json();
              const description = 
                workData.description?.value || 
                workData.description || 
                (Array.isArray(workData.first_sentence) ? workData.first_sentence.join(' ') : workData.first_sentence) ||
                null;
              // update the book object if description found
              if (description) {
                book.description = description;
              }
            }
          } catch (err) {
          }
        }
      })
    ).catch(() => {
    });
    
    return books;
  } catch (error) {
    console.error('Error fetching books from Open Library:', error);
    throw error;
  }
};

export const searchBooksFromOpenLibrary = async (query, limit = 20) => {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,isbn,cover_i,subject,key,edition_key,first_sentence`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.docs || !Array.isArray(data.docs)) {
      return [];
    }
    
    const books = data.docs
      .filter(book => book.title && (book.author_name?.length > 0 || book.isbn?.length > 0))
      .map(mapOpenLibraryBook);
    
    return books;
  } catch (error) {
    console.error('Error searching books from Open Library:', error);
    return [];
  }
};

