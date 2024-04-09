// src/components/BookDetails.js
/* The line `import React, { useEffect, useState } from "react";` is importing the `React` library and
two hooks, `useEffect` and `useState`, from the `react` package. These hooks are used to manage
state and side effects in functional components in React. */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css";
import { app, auth, analytics } from "../firebase";
import {
  doc,
  getDoc,
  getFirestore,
  addDoc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import "./BookDetails.css";
import { onAuthStateChanged } from "firebase/auth";
import { logEvent } from "firebase/analytics";

function BookDetails() {
  const db = getFirestore(app);
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null); // eslint-disable-line no-unused-vars
  const [bookRef, setBookRef] = useState(null);

  const logBookView = (bookTitle) => {
    console.log("Logging book view " + id + " " + bookTitle);
    logEvent(analytics, "view_book_detail", {
      item_id: id,
      item_name: bookTitle,
    });
  };

  const youShouldLogin = () => {
    alert("Has d'iniciar sessió per a poder fer una reserva.");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        fetchBook();
      } catch (e) {}
      if (user) {
        setUser(user);
        try {
          console.log(user.uid);
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
          const languageRef = bookData.languageRef;
          const publisherRef = bookData.publisherRef;
          const subjectRef = bookData.subjectRef;

          if (authorRef) {
            const authorDoc = await getDoc(authorRef);
            const authorData = authorDoc.data();
            // Add author information to the bookData object

            if (categoryRef) {
              const categoryDoc = await getDoc(categoryRef);
              const categoryData = categoryDoc.data();

              if (languageRef) {
                const languageDoc = await getDoc(languageRef);
                const languageData = languageDoc.data();

                if (publisherRef) {
                  const publisherDoc = await getDoc(publisherRef);
                  const publisherData = publisherDoc.data();

                  if (subjectRef) {
                    const subjectDoc = await getDoc(subjectRef);
                    const subjectData = subjectDoc.data();

                    setBook({
                      ...bookData,
                      author: authorData,
                      category: categoryData,
                      language: languageData,
                      publisher: publisherData,
                      subject: subjectData,
                    });

                    logBookView(bookData.title.toString());
                  } else {
                    setBook({
                      ...bookData,
                      author: authorData,
                      category: categoryData,
                      language: languageData,
                      publisher: publisherData,
                      subject: { name: "No disponible" },
                    });
                    logBookView(bookData.title.toString());
                  }
                } else {
                  setBook({
                    ...bookData,
                    author: authorData,
                    category: categoryData,
                    language: languageData,
                    publisher: { name: "No disponible" },
                    subject: { name: "No disponible" },
                  });
                  logBookView(bookData.title.toString());
                }
                setBookRef(bookDoc.id);
              } else {
                setBook({
                  ...bookData,
                  author: authorData,
                  category: categoryData,
                  language: { name: "No disponible" },
                  publisher: { name: "No disponible" },
                  subject: { name: "No disponible" },
                });
                logBookView(bookData.title.toString());
              }

              setBookRef(bookDoc.id);
            } else {
              setBook({
                ...bookData,
                author: authorData,
                category: { name: "No disponible" },
                language: { name: "No disponible" },
                publisher: { name: "No disponible" },
                subject: { name: "No disponible" },
              });
              setBookRef(bookDoc.id);
              logBookView(bookData.title.toString());
            }
          } else {
            setBook({
              ...bookData,
              author: null,
              category: null,
              language: null,
              publisher: null,
              subject: null,
            });
            setBookRef(bookDoc.id);
            logBookView(bookData.title.toString());
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
    // Query the book document to get the available copies count
    const bookDocRef = doc(db, "books", bookRef);
    const bookDoc = await getDoc(bookDocRef);

    const selectedStartDate_Date = new Date(selectedStartDate);
    const today = new Date();

    if (selectedStartDate_Date < today) {
      alert("Selecciona una data vàlida.");
      return;
    }

    if (!selectedStartDate) {
      alert("Selecciona una data.");
      return;
    }

    // Check if the user has an active reservation
    const activeReservationsQuery = query(
      collection(db, "reservations"),
      where("userId", "==", auth.currentUser.uid),
      where("status", "in", ["active", "delivered"])
    );

    const activeBooksQuery = query(
      collection(db, "reservations"),
      where("bookId", "==", doc(db, "books", bookRef)),
      where("status", "in", ["active", "delivered"])
    );

    const activeBooksSnapshot = await getDocs(activeBooksQuery);

    const bookSize = activeBooksSnapshot.size;

    const activeReservationsSnapshot = await getDocs(activeReservationsQuery);

    if (!activeReservationsSnapshot.empty) {
      alert("Ja tens una reserva activa.");
      return;
    }

    const endDate = new Date(selectedStartDate);
    endDate.setDate(selectedStartDate.getDate() + 14); // Two weeks later

    if (!bookDoc.exists()) {
      console.log("Book not found.");
      return;
    }

    const bookData = bookDoc.data();
    const availableCopies = bookData.availableCopies;

    if (bookSize >= availableCopies) {
      for (const doc of activeBooksSnapshot.docs) {
        const reservationData = doc.data();
        const endDate = new Date(
          reservationData.endDate.split("/").reverse().join("/")
        );
        if (selectedStartDate_Date < endDate) {
          alert("No hi ha cap llibre disponible per aquest periode.");
          return;
        }
      }
    }

    // Create the reservation and update the available copies count
    try {
      const reservationData = {
        userId: auth.currentUser.uid,
        bookId: doc(db, "books", bookRef), // Assuming bookRef is defined
        startDate: selectedStartDate.toLocaleDateString("en-GB"),
        endDate: endDate.toLocaleDateString("en-GB"),
        status: "active",
        email: auth.currentUser.email,
      };

      await addDoc(collection(db, "reservations"), reservationData);

      alert("Reserva creada amb èxit!");
    } catch (error) {
      console.error("Error creant la reserva:", error);
    }
  };

  if (!book) {
    return (
      <div
        className="container py-5"
        style={{
          borderRadius: "30px",
          marginBottom: "100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        Carregant...
        <img
          src="https://i.gifer.com/ZKZg.gif"
          width={"30px"}
          style={{
            border: "0",
            backgroundColor: "#ffffff00",
            marginBottom: "0",
            boxShadow: "",
          }}
        ></img>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{ borderRadius: "30px", marginBottom: "100px" }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <img
          src={book.imageUrl}
          alt={book.title}
          className="max-w-full h-auto mb-2"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <h2 className="text-3xl font-semibold mb-4">{book.title}</h2>
          <DatePicker
            selected={selectedStartDate}
            onChange={(date) => setSelectedStartDate(date)}
            placeholderText="Selecciona una data"
          />
          {user ? (
            <button onClick={handleReservation} className="reservation-button">
              Fer Reserva
            </button>
          ) : (
            <button onClick={youShouldLogin} className="reservation-button">
              Fer Reserva
            </button>
          )}
        </div>
      </div>
      <hr class="rounded"></hr>
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            rowGap: "5px",
          }}
        >
          <p>
            <b>Autor:</b> {book.author.name}
          </p>
          <p>
            <b>Gènere:</b> {book.category.name}
          </p>
          <p>
            <b>Editorial:</b> {book.publisher.name}
          </p>
          <p>
            <b>ISBN:</b> {book.isbn}
          </p>
          <p>
            <b>Assignatura:</b> {book.subject.name}
          </p>
          <p>
            <b>Any de publicació:</b> {book.publicationYear}
          </p>
          <p>
            <b>Número de pàgines:</b> {book.numberOfPages}
          </p>
          <p>
            <b>Idioma:</b> {book.language.name}
          </p>
        </div>
        <hr class="rounded"></hr>
        <div>
          <p className="description" style={{ fontWeight: "bold" }}>
            Descripció:
          </p>
          <p>{book.description}</p>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
