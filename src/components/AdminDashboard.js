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
} from "firebase/firestore";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [books, setBooks] = useState([]);
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
          console.log(user);
          checkAdmin(user);
          fetchBooks();
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
    try {
      const adminData = {
        email: e,
      };
      await addDoc(collection(db, "admins"), adminData);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
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
                <td>{book.author}</td>
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
