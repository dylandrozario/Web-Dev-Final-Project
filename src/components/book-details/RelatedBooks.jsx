import React from 'react';
import './RelatedBooks.css';

export default function RelatedBooks({ book }) {
  return (
    <div className="related-section">
      <h4 className="related-books-heading">Enjoyed {book.title}? Try these!</h4>
      <div className="related-books-grid">
        {book.relatedBooks.map((item, index) => (
          <div className="related-book-card" key={index}>
            <img src={item.image} alt={item.title} />
            <a href="#">{item.title}</a>
          </div>
        ))}
      </div>
    </div>
  );
}

