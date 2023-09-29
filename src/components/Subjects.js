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

const Subjects = () => {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]); // Updated variable name
  const [editingSubject, setEditingSubject] = useState(null); // Updated variable name
  const [newSubject, setNewSubject] = useState(""); // Updated variable name
  const [searchQuery, setSearchQuery] = useState(""); // Updated variable name
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
          fetchSubjects(); // Updated function name
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  // Function to filter subjects based on the search query
  const filterSubjects = () => {
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) // Updated variable name
    );
  };

  const handleEditSubject = async () => {
    if (!editingSubject) {
      return; // Return if no subject is being edited
    }

    try {
      const subjectRef = doc(db, "subjects", editingSubject.id); // Updated collection name
      await updateDoc(subjectRef, {
        name: editingSubject.name,
      });

      // Refresh the subject list
      fetchSubjects();

      // Reset the editing state
      setEditingSubject(null);
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const fetchSubjects = async () => {
    const subjectsRef = collection(db, "subjects"); // Updated collection name
    console.log(subjectsRef);
    const snapshot = await getDocs(subjectsRef); // Updated collection name
    const subjectList = await Promise.all(
      snapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data(),
      }))
    );
    setSubjects(subjectList); // Updated variable name
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

  const handleDeleteSubject = async (subjectId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (confirmation) {
      try {
        await deleteDoc(doc(db, "subjects", subjectId)); // Updated collection name

        // Refresh the subject list
        fetchSubjects();

        // Reset the editing state
        setEditingSubject(null);
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();

    // Check if a subject with the same name already exists
    const subjectQuery = query(
      collection(db, "subjects"), // Updated collection name
      where("name", "==", newSubject)
    );
    const querySnapshot = await getDocs(subjectQuery);

    if (!querySnapshot.empty) {
      alert("A subject with this name already exists!");
      return; // Exit the function if a subject with the same name exists
    }

    // If the subject doesn't exist, add it
    const docRef = await addDoc(collection(db, "subjects"), {
      // Updated collection name
      name: newSubject,
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });

    setNewSubject("");
  };

  return (
    <div>
      <section className="create-subject-section" onSubmit={handleAddSubject}>
        <h2>Crear Assignatures</h2>
        <form className="create-subject-form">
          <input
            id="subject"
            name="subject"
            placeholder="Nom Assignatura"
            type="text"
            required
            className="subject-input"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button type="submit">Crear Assignatures</button>
        </form>
      </section>
      <section>
        <h2>Assignatures</h2>
        <input
          type="text"
          placeholder="Cercar Assignatures"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>Nom</th>
            </tr>
          </thead>
          <tbody>
            {filterSubjects().map((subject) => (
              <tr key={subject.id}>
                {editingSubject && editingSubject.id === subject.id ? (
                  <td>
                    <input
                      type="text"
                      value={editingSubject.name}
                      onChange={(e) =>
                        setEditingSubject({
                          ...editingSubject,
                          name: e.target.value,
                        })
                      }
                    />
                  </td>
                ) : (
                  <td>{subject.name}</td>
                )}
                <td>
                  {editingSubject && editingSubject.id === subject.id ? (
                    <>
                      <button onClick={handleEditSubject}>Guardar</button>{" "}
                      <button onClick={handleDeleteSubject}>Eliminar</button>{" "}
                      <button onClick={() => setEditingSubject(null)}>
                        Cancel·lar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingSubject(subject)}>
                        Editar
                      </button>{" "}
                      <button onClick={() => handleDeleteSubject(subject.id)}>
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

export default Subjects;
