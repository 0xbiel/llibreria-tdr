import React, { useEffect, useState } from "react";
import { app, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import "./Reservations.css";

const Reservation = () => {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const db = getFirestore(app);

  const fetchReservs = async () => {
    const q = query(
      collection(db, "reservations"),
      where("userId", "==", auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);

    const fetchedReservs = await Promise.all(
      snapshot.docs.map(async (doc1) => {
        const reservationData = doc1.data();
        console.log(doc1.id);

        // Fetch the referenced book's data
        const bookDoc = await getDoc(reservationData.bookId);
        const bookData = bookDoc.data();

        return { id: doc1.id, ...reservationData, book: bookData };
      })
    );

    setReservations(fetchedReservs);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          console.log(user);
          fetchReservs();
        } catch (e) {}
      } else {
        setUser(null);
      }
      try {
        console.log(user.uid);
      } catch (e) {}
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCancelReservation = async (reservationId, bookRef) => {
    console.log(reservationId);
    try {
      const reservationRef = doc(db, "reservations", reservationId);
      await updateDoc(reservationRef, { status: "cancelled" });

      const bookDocRef = getDoc(bookRef);
      const availableCopies = bookDocRef.availableCopies;

      await updateDoc(bookDocRef, {
        availableCopies: availableCopies + 1,
      });

      fetchReservs();
    } catch (e) {
      console.error("Error cancelling reservation:", e);
    }
  };

  // Function to check if a reservation is delayed
  const isDelayed = (endDate) => {
    const maxReturnDate = new Date(endDate); // Convert max return date to a Date object
    const currentDate = new Date(); // Get the current date

    // Compare max return date with the current date
    return currentDate > maxReturnDate;
  };

  return (
    <div className="reservation-container">
      <h2 className="reservation-title">Your Reservations</h2>
      <ul className="reservation-list">
        {reservations.map((reservation) => (
          <li
            key={reservation.id}
            className={`reservation-item ${
              reservation.status === "active" && isDelayed(reservation.endDate)
                ? "delayed-reservation" // Apply the delayed CSS class if the reservation is active and delayed
                : ""
            }`}
          >
            <p className="book-title">Book: {reservation.book.title}</p>
            <p className="book-date">Date: {reservation.startDate}</p>
            <p className="max-return-date">
              Max return date: {reservation.endDate}
            </p>
            <p className="book-status">
              Status:{" "}
              {reservation.status === "active" && isDelayed(reservation.endDate)
                ? "Delayed" // Set the status to "Delayed" if the reservation is active and delayed
                : reservation.status}
            </p>
            <p className="reservation-id">ID: {reservation.id}</p>
            {reservation.status === "active" &&
              !isDelayed(reservation.endDate) && (
                <button
                  onClick={() =>
                    handleCancelReservation(reservation.id, reservation.bookId)
                  }
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
