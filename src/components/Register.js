// src/components/Register.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";
import { useHistory } from "react-router-dom";

import "./Register.css"; // Import your custom CSS

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      const changeDisplayName = async (newDisplayName) => {
        try {
          await updateProfile(auth.currentUser, {
            displayName: newDisplayName,
          });
          console.log("Display name updated successfully");
        } catch (error) {
          alert("Error updating display name:", error);
        }
      };

      await changeDisplayName(username);
      await history.push("/"); // Redirect to the homepage
      window.location.reload(); // Reload the page
    } catch (error) {
      alert("Registration error:", error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Crear un compte</h2>
        <form className="register-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nom d'usuari"
            className="register-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contrasenya"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="register-button">
            Crear un compte
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
