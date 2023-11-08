//EditBook.js
import React, { useState, useEffect } from "react";
import { app } from "../firebase";
import { getFirestore, doc } from "firebase/firestore";

const EditBook = ({
  book,
  onSave,
  onCancel,
  authors,
  categories,
  languages,
  publishers,
  subjects,
}) => {
  const [editedBook, setEditedBook] = useState({
    title: book.title,
    imageUrl: book.imageUrl,
    description: book.description,
    authorRef: book.authorRef,
    categoryRef: book.categoryRef,
    isbn: book.isbn || "",
    availableCopies: book.availableCopies,
    languageRef: book.languageRef,
    numberOfPages: book.numberOfPages || "",
    publisherRef: book.publisherRef,
    publicationYear: book.publicationYear || "",
    subjectRef: book.subjectRef,
  });
  const db = getFirestore(app);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBook({ ...editedBook, [name]: value });
  };

  const handleAuthorsChange = (e) => {
    const selectedAuthors = Array.from(e.target.selectedOptions, (option) =>
      doc(db, "authors", option.value)
    );
    // Assuming you want to store only one author for a book, you can take the first one
    setEditedBook({
      ...editedBook,
      authorRef: selectedAuthors[0], // Store a single Firestore document reference
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategories = Array.from(e.target.selectedOptions, (option) =>
      doc(db, "categories", option.value)
    );
    // Assuming you want to store only one category for a book, you can take the first one
    setEditedBook({
      ...editedBook,
      categoryRef: selectedCategories[0], // Store a single Firestore document reference
    });
  };

  const handleLanguageChange = (e) => {
    const selectedLanguages = Array.from(e.target.selectedOptions, (option) =>
      doc(db, "languages", option.value)
    );
    // Assuming you want to store only one language for a book, you can take the first one
    setEditedBook({
      ...editedBook,
      languageRef: selectedLanguages[0],
    });
  };

  const handlePublisherChange = (e) => {
    const selectedPublisherId = e.target.value;
    const selectedPublisherRef = doc(db, "publishers", selectedPublisherId);

    setEditedBook({
      ...editedBook,
      publisherRef: selectedPublisherRef,
    });
  };

  const handleSubjectChange = (e) => {
    const selectedSubjectId = e.target.value;
    const selectedSubjectRef = doc(db, "subjects", selectedSubjectId);

    setEditedBook({
      ...editedBook,
      subjectRef: selectedSubjectRef,
    });
  };

  const handleSubmit = (e) => {
    console.log("handleSubmit");
    e.preventDefault(); // Prevent form submission
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
          Titol:
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
          Imatge URL:
          <input
            type="text"
            name="imageUrl"
            value={editedBook.imageUrl}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Descripció:
          <textarea
            name="description"
            value={editedBook.description}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Autors:
          <select name="authors" multiple onChange={handleAuthorsChange}>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Editorial:
          <select name="publisher" multiple onChange={handlePublisherChange}>
            {publishers.map((publisher) => (
              <option key={publisher.id} value={publisher.id}>
                {publisher.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Categoria:
          <select name="categories" multiple onChange={handleCategoryChange}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Llenguatge:
          <select name="languages" multiple onChange={handleLanguageChange}>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Assignatura:
          <select name="subject" multiple onChange={handleSubjectChange}>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Copies totals:
          <input
            type="number"
            name="availableCopies"
            value={editedBook.availableCopies}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Número de pàgines:
          <input
            type="number"
            name="numberOfPages"
            value={editedBook.numberOfPages}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Número de pàgines:
          <input
            type="number"
            name="publicationYear"
            value={editedBook.publicationYear}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>
          Cancel·lar
        </button>
      </form>
    </div>
  );
};

export default EditBook;
