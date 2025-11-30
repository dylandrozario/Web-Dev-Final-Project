import React from 'react';
import useRecommendations from '../../hooks/useRecommendations';
import BookCard from '../../components/advanced-search/BookCard/BookCard';
import { useNavigate } from 'react-router-dom';
import './RecommendationsPage.css';

export default function RecommendationsPage() {
  const recommendations = useRecommendations();
  const navigate = useNavigate();

  if (!recommendations || recommendations.length === 0) {
    return <p>No recommendations available at this time.</p>;
  }

  return (
<div className="recommendations-page">
  <div className="recommendations-header">
    <h2>My Recommendations</h2>
    <div className="recommendation-header-links">
      <button className="header-link" onClick={() => navigate('/my-library')}>
        MY LIBRARY
      </button>
    </div>
  </div>
      <div className="recommendations-grid">
        {recommendations.map(book => (
          <BookCard key={book.isbn} book={book} variant="grid" />
        ))}
      </div>
    </div>
  );
}
