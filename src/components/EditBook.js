// EditBook.js
import React, { useState, useEffect } from "react";
import { app } from "../firebase";
import { getFirestore, doc } from "firebase/firestore";

const EditBook = ({ book, onSave, onCancel, authors, categories }) => {
  const [editedBook, setEditedBook] = useState({
    title: book.title,
    imageUrl: book.imageUrl,
    description: book.description,
    authorRef: book.authorRef,
    categoryRef: book.categoryRef,
    isbn: book.isbn,
  });
  const db = getFirestore(app);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBook({ ...editedBook, [name]: value });
  };

  const handleAuthorsChange = (e) => {
    const selectedAuthors = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setEditedBook({
      ...editedBook,
      authorRef: doc(db, "authors", selectedAuthors[0]),
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setEditedBook({
      ...editedBook,
      categoryRef: doc(db, "categories", selectedCategory[0]),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedBook);
  };

  useEffect(() => {
    setEditedBook(book);
  }, [book]);

  return (
    <div>
      <h2>Edit Book</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={editedBook.title}
            onChange={handleInputChange}
          />
        </label>
        <label>
          ISBN:
          <input
            type="text"
            name="isbn"
            value={editedBook.isbn}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Image URL:
          <input
            type="text"
            name="imageUrl"
            value={editedBook.imageUrl}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={editedBook.description}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Authors:
          <select name="authors" multiple onChange={handleAuthorsChange}>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category:
          <select name="categories" multiple onChange={handleCategoryChange}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Available Copies:
          <input
            type="number"
            name="availableCopies"
            value={editedBook.availableCopies}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditBook;
