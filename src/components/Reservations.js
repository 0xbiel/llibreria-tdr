// src/components/Reservation.js
import React, { useEffect, useState } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import {app, auth } from '../firebase';
import {onAuthStateChanged} from "firebase/auth/dist/index.mjs";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

import './Reservations.css';

const Reservation = () => {
    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const db = getFirestore(app);
    const history = useHistory();
    const [book, setBook] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                try{
                    console.log(user.uid);
                    fetchReservs();
                } catch (e) {

                };
            } else {
                setUser(null);
            }
            try{
                console.log(user.uid);
            } catch (e) {

            };
        });

        const fetchReservs = async () => {
            const q = query(collection(db, 'reservations'), where('userId', '==', auth.currentUser.uid));
            const snapshot = await getDocs(q);

            const fetchedReservs = await Promise.all(snapshot.docs.map(async (doc) => {
                const reservationData = doc.data();

                // Fetch the referenced book's data
                const bookRef = reservationData.bookId; // Adjust the field name as per your database structure
                const bookDoc = await getDoc(bookRef);
                const bookData = bookDoc.data();
                console.log(bookData);

                return { id: doc.id, ...reservationData, book: bookData };
            }));

            setReservations(fetchedReservs);
        };

        return () => {
            unsubscribe();
        };
    }, []);



    return (
        <div className="reservation-container">
            <h2 className="reservation-title">Your Reservations</h2>
            <ul className="reservation-list">
                {reservations.map((reservation) => (
                    <li key={reservation.id} className="reservation-item">
                        <p className="book-title">Book: {reservation.book.title}</p>
                        <p className="book-date">Date: {reservation.date}</p>
                        <p className="book-status">Status: {reservation.status}</p>
                        {reservation.status === 'active' && (
                            <button
                                // Implement the cancellation logic here
                                className="cancel-button"
                            >
                                Cancel Reservation
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};


export default Reservation;
