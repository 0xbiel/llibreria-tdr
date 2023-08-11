// src/components/BookDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { app } from '../firebase';
import {doc, getDoc, getFirestore} from "firebase/firestore"; // Import your Firebase configuration

function BookDetails() {
    const db = getFirestore(app);
    const { id } = useParams();
    const [book, setBook] = useState(null);

    useEffect(() => {

        const fetchBook = async () => {
            try {
                const booksRef = doc(db, 'books', id);
                const bookDoc = await getDoc(booksRef);
                if (bookDoc.exists) {
                    setBook(bookDoc.data());
                } else {
                    console.log('Book not found');
                }
            } catch (error) {
                console.error('Error fetching book:', error);
            }
        };

        fetchBook();
    }, [id]);

    if (!book) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container py-5">
            <img src={book.imageUrl} alt={book.title} className="max-w-full h-auto mb-2" />
            <h2 className="text-3xl font-semibold mb-4">{book.title}</h2>
            <p>Author: {book.author}</p>
            <p>Genre: {book.genre}</p>
            <p>Description: {book.description}</p>
        </div>
    );
}

export default BookDetails;
