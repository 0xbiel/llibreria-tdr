// src/components/BookDetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css";
import { app, auth } from "../firebase";
import {
  doc,
  getDoc,
  getFirestore,
  addDoc,
  collection,
  query,
  getDocs,
  where,
  updateDoc,
} from "firebase/firestore"; // Import your Firebase configuration

import "./BookDetails.css";
import { onAuthStateChanged } from "firebase/auth";

function BookDetails() {
  const db = getFirestore(app);
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null);
  const [bookRef, setBookRef] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          console.log(user.uid);
          fetchBook();
        } catch (e) {}
      } else {
        setUser(null);
      }
    });
    const fetchBook = async () => {
      try {
        const booksRef = doc(db, "books", id);
        const bookDoc = await getDoc(booksRef);
        if (bookDoc.exists) {
          const bookData = bookDoc.data();
          const authorRef = bookData.authorRef;
          const categoryRef = bookData.categoryRef;

          if (authorRef) {
            const authorDoc = await getDoc(authorRef);
            const authorData = authorDoc.data();
            // Add author information to the bookData object

            if (categoryRef) {
              const categoryDoc = await getDoc(categoryRef);
              const categoryData = categoryDoc.data();

              setBook({
                ...bookData,
                author: authorData,
                category: categoryData,
              });
              setBookRef(bookDoc.id);
            } else {
              setBook({ ...bookData, author: authorData });
              setBookRef(bookDoc.id);
            }
          } else {
            setBook({ ...bookData, author: null, category: null });
            setBookRef(bookDoc.id);
          }
        } else {
          console.log("Book not found");
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };

    return () => {
      unsubscribe();
    };
  }, [id]);

  // State to store the selected start date for the reservation
  const [selectedStartDate, setSelectedStartDate] = useState(null);

  // Function to handle reservation creation
  const handleReservation = async () => {
    const selectedStartDate_Date = new Date(selectedStartDate);
    const today = new Date();

    if (selectedStartDate_Date < today) {
      alert("Please select a start date in the future.");
      return;
    }

    if (!selectedStartDate) {
      alert("Please select a start date for the reservation.");
      return;
    }

    // Check if the user has an active reservation
    const activeReservationsQuery = query(
      collection(db, "reservations"),
      where("userId", "==", auth.currentUser.uid),
      where("status", "==", "active")
    );

    const activeBooksQuery = query(
      collection(db, "reservations"),
      where("bookId", "==", bookRef),
      where("status", "==", "active")
    );

    const activeBooksSnapshot = await getDocs(activeBooksQuery);

    const bookSize = activeBooksSnapshot.size;

    const activeReservationsSnapshot = await getDocs(activeReservationsQuery);

    console.log(activeReservationsSnapshot);

    if (!activeReservationsSnapshot.empty) {
      alert("You already have an active reservation.");
      return;
    }

    const endDate = new Date(selectedStartDate);
    endDate.setDate(selectedStartDate.getDate() + 14); // Two weeks later

    // Query the book document to get the available copies count
    const bookDocRef = doc(db, "books", bookRef);
    const bookDoc = await getDoc(bookDocRef);

    if (!bookDoc.exists()) {
      console.log("Book not found.");
      return;
    }

    const bookData = bookDoc.data();
    const availableCopies = bookData.availableCopies;

    if (bookSize >= availableCopies) {
      alert("No available copies for the selected period.");
      return;
    }

    // Create the reservation and update the available copies count
    try {
      const reservationData = {
        userId: auth.currentUser.uid,
        bookId: doc(db, "books", bookRef), // Assuming bookRef is defined
        startDate: selectedStartDate.toLocaleDateString("en-GB"),
        endDate: endDate.toLocaleDateString("en-GB"),
        status: "active",
      };

      await addDoc(collection(db, "reservations"), reservationData);

      alert("Reservation created successfully");
    } catch (error) {
      console.error("Error creating reservation:", error);
    }
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-5">
      <img
        src={book.imageUrl}
        alt={book.title}
        className="max-w-full h-auto mb-2"
      />
      <h2 className="text-3xl font-semibold mb-4">{book.title}</h2>
      <DatePicker
        selected={selectedStartDate}
        onChange={(date) => setSelectedStartDate(date)}
      />
      <button onClick={handleReservation} className="reservation-button">
        Make Reservation
      </button>
      <p>Author: {book.author.name}</p>
      <p>Genre: {book.category.name}</p>
      <p>Description: {book.description}</p>
    </div>
  );
}

export default BookDetails;
