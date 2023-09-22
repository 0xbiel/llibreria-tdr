// src/components/Homepage.js
import React, { useState, useEffect } from "react";
import { app } from "../firebase";
import { getFirestore, collection, getDocs, getDoc } from "firebase/firestore";
import BookCard from "./BookCard";

import "./Homepage.css";

const Homepage = () => {
  const db = getFirestore(app);
  const [books, setBooks] = useState([]);
  const author = useState();

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
    };

    fetchBooks();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Welcome to the Library</h2>
      <div className="grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
