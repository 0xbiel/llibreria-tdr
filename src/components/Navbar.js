// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { app, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [categories, setCategories] = useState([]);
  const db = getFirestore(app);
  const history = useHistory();

  const checkAdmin = async (user1) => {
    const q = query(
      collection(db, "admins"),
      where("email", "==", user1.email)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      setAdmin(false);
    } else {
      setAdmin(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        checkAdmin(user);
        fetchCategories();
        console.log(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push("/login");
      await wait(100);
      window.location.reload();
      history.push("/login");
    } catch (error) {
      alert("Logout error:", error);
    }
  };

  const login = async () => {
    history.push("/login");
    await wait(100);
    window.location.reload();
  };

  const register = async () => {
    history.push("/register");
    await wait(100);
    window.location.reload();
  };

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const reload = async () => {
    await wait(100);
    window.location.reload();
  };

  const fetchCategories = async () => {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    const categoryList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoryList);
  };

  return (
    <nav className="nav-container">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" onClick={() => reload()} className="nav-logo-text">
            Library App
          </Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" onClick={() => reload()} className="nav-link">
              Home
            </Link>
          </li>
          <div className="dropdown">
            <button className="dropbtn">Categories</button>
            <div className="dropdown-content">
              {categories.map((category) => (
                <a key={category.id}>
                  <Link
                    to={`/category/${category.id}`}
                    onClick={() => reload()}
                    className="nav-link" // Add nav-link class
                  >
                    {category.name}
                  </Link>
                </a>
              ))}
            </div>
          </div>
          {user && (
            <li>
              <Link
                to="/reservations"
                onClick={() => reload()}
                className="nav-link"
              >
                Reservations
              </Link>
            </li>
          )}
          {admin && (
            <li>
              <Link
                to="/admin/dashboard"
                onClick={() => reload()}
                className="nav-link"
              >
                Admin Dashboard
              </Link>
            </li>
          )}
        </ul>
        {user ? (
          <div className="user-container">
            {user.displayName ? (
              <p className="user-info">{user.displayName}</p>
            ) : (
              <p className="user-info">Null</p>
            )}
            <button onClick={() => handleLogout()} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <ul className="nav-links">
            <li>
              <button onClick={() => login()} className="login-button">
                Login
              </button>
            </li>
            <li>
              <button
                to="/register"
                onClick={() => register()}
                className="register-button"
              >
                Register
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
