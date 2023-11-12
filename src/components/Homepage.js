import React, { useState, useEffect } from "react";
import { app } from "../firebase";
import { getFirestore, collection, getDocs, getDoc } from "firebase/firestore";
import BookCard from "./BookCard";

import "./Homepage.css";

const Homepage = () => {
  const db = getFirestore(app);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const booksRef = collection(db, "books");
      const snapshot = await getDocs(booksRef);
      const fetchedBooks = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const bookData = doc.data();
          const authorRef = bookData.authorRef;
          const categoryRef = bookData.categoryRef;

          // Make sure authorRef is properly defined before using it
          if (authorRef) {
            const authorDoc = await getDoc(authorRef);
            const authorData = authorDoc.data();

            // Make sure categoryRef is properly defined before using it
            if (categoryRef) {
              const categoryDoc = await getDoc(categoryRef);
              const categoryData = categoryDoc.data();

              return {
                id: doc.id,
                ...bookData,
                author: authorData,
                category: categoryData,
              };
            } else {
              return {
                id: doc.id,
                ...bookData,
                author: authorData,
                category: { name: "null" },
              };
            }
          }

          return {
            id: doc.id,
            ...bookData,
            author: "null",
            category: { name: "null" },
          };
        })
      );
      setBooks(fetchedBooks);
      setFilteredBooks(fetchedBooks);
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    // Filter books based on searchQuery
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <p className="homepage-subtitle">Bon dia!</p>
        <h1 className="homepage-title">Pàgina d'inici</h1>
      </header>
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔎 Cerca per títol, autor, categoria o ISBN	"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="book-grid">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
