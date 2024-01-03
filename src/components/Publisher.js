import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { app, auth } from "../firebase";
import { useHistory } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Publisher = () => {
  const [user, setUser] = useState(null);
  const [publishers, setPublishers] = useState([]);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [newPublisher, setNewPublisher] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const history = useHistory();
  const db = getFirestore(app);

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

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
          fetchPublishers(); // Updated function name
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  // Function to filter publishers based on the search query
  const filterPublishers = () => {
    return publishers.filter(
      (
        publisher, // Updated variable name
      ) => publisher.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const handleEditPublisher = async () => {
    if (!editingPublisher) {
      return; // Return if no publisher is being edited
    }

    try {
      const languageRef = doc(db, "publishers", editingPublisher.id); // Updated collection name
      await updateDoc(languageRef, {
        name: editingPublisher.name,
      });

      // Refresh the publisher list
      fetchPublishers();

      // Reset the editing state
      setEditingPublisher(null);
    } catch (error) {
      console.error("Error updating publisher:", error);
    }
  };

  const fetchPublishers = async () => {
    const languagesRef = collection(db, "publishers"); // Updated collection name
    console.log(languagesRef);
    const snapshot = await getDocs(languagesRef); // Updated collection name
    const languageList = await Promise.all(
      snapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data(),
      })),
    );
    setPublishers(languageList); // Updated variable name
  };

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

  const handleDeletePublisher = async (languageId) => {
    const confirmation = window.confirm(
      "Estas segur que vols eliminar aquesta llengua?",
    );

    if (confirmation) {
      try {
        await deleteDoc(doc(db, "publishers", languageId)); // Updated collection name

        // Refresh the publisher list
        fetchPublishers();

        // Reset the editing state
        setEditingPublisher(null);
      } catch (error) {
        console.error("Error deleting publisher:", error);
      }
    }
  };

  const handleAddPublisher = async (e) => {
    e.preventDefault();

    // Check if a publisher with the same name already exists
    const languageQuery = query(
      collection(db, "publishers"), // Updated collection name
      where("name", "==", newPublisher),
    );
    const querySnapshot = await getDocs(languageQuery);

    if (!querySnapshot.empty) {
      alert("A publisher with this name already exists!");
      return; // Exit the function if a publisher with the same name exists
    }

    // If the publisher doesn't exist, add it
    const docRef = await addDoc(collection(db, "publishers"), {
      // Updated collection name
      name: newPublisher,
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });

    setNewPublisher("");
  };

  return (
    <div>
      <section
        className="create-publisher-section"
        onSubmit={handleAddPublisher}
      >
        <h2>Crear Editorial</h2>
        <form className="create-publisher-form">
          <input
            id="publisher" // Updated ID
            name="publisher" // Updated name attribute
            placeholder="Nom Editorial"
            type="text"
            required
            className="publisher-input" // Updated class name
            value={newPublisher}
            onChange={(e) => setNewPublisher(e.target.value)}
          />
          <button type="submit">Crear Editorial</button>{" "}
          {/* Updated button text */}
        </form>
      </section>
      <section>
        <h2>Editorials</h2> {/* Updated heading */}
        <input
          type="text"
          placeholder="Cercar Editorials"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
        <table>
          <thead>
            <tr>
              <th>Nom</th> {/* Updated column header */}
            </tr>
          </thead>
          <tbody>
            {filterPublishers().map(
              (
                publisher, // Updated variable name
              ) => (
                <tr key={publisher.id}>
                  {editingPublisher && editingPublisher.id === publisher.id ? (
                    <td>
                      <input
                        type="text"
                        value={editingPublisher.name}
                        onChange={(e) =>
                          setEditingPublisher({
                            ...editingPublisher,
                            name: e.target.value,
                          })
                        }
                      />
                    </td>
                  ) : (
                    <td>{publisher.name}</td>
                  )}
                  <td>
                    {editingPublisher &&
                    editingPublisher.id === publisher.id ? (
                      <>
                        <button onClick={handleEditPublisher}>Guardar</button>{" "}
                        <button onClick={handleDeletePublisher}>
                          Eliminar
                        </button>{" "}
                        <button onClick={() => setEditingPublisher(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingPublisher(publisher)}>
                          Edit
                        </button>{" "}
                        {/* Updated button text */}
                        <button
                          onClick={() => handleDeletePublisher(publisher.id)}
                        >
                          Delete
                        </button>{" "}
                        {/* Updated button text */}
                      </>
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Publisher;
