// Categories.js
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

const Categories = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");
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
          fetchCategories();
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  // Function to filter categories based on the search query
  const filterCategories = () => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleEditCategory = async () => {
    if (!editingCategory) {
      return; // Return if no category is being edited
    }

    try {
      const categoryRef = doc(db, "categories", editingCategory.id);
      await updateDoc(categoryRef, {
        name: editingCategory.name,
      });

      // Refresh the category list
      fetchCategories();

      // Reset the editing state
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const fetchCategories = async () => {
    const categoriesRef = collection(db, "categories");
    console.log(categoriesRef);
    const snapshot = await getDocs(categoriesRef);
    const categoryList = await Promise.all(
      snapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data(),
      }))
    );
    setCategories(categoryList);
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

  const handleDeleteCategory = async (categoryId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (confirmation) {
      try {
        await deleteDoc(doc(db, "categories", categoryId));

        // Refresh the category list
        fetchCategories();

        // Reset the editing state
        setEditingCategory(null);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    // Check if a category with the same name already exists
    const categoryQuery = query(
      collection(db, "categories"),
      where("name", "==", newCategory)
    );
    const querySnapshot = await getDocs(categoryQuery);

    if (!querySnapshot.empty) {
      alert("A category with the same name already exists!");
      return; // Exit the function if a category with the same name exists
    }

    // If the category doesn't exist, add it
    const docRef = await addDoc(collection(db, "categories"), {
      name: newCategory,
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });

    setNewCategory("");
  };

  return (
    <div>
      <section className="create-category-section" onSubmit={handleAddCategory}>
        <h2>Create category</h2>
        <form className="create-category-form">
          <input
            id="category"
            name="category"
            type="text"
            required
            className="category-input"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit">Create category</button>
        </form>
      </section>
      <section>
        <h2>Categories</h2>
        <input
          type="text"
          placeholder="Search categories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
        <table>
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {filterCategories().map((category) => (
              <tr key={category.id}>
                {editingCategory && editingCategory.id === category.id ? (
                  <td>
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      }
                    />
                  </td>
                ) : (
                  <td>{category.name}</td>
                )}
                <td>
                  {editingCategory && editingCategory.id === category.id ? (
                    <>
                      <button onClick={handleEditCategory}>Save</button>
                      <button onClick={handleDeleteCategory}>Delete</button>
                      <button onClick={() => setEditingCategory(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingCategory(category)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteCategory(category.id)}>
                        Delete
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

export default Categories;
