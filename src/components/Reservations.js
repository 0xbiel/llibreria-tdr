// src/components/Reservation.js
import React, { useEffect, useState } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import {app, auth } from '../firebase';
import {onAuthStateChanged} from "firebase/auth/dist/index.mjs";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";


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
            const fetchedReservs = snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data()})
            );
            setReservations(fetchedReservs);
        };

        return () => {
            unsubscribe();
        };
    }, []);



    return (
        <div className="max-w-3xl mx-auto p-8">
            <h2 className="text-3xl font-semibold mb-6">Your Reservations</h2>
            <ul className="space-y-4">
                {reservations.map((reservation) => (
                    <li key={reservation.id} className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-lg">Book: {reservation.bookName}</p>
                        <p className="text-lg">Date: {reservation.date}</p>
                        <p className="text-gray-600">Status: {reservation.status}</p>
                        {reservation.status === 'active' && (
                            <button
                                // Implement the cancellation logic here
                                className="mt-2 text-red-600 hover:text-red-800 focus:outline-none"
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
