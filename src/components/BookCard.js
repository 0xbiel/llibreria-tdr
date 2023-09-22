// src/components/BookCard.js
import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <Link
        to={`/books/${book.id}`}
        onClick={async () => {
          await wait(100);
          window.location.reload();
        }}
        className="text-lg font-semibold mb-2 text-black hover:text-gray-700"
      >
        {book.title}
      </Link>
      <h4 className="text-lg font-semibold mb-2 text-black">
        {book.author.name}
      </h4>
      <h4 className="text-lg-font-semibold mb-2 text-black hover:gray-700">
        {book.category.name}
      </h4>
      <div className="flex justify-center">
        <img
          src={book.imageUrl}
          alt={book.title}
          className="max-w-full h-auto mb-2"
        />
      </div>
    </div>
  );
};

export default BookCard;
