// src/components/BookCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
    function wait(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <Link to={`/books/${book.id}`} onClick={async () => {
                    await wait(100);
                    window.location.reload();
                }
            } className="text-lg font-semibold mb-2">{book.title}</Link>
            <h4 className='text-lg font-semibold mb-2'>{book.author.name}</h4>
            <img src={book.imageUrl} alt={book.title} className="max-w-full h-auto mb-2" />
        </div>
    );
};

export default BookCard;
