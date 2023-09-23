import React, { useEffect, useState } from "react";
import { app, auth } from "../firebase";
import { onAuthStateChanged, reload } from "firebase/auth";
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

import QRCode from "react-qr-code";

import { Link } from "react-router-dom";

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

        const bookDoc = await getDoc(reservationData.bookId);
        const bookData = bookDoc.data();
        console.log(bookData);
        console.log(bookDoc.id);

        return {
          id: doc1.id,
          ...reservationData,
          book: bookData ?? { title: "Book doesn't exist" },
          bookId: { id: bookDoc.id } ?? { title: "Book doesn't exist" },
        };
      })
    );

    fetchedReservs.sort((a, b) => {
      const dateA = new Date(a.startDate.split("/").reverse().join("/"));
      const dateB = new Date(b.startDate.split("/").reverse().join("/"));
      return dateB - dateA;
    });

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
    const confirmation = window.confirm(
      "Are you sure you want to delete this book?"
    );
    if (!confirmation) return;
    try {
      const reservationRef = doc(db, "reservations", reservationId);
      await updateDoc(reservationRef, { status: "cancelled" });
      fetchReservs();
    } catch (e) {
      console.error("Error cancelling reservation:", e);
    }
    await wait(50);
    window.location.reload();
  };

  const isDelayed = (endDate) => {
    const maxReturnDate = new Date(endDate.split("/").reverse().join("/"));
    const currentDate = new Date();

    console.log(currentDate, maxReturnDate);

    return currentDate > maxReturnDate;
  };

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  return (
    <div className="reservation-container">
      <h2 className="reservation-title">Your Reservations</h2>
      <ul className="reservation-list">
        {reservations.map((reservation) => (
          <li
            key={reservation.id}
            className={`reservation-item ${
              reservation.status === "delivered" &&
              isDelayed(reservation.endDate)
                ? "delayed-reservation"
                : reservation.status === "delivered"
                ? "delivered-reservation"
                : ""
            }`}
          >
            <Link
              to={`/books/${reservation.bookId.id}`}
              onClick={async () => {
                await wait(100);
                window.location.reload();
              }}
              className="book-title"
            >
              Book: {reservation.book.title}
            </Link>
            <p className="book-date">Date: {reservation.startDate}</p>
            <p className="max-return-date">
              Max return date: {reservation.endDate}
            </p>
            <p className="book-status">
              Status:{" "}
              {reservation.status === "delivered" &&
              isDelayed(reservation.endDate)
                ? "Delayed"
                : reservation.status === "delivered"
                ? "Delivered"
                : reservation.status}
            </p>
            <table className="table">
              <thead></thead>
              <tbody>
                <tr className="table">
                  <td className="table">
                    <QRCode
                      size={125}
                      fgColor="black"
                      bgColor="#eeeeee"
                      className="qr-code"
                      value={reservation.id}
                    />
                  </td>
                  <td className="table">
                    <div className="flex justify-center">
                      <img
                        className="image"
                        src={reservation.book.imageUrl}
                        alt={reservation.book.imageUrl}
                      />
                    </div>
                  </td>
                  <td className="table">
                    {reservation.status === "active" && (
                      <button
                        onClick={() =>
                          handleCancelReservation(
                            reservation.id,
                            reservation.bookId
                          )
                        }
                        className="cancel-button"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reservation;
