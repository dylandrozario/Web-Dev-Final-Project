import React from 'react';

export default function StarRating({ rating }) {
  // rating = a number like 4.3 or 3.7
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Simple inline star characters
  const starStyle = { color: "gold", marginRight: "2px" };

  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {/* full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} style={starStyle}>
          ★
        </span>
      ))}

      {/* half star */}
      {hasHalfStar && (
        <span key="half" style={starStyle}>
          ☆
        </span>
      )}

      {/* empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} style={starStyle}>
          ☆
        </span>
      ))}
    </div>
  );
}

