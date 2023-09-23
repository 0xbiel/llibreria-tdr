// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Reservations from "./components/Reservations";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Homepage from "./components/Homepage";
import Navbar from "./components/Navbar";
import BookDetails from "./components/BookDetails";
import "./styles.css";
import AdminDashboard from "./components/AdminDashboard";
import Category from "./components/Category";
import Books from "./components/Books";
import Categories from "./components/Categories";
import Authors from "./components/Authors";
import AdminUsers from "./components/AdminUsers";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route
          path="/reservations"
          render={() => <Reservations user={user} />}
        />
        <Route path="/books/:id" component={BookDetails} />
        <Route path="/category/:categoryId" component={Category} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/admin_users">
          <AdminUsers />
        </Route>
        <Route path="/admin/books">
          <Books />
        </Route>
        <Route path="/admin/categories">
          <Categories />
        </Route>
        <Route path="/admin/authors">
          <Authors />
        </Route>
        <Route path="/" component={Homepage}></Route>
      </Switch>
    </Router>
  );
};

export default App;
