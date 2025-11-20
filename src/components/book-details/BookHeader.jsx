import React from 'react';

export default function BookHeader({book}) {
    return (
        <div>
            <h1>{book.title}</h1>
            <h2>{book.author}</h2>
        </div>
    );
}

