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
import logo from "../trans512.png";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [categories, setCategories] = useState([]);
  const db = getFirestore(app);
  const history = useHistory();

  const checkAdmin = async (user1) => {
    const q = query(
      collection(db, "admins"),
      where("email", "==", user1.email),
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
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push("/login");
      await wait(100);
      window.location.reload();
      history.push("/login");
    } catch (error) {
      alert("Error tancant la sessió:", error);
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
            <img src={logo} alt="logo" className="logo"></img>
          </Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" onClick={() => reload()} className="nav-link">
              Inici
            </Link>
          </li>
          <div className="dropdown">
            <button className="dropbtn">Categories</button>
            <div className="dropdown-content">
              {categories.map((category) => (
                <t key={category.id}>
                  <Link
                    to={`/category/${category.id}`}
                    onClick={() => reload()}
                    className="nav-link" // Add nav-link class
                  >
                    {category.name}
                  </Link>
                </t>
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
                Reserves
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
                Administració
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
              Tanca la sessió
            </button>
          </div>
        ) : (
          <ul className="nav-links">
            <li>
              <button
                onClick={() => login()}
                className="login-button"
                style={{ whiteSpace: "nowrap" }}
              >
                Inici de sessió
              </button>
            </li>
            <li>
              <button
                to="/register"
                onClick={() => register()}
                style={{ whiteSpace: "nowrap" }}
                className="register-button"
              >
                Crear un compte
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
