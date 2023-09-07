// src/components/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { app, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [Email, setEmail] = useState("");
  const [books, setBooks] = useState([]);
  const [reservRef, setReservRef] = useState([]); // eslint-disable-next-line no-unused-vars
  const db = getFirestore(app);
  const history = useHistory();

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const fetchBooks = async () => {
    const booksRef = collection(db, "books");
    const snapshot = await getDocs(booksRef);
    const fetchedBooks = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const bookData = doc.data();
        const authorRef = bookData.authorRef;

        // Make sure authorRef is properly defined before using it
        if (authorRef) {
          const authorDoc = await getDoc(authorRef);
          const authorData = authorDoc.data();

          return { id: doc.id, ...bookData, author: authorData };
        }

        return { id: doc.id, ...bookData, author: null };
      })
    );
    setBooks(fetchedBooks);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          checkAdmin(user);
          fetchBooks();
        } catch (e) {}
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkAdmin = async (user1) => {
    const q = query(
      collection(db, "admins"),
      where("email", "==", user1.email)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      history.push("/");
      await wait(100);
      window.location.reload();
    }
  };

  const handleAddAdmin = async (e) => {
    console.log("handleAddAdmin");

    const dbRef = collection(db, "admins");
    addDoc(dbRef, { email: Email })
      .then((dbRef) => {
        console.log("Document written with ID: ", dbRef.id);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  const handleSetAsReturned = async (e) => {
    e.preventDefault();
    try {
      const reservationRef = doc(db, "reservations", reservRef);
      await updateDoc(reservationRef, { status: "returned" });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <section className="mark-as-returned-section">
        <h2>Mark as returned</h2>
        <form className="return-form" onSubmit={handleSetAsReturned}>
          <input
            id="reservationRef"
            name="reservationRef"
            type="text"
            required
            className="reservationRef-input"
            value={reservRef}
            onChange={(e) => setReservRef(e.target.value)}
          />
          <button type="submit">Mark as returned</button>
        </form>
      </section>
      <section className="add-admin-section">
        <h2>Add admin</h2>
        <form className="add-admin-form" onSubmit={handleAddAdmin}>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="email-input"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Add admin</button>
        </form>
      </section>
      <section className="admin-section">
        <h2>Books</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>
                  {/* Add buttons for book actions */}
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
