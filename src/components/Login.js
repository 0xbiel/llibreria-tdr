// src/components/Login.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import "./Login.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await signInWithEmailAndPassword(auth, email, password);

      // Save user data to localStorage
      const user = {
        id: userCredentials.user.uid,
        email: userCredentials.user.email,
      };
      localStorage.setItem("user", JSON.stringify(user));

      setUser = userCredentials.user;
      // eslint-disable-next-line no-restricted-globals
      history.push("/"); // Redirect to the homepage
      await wait(100);
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Sign in to your account</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email" className="login-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="login-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
