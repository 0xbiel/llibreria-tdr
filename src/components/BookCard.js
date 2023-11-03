// src/components/BookCard.js
import React from "react";
import { Link } from "react-router-dom";
import "./BookCard.css";

const BookCard = ({ book }) => {
  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  return (
    <div className="book-card">
      <Link
        to={`/books/${book.id}`}
        onClick={async () => {
          await wait(100);
          window.location.reload();
        }}
        className="image-div"
      >
        <img src={book.imageUrl} alt={book.title} className="book-image" />
      </Link>
      <Link
        to={`/books/${book.id}`}
        onClick={async () => {
          await wait(100);
          window.location.reload();
        }}
        className="book-title-link"
      >
        {book.title}
      </Link>
      <h4 className="author-name">{book.author.name}</h4>
      <h4 className="category-name">{book.category.name}</h4>
    </div>
  );
};

export default BookCard;
