// src/components/AdminDashboard.js
import React, { useEffect, useState } from "react";
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
  deleteDoc,
} from "firebase/firestore";
import "./AdminDashboard.css"; // Import your CSS file

import { useHistory, Route, Switch, NavLink } from "react-router-dom";
import Books from "./Books";
import Categories from "./Categories";
import Authors from "./Authors";
import AdminUsers from "./AdminUsers";
import DelayedBooks from "./DelayedBooks";
import AdminReservations from "./AdminReservations";
import Languages from "./Languages";
import Publisher from "./Publisher";
import Subjects from "./Subjects";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [reservRef, setReservRef] = useState([]); // eslint-disable-next-line no-unused-vars
  const [reservRefDelivered, setReservRefDelivered] = useState([]); // eslint-disable-next-line no-unused-vars
  const db = getFirestore(app);
  const history = useHistory();
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]); // Store the list of authors

  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [selectedReservationDetails, setSelectedReservationDetails] =
    useState(null);

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
        const categoryRef = bookData.categoryRef;

        // Make sure authorRef is properly defined before using it
        if (authorRef) {
          const authorDoc = await getDoc(authorRef);
          const authorData = authorDoc.data();

          // Make sure categoryRef is properly defined before using it
          if (categoryRef) {
            const categoryDoc = await getDoc(categoryRef);
            const categoryData = categoryDoc.data();

            return {
              id: doc.id,
              ...bookData,
              author: authorData,
              category: categoryData,
            };
          } else {
            return {
              id: doc.id,
              ...bookData,
              author: authorData,
              category: { name: "null" },
            };
          }
        }

        return {
          id: doc.id,
          ...bookData,
          author: { name: null },
          category: { name: "null" },
        };
      })
    );
    setBooks(fetchedBooks);
  };

  const backWhereYouCameFrom = async () => {
    history.push("/");
    await wait(100);
    window.location.reload();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          fetchBooks();
          fetchAuthors();
          fetchCategories();
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
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

  const handleSetAsReturned = async (e) => {
    e.preventDefault();
    try {
      const reservationRef = doc(db, "reservations", reservRef);
      await updateDoc(reservationRef, { status: "returned" });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleSetAsDelivered = async (e) => {
    e.preventDefault();
    try {
      const reservationRef = doc(db, "reservations", reservRefDelivered);
      await updateDoc(reservationRef, { status: "delivered" });
    } catch (error) {
      console.log(reservRef);
      console.error("Error updating document: ", error);
    }
  };

  const fetchAuthors = async () => {
    const authorsRef = collection(db, "authors");
    console.log(authorsRef);
    const snapshot = await getDocs(authorsRef);
    const authorList = await Promise.all(
      snapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data(),
      }))
    );
    setAuthors(authorList);
  };

  const fetchCategories = async () => {
    const categoriesRef = collection(db, "categories");
    console.log(categoriesRef);
    const snapshot = await getDocs(categoriesRef);
    const categoryList = await Promise.all(
      snapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data(),
      }))
    );
    setCategories(categoryList);
  };

  const handleViewReservation = async (e) => {
    e.preventDefault();
    if (!selectedReservationId) return;

    try {
      const reservationRef = doc(db, "reservations", selectedReservationId);
      const reservationSnapshot = await getDoc(reservationRef);
      const reservationData = reservationSnapshot.data();

      if (reservationData) {
        const bookSnapshot = await getDoc(reservationData.bookId);
        const bookData = bookSnapshot.data();
        if (!bookData) {
          setSelectedReservationDetails({
            id: reservationData.id,
            ...reservationData,
            book: { title: "Llibre no existeix" },
          });
          return;
        }

        setSelectedReservationDetails({
          id: reservationData.id,
          ...reservationData,
          book: bookData,
        });
      } else {
        setSelectedReservationDetails(null);
        alert("Reserva no trobada.");
      }
    } catch (error) {
      console.error("Error fetching reservation:", error);
      alert("Error cercant reserva.");
    }
  };

  const reload = async () => {
    await wait(100);
    window.location.reload();
  };

  return (
    <div>
      <h1 className="header">Pàgina d'administrador</h1>
      <section className="mark-as-delivered-section">
        <h2>Marcar com entregat</h2>
        <form className="return-form" onSubmit={handleSetAsDelivered}>
          <input
            id="reservationRef"
            name="reservationRef"
            type="text"
            required
            className="reservationRef-input"
            value={reservRefDelivered}
            onChange={(e) => setReservRefDelivered(e.target.value)}
          />
          <button className="adminButton" type="submit">
            Marcat com entregat
          </button>
        </form>
      </section>
      <section className="mark-as-returned-section">
        <h2>Marcar com a tornat</h2>
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
          <button className="adminButton" type="submit">
            Marcar com a tornat
          </button>
        </form>
      </section>
      <section className="view-reservation-section">
        <h2>Veure Reserva</h2>
        <form onSubmit={handleViewReservation}>
          <input
            type="text"
            placeholder="ID Reserva"
            value={selectedReservationId}
            onChange={(e) => setSelectedReservationId(e.target.value)}
          />
          <button className="adminButton" type="submit">
            Veure reserva
          </button>
        </form>
        {selectedReservationDetails && (
          <div className="overlay">
            <div className="modal">
              <h2>Reservation Details</h2>
              <p>Reservation ID: {selectedReservationId}</p>
              <p>Book Title: {selectedReservationDetails.book.title}</p>
              <p>Start Date: {selectedReservationDetails.startDate}</p>
              <p>End Date: {selectedReservationDetails.endDate}</p>
              <p>Status: {selectedReservationDetails.status}</p>
              <button
                className="adminButton"
                onClick={() => setSelectedReservationDetails(null)}
              >
                Tancar
              </button>
            </div>
          </div>
        )}
      </section>
      <nav className="AdminNav">
        <ul className="AdminUl">
          <li className="AdminLi">
            <NavLink
              to="/admin/reservations"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Reserves
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/delayed"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Reserves endarrerides
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/books"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Llibres
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/categories"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Categories
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/publishers"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Editorials
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/languages"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Llenguatges
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/authors"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Autors
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/subjects"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Assignatures
            </NavLink>
          </li>
          <li className="AdminLi">
            <NavLink
              to="/admin/admin_users"
              onClick={() => reload()}
              activeClassName="active-link"
              className="menu-link" // Apply the nav-link class
            >
              Administradors
            </NavLink>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/admin/reservations" component={AdminReservations} />
        <Route path="/admin/delayed" component={DelayedBooks} />
        <Route path="/admin/languages" component={Languages} />
        <Route path="/admin/publishers" component={Publisher} />
        <Route path="admin/subjects" component={Subjects} />
        <Route path="/admin/books">
          <Books />
        </Route>
        <Route path="/admin/categories">
          <Categories />
        </Route>
        <Route path="/admin/authors">
          <Authors />
        </Route>
        <Route path="/admin/admin_users">
          <AdminUsers />
        </Route>
      </Switch>
    </div>
  );
};

export default AdminDashboard;
