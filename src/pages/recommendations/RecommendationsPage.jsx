import React from 'react';
import useRecommendations from '../../hooks/useRecommendations';
import BookCard from '../../components/advanced-search/BookCard/BookCard';
import './RecommendationsPage.css';

export default function RecommendationsPage() {
  const recommendations = useRecommendations();

  if (!recommendations || recommendations.length === 0) {
    return <p>No recommendations available at this time.</p>;
  }

  return (
    <div className="recommendations-page">
      <h2>Your Recommendations</h2>
      <div className="recommendations-grid">
        {recommendations.map(book => (
          <BookCard key={book.isbn} book={book} variant="grid" />
        ))}
      </div>
    </div>
  );
}
