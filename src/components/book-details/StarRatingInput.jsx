import React, { useState } from "react";

export default function StarRatingInput({ onRate }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div style={{ display: "flex", gap: "10px", fontSize: "32px" }}>
            {[1,2,3,4,5].map(n => (
                <span
                    key={n}
                    onClick={() => { setRating(n); onRate(n); }}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{
                        cursor: "pointer",
        color: (hover || rating) >= n ? "gold" : "#ccc"
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

