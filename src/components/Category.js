import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { app } from "../firebase";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
} from "firebase/firestore";
import BookCard from "./BookCard";

import "./Category.css";

const Category = () => {
  const { categoryId } = useParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchBooks = async () => {
      const categoryQuery = query(
        collection(db, "books"),
        where("categoryRef", "==", doc(db, "categories", categoryId)),
      );
      const snapshot = await getDocs(categoryQuery);
      const fetchedBooks = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const bookData = doc.data();
          const authorRef = bookData.authorRef;
          const categoryRef = bookData.categoryRef;

          if (authorRef) {
            const authorDoc = await getDoc(authorRef);
            const authorData = authorDoc.data();

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
        }),
      );
      setBooks(fetchedBooks);
    };

    fetchBooks();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const currentCategory = await getDoc(doc(db, "categories", categoryId));
    const currentCategoryData = currentCategory.data();
    console.log(currentCategoryData);

    setCategories(currentCategoryData);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">{categories.name}</h2>
      <div className="book-grid">
        {" "}
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Category;
