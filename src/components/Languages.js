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

const Languages = () => {
  const [user, setUser] = useState(null);
  const [languages, setLanguages] = useState([]); // Updated state variable name
  const [editingLanguage, setEditingLanguage] = useState(null); // Updated state variable name
  const [newLanguage, setNewLanguage] = useState(""); // Updated state variable name
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
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
          fetchLanguages(); // Updated function name
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  // Function to filter languages based on the search query
  const filterLanguages = () => {
    return languages.filter(
      (
        language // Updated variable name
      ) => language.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleEditLanguage = async () => {
    if (!editingLanguage) {
      return; // Return if no language is being edited
    }

    try {
      const languageRef = doc(db, "languages", editingLanguage.id); // Updated collection name
      await updateDoc(languageRef, {
        name: editingLanguage.name,
      });

      // Refresh the language list
      fetchLanguages();

      // Reset the editing state
      setEditingLanguage(null);
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  const fetchLanguages = async () => {
    const languagesRef = collection(db, "languages"); // Updated collection name
    console.log(languagesRef);
    const snapshot = await getDocs(languagesRef); // Updated collection name
    const languageList = await Promise.all(
      snapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data(),
      }))
    );
    setLanguages(languageList); // Updated variable name
  };

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

  const handleDeleteLanguage = async (languageId) => {
    const confirmation = window.confirm(
      "Estas segur que vols eliminar aquesta llengua?"
    );

    if (confirmation) {
      try {
        await deleteDoc(doc(db, "languages", languageId)); // Updated collection name

        // Refresh the language list
        fetchLanguages();

        // Reset the editing state
        setEditingLanguage(null);
      } catch (error) {
        console.error("Error deleting language:", error);
      }
    }
  };

  const handleAddLanguage = async (e) => {
    e.preventDefault();

    // Check if a language with the same name already exists
    const languageQuery = query(
      collection(db, "languages"), // Updated collection name
      where("name", "==", newLanguage)
    );
    const querySnapshot = await getDocs(languageQuery);

    if (!querySnapshot.empty) {
      alert("A language with this name already exists!");
      return; // Exit the function if a language with the same name exists
    }

    // If the language doesn't exist, add it
    const docRef = await addDoc(collection(db, "languages"), {
      // Updated collection name
      name: newLanguage,
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });

    setNewLanguage("");
  };

  return (
    <div>
      <section className="create-language-section" onSubmit={handleAddLanguage}>
        {" "}
        {/* Updated class name */}
        <h2>Create Language</h2> {/* Updated heading */}
        <form className="create-language-form">
          {" "}
          {/* Updated class name */}
          <input
            id="language" // Updated ID
            name="language" // Updated name attribute
            placeholder="Language Name"
            type="text"
            required
            className="language-input" // Updated class name
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
          />
          <button type="submit">Create Language</button>{" "}
          {/* Updated button text */}
        </form>
      </section>
      <section>
        <h2>Llenguatges</h2> {/* Updated heading */}
        <input
          type="text"
          placeholder="Search languages"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
        <table>
          <thead>
            <tr>
              <th>Name</th> {/* Updated column header */}
            </tr>
          </thead>
          <tbody>
            {filterLanguages().map(
              (
                language // Updated variable name
              ) => (
                <tr key={language.id}>
                  {editingLanguage && editingLanguage.id === language.id ? (
                    <td>
                      <input
                        type="text"
                        value={editingLanguage.name}
                        onChange={(e) =>
                          setEditingLanguage({
                            ...editingLanguage,
                            name: e.target.value,
                          })
                        }
                      />
                    </td>
                  ) : (
                    <td>{language.name}</td>
                  )}
                  <td>
                    {editingLanguage && editingLanguage.id === language.id ? (
                      <>
                        <button onClick={handleEditLanguage}>Save</button>{" "}
                        <button onClick={handleDeleteLanguage}>Delete</button>{" "}
                        <button onClick={() => setEditingLanguage(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingLanguage(language)}>
                          Edit
                        </button>{" "}
                        {/* Updated button text */}
                        <button
                          onClick={() => handleDeleteLanguage(language.id)}
                        >
                          Delete
                        </button>{" "}
                        {/* Updated button text */}
                      </>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Languages; // Updated component name
