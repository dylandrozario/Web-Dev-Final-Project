import React from 'react';

export default function BookCover({book}) {
    return (
        <div>
            <img src={book.cover} alt={book.cover} />
        </div>
    );
}

