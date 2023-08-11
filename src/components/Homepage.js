// src/components/Homepage.js
import React, { useState, useEffect } from 'react';
import { app } from '../firebase';
import { getFirestore, collection, getDocs, getDoc } from "firebase/firestore";
import BookCard from './BookCard';

const Homepage = () => {
    const db = getFirestore(app);
    const [books, setBooks] = useState([]);
    const author = useState();

    useEffect(() => {
        const fetchBooks = async () => {
            const booksRef = collection(db, 'books');
            const snapshot = await getDocs(booksRef);
            const fetchedBooks = await Promise.all(snapshot.docs.map(async (doc) => {
                const bookData = doc.data();
                const authorRef = bookData.authorRef;

                // Make sure authorRef is properly defined before using it
                if (authorRef) {
                    const authorDoc = await getDoc(authorRef);
                    const authorData = authorDoc.data();

                    return { id: doc.id, ...bookData, author: authorData };
                }

                return { id: doc.id, ...bookData, author: null };
            }));
            setBooks(fetchedBooks);
        };

        fetchBooks();


    }, []);


    return (
        <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-2xl font-semibold mb-4">Welcome to the Library</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>
        </div>
    );
};

export default Homepage;
