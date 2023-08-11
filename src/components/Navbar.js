// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { auth } from '../firebase';
import {onAuthStateChanged} from "firebase/auth/dist/index.mjs";
import { signOut } from 'firebase/auth';
import './Navbar.css';
import register from "./Register";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const history = useHistory();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            try{
                console.log(user.uid);
            } catch (e) {

            };
        });


        return () => {
            unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            history.push('/login');
            await wait(100);
            window.location.reload();
            history.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const login = async () => {
        history.push('/login');
        await wait(100);
        window.location.reload();
    }

    const register = async () => {
        history.push('/register');
        await wait(100);
        window.location.reload();
    }

    function wait(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    const reload = async () => {
        await wait(100);
        window.location.reload();
    }

    console.log(auth);
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
                    {user && (
                        <li>
                            <Link to="/reservations" onClick={() => reload()} className="nav-link">
                                Reservations
                            </Link>
                        </li>
                    )}
                </ul>
                {user ? (
                    <div className="user-container">
                        <p className="user-info">{auth.currentUser.displayName}</p>
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
                            <button to="/register" onClick={() => register()} className="register-button">
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
