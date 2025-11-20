import React, { useState } from "react";

export default function ReviewForm({ onSubmit }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const [comment, setComment] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, comment });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Write a Review</h2>

            <label>Rating:</label>

            {/* ★ ADDED: STAR SELECTOR */}
            <div 
                style={{ display: "flex", gap: "6px", fontSize: "30px", cursor: "pointer" }}
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <span
                        key={n}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        style={{
                            color: (hover || rating) >= n ? "gold" : "#ccc",
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>

            <p style={{ margin: 0 }}>Your rating: {rating}/5</p>

            <label>Comment:</label>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                style={{ width: "100%" }}
            />

            <button type="submit">Submit Review</button>
        </form>
    );
}

