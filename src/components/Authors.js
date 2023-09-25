// Authors.js
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { app, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useHistory } from "react-router-dom";

const Authors = () => {
  const [user, setUser] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const history = useHistory();
  const db = getFirestore(app);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    description: "",
  });

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const checkAdmin = async (user1) => {
    const q = query(
      collection(db, "admins"),
      where("email", "==", user1.email)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      history.push("/");
      await wait(100);
      window.location.reload();
    }
  };

  const fetchAuthors = async () => {
    try {
      const authorsRef = collection(db, "authors");
      const snapshot = await getDocs(authorsRef);
      const authorList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAuthors(authorList);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const backWhereYouCameFrom = async () => {
    history.push("/");
    await wait(100);
    window.location.reload();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          console.log(user);
          checkAdmin(user);
          fetchAuthors();
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  const handleSaveAuthor = async (author) => {
    try {
      // Update the author details in the database
      const authorRef = doc(db, "authors", author.id);
      await updateDoc(authorRef, editingAuthor);

      // Refresh the author list
      fetchAuthors();

      // Reset the editing state
      setEditingAuthor(null);
    } catch (error) {
      console.error("Error updating author:", error);
    }
  };

  const handleDeleteAuthor = async (authorId) => {
    const confirmation = window.confirm(
      "Estas segur que vols eliminar aquest autor?"
    );

    if (confirmation) {
      try {
        await deleteDoc(doc(db, "authors", authorId));

        // Refresh the author list
        fetchAuthors();

        // Reset the editing state
        setEditingAuthor(null);
      } catch (error) {
        console.error("Error deleting author:", error);
      }
    }
  };

  const handleInputChangeAuthor = (e) => {
    const { name, value } = e.target;
    setNewAuthor({ ...newAuthor, [name]: value });
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();

    // Check if a category with the same name already exists
    const authorQuery = query(
      collection(db, "authors"),
      where("name", "==", newAuthor.name)
    );
    const querySnapshot = await getDocs(authorQuery);

    if (!querySnapshot.empty) {
      alert("Autor amb el mateix nom ja existeix!");
      return; // Exit the function if a category with the same name exists
    }

    // If the category doesn't exist, add it
    const docRef = await addDoc(collection(db, "authors"), newAuthor).catch(
      (error) => {
        console.error("Error adding document: ", error);
      }
    );

    setNewAuthor({ name: "", description: "" });
  };

  return (
    <div>
      <section className="create-author-section">
        <h2>Crear autor</h2>
        <form className="create-author-form" onSubmit={handleAddAuthor}>
          <label>
            Nom:
            <input
              type="text"
              name="name"
              value={newAuthor.name}
              onChange={handleInputChangeAuthor}
            />
          </label>
          <label>
            Descripció:
            <textarea
              name="description"
              value={newAuthor.description}
              onChange={handleInputChangeAuthor}
            />
          </label>
          <button type="submit">Crear</button>
        </form>
      </section>
      <section>
        <h2>Autors</h2>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Descripció</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                {editingAuthor && editingAuthor.id === author.id ? (
                  <td>
                    <input
                      type="text"
                      placeholder="Nom"
                      value={editingAuthor.name}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          name: e.target.value,
                        })
                      }
                    />
                  </td>
                ) : (
                  <td>{author.name}</td>
                )}
                {editingAuthor && editingAuthor.id === author.id ? (
                  <td>
                    <input
                      type="text"
                      placeholder="Descripció"
                      value={editingAuthor.description}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          description: e.target.value,
                        })
                      }
                    />
                  </td>
                ) : (
                  <td>{author.description}</td>
                )}
                <td>
                  {editingAuthor && editingAuthor.id === author.id ? (
                    <>
                      <button onClick={() => handleSaveAuthor(author)}>
                        Guardar
                      </button>
                      <button onClick={() => handleDeleteAuthor(author.id)}>
                        Eliminar
                      </button>
                      <button onClick={() => setEditingAuthor(null)}>
                        Cancel·lar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingAuthor(author)}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteAuthor(author.id)}>
                        Eliminar
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

export default Authors;
