import React from 'react';
import { book } from '../data/book-details/book.js';
import BookHeader from '../components/book-details/BookHeader';
import BookCover from '../components/book-details/BookCover';
import BookDescription from '../components/book-details/BookDescription';
import BookRatingReview from '../components/book-details/BookRatingReview';
import BookAvailability from '../components/book-details/BookAvailability';
import RelatedBooks from '../components/book-details/RelatedBooks';
import './BookDetails.css';

export default function BookDetails() {
    return (
      <div className="book-details">
        <div className="heading">
          <BookHeader book={book} />
        </div>
  
        <div className="left-column">
          <BookCover book={book} />
          <BookAvailability book={book} />
        </div>
  
        <div className="right-column">
          <BookDescription book={book} />
          <BookRatingReview book={book} />
        </div>
  
        <div className="related-section">
          <RelatedBooks book={book} />
        </div>
      </div>
    );
  }

