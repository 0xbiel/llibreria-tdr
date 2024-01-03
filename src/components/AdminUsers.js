// src/components/AdminUsers.js
import React, { useEffect } from "react";
import { useState } from "react";
import { app, auth } from "../firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { useHistory } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const AdminUsers = () => {
  const [user, setUser] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [Email, setEmail] = useState("");
  const db = getFirestore(app);
  const history = useHistory();

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const checkAdmin = async (user1) => {
    const q = query(
      collection(db, "admins"),
      where("email", "==", user1.email),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      history.push("/");
      await wait(100);
      window.location.reload();
    }
  };

  const backWhereYouCameFrom = async () => {
    history.push("/");
    await wait(100);
    window.location.reload();
  };

  const fetchUsers = async () => {
    const usersRef = collection(db, "admins");
    const snapshot = await getDocs(usersRef);
    console.log(snapshot.docs);
    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(userList);
    setAdmins(userList);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          checkAdmin(user);
          fetchUsers();
          console.log(setAdmins);
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  const handleEditUser = async () => {
    if (!editingUser) {
      return;
    }

    try {
      const adminRef = doc(db, "admins", editingUser.id);
      await updateDoc(adminRef, {
        email: editingUser.email,
      });

      fetchUsers();

      // Reset the editing state
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmation = window.confirm(
      "Estas segur que vols eliminar aquest administrador?",
    );

    if (confirmation) {
      try {
        await deleteDoc(doc(db, "admins", userId));
        fetchUsers();

        // Reset the editing state
        setEditingUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleAddAdmin = async (e) => {
    console.log("handleAddAdmin");

    e.preventDefault();

    const docRef = await addDoc(collection(db, "admins"), {
      email: Email,
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
    console.log("Document written with ID: ", docRef.id);

    setEmail("");
  };

  return (
    <div>
      <section className="add-admin-section">
        <h2>Afagir admin</h2>
        <form className="add-admin-form" onSubmit={handleAddAdmin}>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="email-input"
            placeholder="Email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Afagir admin</button>
        </form>
      </section>
      <section className="Admin table">
        <h2>Admins</h2>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Email</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                {editingUser && editingUser.id === admin.id ? (
                  <td>
                    <input
                      type="email" // Change this to "email"
                      value={editingUser.email} // Change this to "email"
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value, // Change this to "email"
                        })
                      }
                    />
                  </td>
                ) : (
                  <td>{admin.email}</td>
                )}
                <td>
                  {editingUser && editingUser.id === admin.id ? (
                    <>
                      <button onClick={handleEditUser}>Save</button>
                      <button onClick={handleDeleteUser}>Delete</button>
                      <button onClick={() => setEditingUser(null)}>
                        Cancel·lar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingUser(admin)}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteUser(admin.id)}>
                        Borrar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminUsers;
