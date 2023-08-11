// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { auth } from '../firebase';
import {onAuthStateChanged} from "firebase/auth/dist/index.mjs";
import { signOut } from 'firebase/auth';

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

    function wait(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    const reload = async () => {
        await wait(100);
        window.location.reload();
    }

    console.log(auth);
    if (auth.currentUser != null) {
        return (
            <nav className="bg-blue-500 p-4">
                <div className="max-w-6xl mx-auto">
                    <Link to="/" onClick={() => reload()} className="text-white text-xl font-bold">
                        Library
                    </Link>
                    <Link to="/reservations" onClick={() => reload()} className="text-white text-xl font-bold">
                        Reservations
                    </Link>
                    <a className="text-white text-xl font-bold">{auth.currentUser.displayName}</a>
                    <button onClick={() => handleLogout()} className="text-white">
                        Logout
                    </button>
                    {/* Add more navigation links here */}
                </div>
            </nav>
        );
    } else {
        return (
            <nav className="bg-blue-500 p-4">
                <div className="max-w-6xl mx-auto">
                    <Link to="/" onClick={() => reload()} className="text-white text-xl font-bold">
                        Library App
                    </Link>
                    <Link to="/login" onClick={() => reload()} className="text-white text-xl font-bold"> Login</Link>
                    <Link to="/register" onClick={() => reload()} className="text-white text-xl font-bold"> Register</Link>
                    {/* Add more navigation links here */}
                </div>
            </nav>
        );
    };
};

export default Navbar;
