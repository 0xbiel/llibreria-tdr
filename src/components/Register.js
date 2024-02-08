// src/components/Register.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  auth,
  signInWithGooglePopup,
  singInWithGitHubPopup,
} from "../firebase";
import { updateProfile } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

import "./Register.css"; // Import your custom CSS

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const reload = async () => {
    await wait(100);
    window.location.reload();
  };

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
      <div className="register-box" style={{ padding: "50px 100px" }}>
        <h2
          style={{
            alignSelf: "flex-start",
            fontWeight: "bolder !important",
            fontSize: "30px",
          }}
        >
          Crear un compte
        </h2>
        <t>
          Ja tens un compte?{" "}
          <Link to="/login" onClick={() => reload()}>
            <t className="lets-login">Inicia Sessió</t>
          </Link>
        </t>
        <form className="register-form" onSubmit={handleRegister}>
          <label style={{ alignSelf: "flex-start" }}>Nom d'usuari</label>
          <input
            className="register-input"
            value={username}
            style={{ maxWidth: "100%", marginBottom: "20px" }}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label style={{ alignSelf: "flex-start" }}>Email</label>
          <input
            type="email"
            className="register-input"
            value={email}
            placeholder="tu@exemple.com"
            style={{ maxWidth: "100%", marginBottom: "20px" }}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label style={{ alignSelf: "flex-start" }}>Contrasenya</label>
          <input
            type="password"
            className="register-input"
            value={password}
            style={{ maxWidth: "100%", marginBottom: "40px" }}
            placeholder="Introdueix 6 caràcters com a mínim"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="register-button-1">
            Crear un compte
          </button>
        </form>
        <div
          style={{
            width: "100%",
            borderTop: "1px solid #000",
            margin: "20px 0",
          }}
        ></div>
        <button
          onClick={async (event) => {
            event.preventDefault();
            await signInWithGooglePopup();
            await history.push("/"); // Redirect to the homepage
            window.location.reload();
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
          className="google"
        >
          <img
            src="/google.png"
            style={{ maxHeight: "20px", margin: "0px 10px" }}
            alt="google"
          ></img>
          Inicia Sessió amb Google
        </button>

        <button
          onClick={async (event) => {
            event.preventDefault();
            await singInWithGitHubPopup();
            await history.push("/");
            window.location.reload();
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
          className="google"
        >
          <img
            src="/github-mark.png"
            style={{ maxHeight: "20px", margin: "0px 10px" }}
            alt="github"
          ></img>
          Inicia Sessió amb GitHub
        </button>
      </div>
    </div>
  );
};

export default Register;
