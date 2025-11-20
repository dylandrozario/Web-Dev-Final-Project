import React, { useState } from "react"; 
import Modal from "./Modal.jsx";  
import ReviewForm from "./ReviewForm.jsx";
import StarRatingInput from "./StarRatingInput.jsx";
import StarRating from './StarRating.jsx';
import './BookRatingReview.css';

export default function BookRatingReview({book}) {
    const [openReview, setOpenReview] = useState(false);
    const [openRate, setOpenRate] = useState(false);

    const positive = PositiveReview(book.reviews);
    const negative = NegativeReview(book.reviews);

    const handleSaveClick = () => {
        alert("Added to Your Saved!");
    };

    const handleSubmitReview = (review) => {
        alert("Review submitted!", review);
        setOpenReview(false);
    };

    return (
        <div className="book-rating-review">

            {/* Average Rating */}
            <div className="row">
                <StarRating rating={averageRating(book.ratings)} />
                <span>Average over {book.ratings.length} ratings</span>
            </div>

            {/* RATE / REVIEW / SAVE buttons */}
            <div className="button-row">
                <button onClick={() => setOpenRate(true)}>RATE</button>
                <Modal open={openRate} onClose={() => setOpenRate(false)}>
                    <h2>Rate this book</h2>
                    <StarRatingInput 
                        onRate={(n) => {
                            alert(`You rated this book ${n} stars!`);
                            setOpenRate(false);
                        }} 
                    />
                </Modal>

                <button onClick={() => setOpenReview(true)}>REVIEW</button>
                <Modal open={openReview} onClose={() => setOpenReview(false)}>
                    <ReviewForm onSubmit={handleSubmitReview} />  
                </Modal>

                <button onClick={handleSaveClick}>SAVE</button>
            </div>

            {/* Positive & Negative Reviews Mini Columns */}
            <div className="reviews-mini">
                {positive && (
                    <div className="review-col">
                        <div className="review-header">Top Positive Review</div>
                        <div className="row">
                            <StarRating rating={positive.rating} />
                            <span>{positive.author}</span>
                        </div>
                        <p className="comment">{positive.comment}</p>
                    </div>
                )}

                {negative && (
                    <div className="review-col">
                        <div className="review-header">Top Negative Review</div>
                        <div className="row">
                            <StarRating rating={negative.rating} />
                            <span>{negative.author}</span>
                        </div>
                        <p className="comment">{negative.comment}</p>
                    </div>
                )}
            </div>

            <div className="see-all">
                <a href="#">See all {book.reviews.length} reviews</a>
            </div>

        </div>
    );
}

// ---------- Helper functions ----------
function averageRating(ratings) {
    return ratings.reduce((sum, n) => sum + n, 0) / ratings.length;
}

export function sortReviews(reviews) {
    return [...reviews].sort((a, b) => b.upvotes - a.upvotes);
}

export function PositiveReview(reviews) {
    return sortReviews(reviews).find(r => r.rating > 3) || null;
}

export function NegativeReview(reviews) {
    return sortReviews(reviews).find(r => r.rating < 3) || null;
}

