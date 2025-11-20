import React from 'react';
import './BookDescription.css';

export default function BookDescription({ book }) {
  return (
    <div className="book-description">
      <p>{book.description}</p>
      <ul className="tag-list">
        {book.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  );
}

