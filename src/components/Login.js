// src/components/Login.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  auth,
  signInWithGooglePopup,
  singInWithGitHubPopup,
} from "../firebase";
import { Link } from "react-router-dom";

import "./Login.css";

const Login = ({ setUser }) => {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password,
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
      alert("Login error:", error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box" style={{ padding: "30px 100px" }}>
        <h2
          className="register-title"
          style={{
            alignSelf: "flex-start",
            fontWeight: "bolder !important",
            fontSize: "35px",
            marginBottom: "5px",
          }}
        >
          Iniciar sessió
        </h2>
        <t style={{ marginBottom: "10px" }}>
          Encara no tens un compte?{" "}
          <Link to="/register" onClick={() => reload()}>
            <t className="lets-login">Crea un Compte</t>
          </Link>
        </t>
        <form className="login-form" onSubmit={handleLogin}>
          <label style={{ alignSelf: "flex-start" }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="register-input"
            placeholder="tu@example.com"
            value={email}
            style={{ maxWidth: "100%", marginBottom: "20px" }}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={{ alignSelf: "flex-start" }}>Contrasenya</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="register-input"
            placeholder="*********"
            value={password}
            style={{ maxWidth: "100%", marginBottom: "20px" }}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="register-button-1">
            Iniciar sessió
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
          onClick={async(event) => {
            event.preventDefault();
            await signInWithGooglePopup();
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
            src="/google.png"
            style={{ maxHeight: "20px", margin: "0px 10px" }}
            alt="google"
          ></img>
          Inicia Sessió amb Google
        </button>

        <button
          onClick={async(event) => {
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

export default Login;
