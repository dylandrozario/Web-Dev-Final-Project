import { useMemo, useState, useEffect } from 'react';
import useRecommendations from '../../hooks/useRecommendations';
import BookCard from '../../components/advanced-search/BookCard/BookCard';
import { useNavigate } from 'react-router-dom';
import './RecommendationsPage.css';

const ITEMS_PER_PAGE = 10;

const sortRecommendations = (recommendations) => {
  if (!recommendations?.length) return [];
  return [...recommendations].sort((a, b) => {
    const scoreDiff = (b.score || 0) - (a.score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    const genreA = (a.genre || 'Other').toLowerCase();
    const genreB = (b.genre || 'Other').toLowerCase();
    return genreA.localeCompare(genreB);
  });
};

export default function RecommendationsPage() {
  const recommendations = useRecommendations();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const sortedRecommendations = useMemo(() => sortRecommendations(recommendations), [recommendations]);
  const totalPages = Math.ceil(sortedRecommendations.length / ITEMS_PER_PAGE);
  
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedRecommendations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedRecommendations, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  if (!recommendations?.length) {
    return (
      <div className="page-shell gradient-bg-vertical">
        <div className="page-container-wide">
          <div className="recommendations-empty">
            <p>No recommendations available at this time.</p>
            <p className="recommendations-empty-subtitle">
              Start saving, favoriting, or rating books to get personalized recommendations!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showPagination = sortedRecommendations.length > ITEMS_PER_PAGE;

  return (
    <div className="page-shell gradient-bg-vertical">
      <div className="page-container-wide">
<div className="recommendations-page">
  <div className="recommendations-header">
            <h2 className="page-title">My Recommendations</h2>
    <div className="recommendation-header-links">
              <span className="recommendations-count">
                {sortedRecommendations.length} {sortedRecommendations.length === 1 ? 'book' : 'books'}
              </span>
      <button className="header-link" onClick={() => navigate('/my-library')}>
        MY LIBRARY
      </button>
    </div>
  </div>

      <div className="recommendations-grid">
            {paginatedBooks.map(book => (
              <div key={book.isbn} className="recommendation-item">
                <BookCard book={book} variant="grid" />
                {book.recommendationReasons && book.recommendationReasons.length > 0 && (
                  <div className="recommendation-reasons">
                    <div className="recommendation-badge">
                      <span className="badge-icon">✨</span>
                      <span className="badge-text">Recommended because:</span>
                    </div>
                    <ul className="reasons-list">
                      {book.recommendationReasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="reason-item">
                          {reason.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showPagination && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
