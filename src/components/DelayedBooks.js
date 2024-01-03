import React, { useState, useEffect } from "react";
import { app, auth } from "../firebase";
import { useHistory } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

const DelayedBooks = () => {
  const [user, setUser] = useState(null);
  const [delayedBooks, setDelayedBooks] = useState([]);
  const db = getFirestore(app);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          checkAdmin(user);
          fetchDelayedBooks();
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const backWhereYouCameFrom = async () => {
    history.push("/");
    await wait(100);
    window.location.reload();
  };

  const checkAdmin = async (user1) => {
    const q = query(
      collection(db, "admins"),
      where("email", "==", user1.email),
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      history.push("/");
      await wait(100);
      window.location.reload();
    }
  };

  const isDelayed = (endDate) => {
    const maxReturnDate = new Date(endDate.split("/").reverse().join("/"));
    const currentDate = new Date();

    console.log(currentDate, maxReturnDate);

    return currentDate > maxReturnDate;
  };

  const fetchDelayedBooks = async () => {
    const reservationsRef = collection(db, "reservations");
    const reservationsSnapshot = await getDocs(reservationsRef);
    const reservations = reservationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
    const delayedReservations = reservations.filter(
      (reservation) =>
        reservation.status === "delivered" && isDelayed(reservation.endDate),
    );

    const fetchedReservs = await Promise.all(
      delayedReservations.map(async (doc1) => {
        console.log(doc1.id);

        const bookDoc = await getDoc(doc1.bookId);
        const bookData = bookDoc.data();
        console.log(bookData);
        console.log(bookDoc.id);

        return {
          id: doc1.id,
          ...doc1,
          book: bookData ?? { title: "Book doesn't exist" },
          bookId: { id: bookDoc.id } ?? { title: "Book doesn't exist" },
        };
      }),
    );

    fetchedReservs.sort((a, b) => {
      const dateA = new Date(a.startDate.split("/").reverse().join("/"));
      const dateB = new Date(b.startDate.split("/").reverse().join("/"));
      return dateB - dateA;
    });

    setDelayedBooks(fetchedReservs);
  };

  return (
    <div>
      <section className="reservation-container">
        <h2 className="reservation-title">Reserves endarrerides</h2>
        <table className="reservation-list">
          <thead>
            <tr>
              <th>ID</th>
              <th>Llibre</th>
              <th>Data devolució</th>
              <th>Email del usuari</th>
            </tr>
          </thead>
          <tbody>
            {delayedBooks.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.id}</td>
                <td>{reservation.book.title}</td>
                <td>{reservation.endDate}</td>
                <td>{reservation.email ?? "idk"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DelayedBooks;
