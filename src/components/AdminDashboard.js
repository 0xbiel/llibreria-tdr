// src/components/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { app, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import EditBook from "./EditBook";
import { Link } from "react-router-dom";
import "./AdminDashboard.css"; // Import your CSS file

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [Email, setEmail] = useState("");
  const [books, setBooks] = useState([]);
  const [reservRef, setReservRef] = useState([]); // eslint-disable-next-line no-unused-vars
  const db = getFirestore(app);
  const history = useHistory();
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]); // Store the list of authors
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: "",
    imageUrl: "",
    description: "",
    authorRef: "",
    categoryRef: "",
  });

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [selectedReservationDetails, setSelectedReservationDetails] =
    useState(null);

  const [newAuthor, setNewAuthor] = useState({
    name: "",
    description: "",
  });

  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editingBookId, setEditingBookId] = useState(null);

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const fetchBooks = async () => {
    const booksRef = collection(db, "books");
    const snapshot = await getDocs(booksRef);
    const fetchedBooks = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const bookData = doc.data();
        const authorRef = bookData.authorRef;
        const categoryRef = bookData.categoryRef;

        // Make sure authorRef is properly defined before using it
        if (authorRef) {
          const authorDoc = await getDoc(authorRef);
          const authorData = authorDoc.data();

          // Make sure categoryRef is properly defined before using it
          if (categoryRef) {
            const categoryDoc = await getDoc(categoryRef);
            const categoryData = categoryDoc.data();

            return {
              id: doc.id,
              ...bookData,
              author: authorData,
              category: categoryData,
            };
          } else {
            return {
              id: doc.id,
              ...bookData,
              author: authorData,
              category: { name: "null" },
            };
          }
        }

        return {
          id: doc.id,
          ...bookData,
          author: { name: null },
          category: { name: "null" },
        };
      })
    );
    setBooks(fetchedBooks);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        try {
          checkAdmin(user);
          fetchBooks();
          fetchAuthors();
          fetchCategories();
          console.log(authors);
        } catch (e) {}
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

  const handleSetAsReturned = async (e) => {
    e.preventDefault();
    try {
      const reservationRef = doc(db, "reservations", reservRef);
      await updateDoc(reservationRef, { status: "returned" });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (confirmation) {
      try {
        await deleteDoc(doc(db, "books", bookId));

        // After successful deletion, update the state to reflect the change
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  const fetchAuthors = async () => {
    const authorsRef = collection(db, "authors");
    console.log(authorsRef);
    const snapshot = await getDocs(authorsRef);
    const authorList = await Promise.all(
      snapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data(),
      }))
    );
    setAuthors(authorList);
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

  const handleEditBook = (book) => {
    setEditingBookId(book.id);
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
  };

  const handleSaveBook = async (editedBook) => {
    try {
      // Update the book details in the database
      const bookRef = doc(db, "books", editedBook.id);
      await updateDoc(bookRef, {
        title: editedBook.title,
        imageUrl: editedBook.imageUrl,
        description: editedBook.description,
        authorRef: editedBook.authorRef,
        categoryRef: editedBook.categoryRef,
        availableCopies: editedBook.availableCopies, // Save availableCopies
      });

      // Update the state to reflect the changes
      setBooks((prevBooks) =>
        prevBooks.map((book) => (book.id === editedBook.id ? editedBook : book))
      );

      // Reset the editing state
      setEditingBook(null);
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleAuthorsChange = (e) => {
    const selectedAuthors = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setNewBook({
      ...newBook,
      authorRef: doc(db, "authors", selectedAuthors[0]),
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setNewBook({
      ...newBook,
      categoryRef: doc(db, "categories", selectedCategory[0]),
    });
  };

  const handleSubmitCreateBook = async (e) => {
    e.preventDefault();

    // Ensure availableCopies is an integer
    const availableCopies = parseInt(newBook.availableCopies, 10);

    const bookData = {
      title: newBook.title,
      imageUrl: newBook.imageUrl,
      description: newBook.description,
      authorRef: newBook.authorRef,
      categoryRef: newBook.categoryRef,
      availableCopies: availableCopies, // Save availableCopies
    };

    const docRef = await addDoc(collection(db, "books"), bookData).catch(
      (error) => {
        console.error("Error adding document: ", error);
      }
    );

    console.log("Document written with ID: ", docRef.id);

    setNewBook({
      title: "",
      imageUrl: "",
      description: "",
      authorRef: "",
      categoryRef: "",
      availableCopies: "", // Reset availableCopies
    });
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
      alert("A category with the same name already exists!");
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
      "Are you sure you want to delete this author?"
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

  const handleViewReservation = async (e) => {
    e.preventDefault();
    if (!selectedReservationId) return;

    try {
      const reservationRef = doc(db, "reservations", selectedReservationId);
      const reservationSnapshot = await getDoc(reservationRef);
      const reservationData = reservationSnapshot.data();
      console.log(reservationData);

      if (reservationData) {
        const bookSnapshot = await getDoc(reservationData.bookId);
        const bookData = bookSnapshot.data();

        setSelectedReservationDetails({
          id: reservationData.id,
          ...reservationData,
          book: bookData,
        });
      } else {
        setSelectedReservationDetails(null);
        alert("Reservation not found.");
      }
    } catch (error) {
      console.error("Error fetching reservation:", error);
      alert("Error fetching reservation.");
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <section className="mark-as-returned-section">
        <h2>Mark as returned</h2>
        <form className="return-form" onSubmit={handleSetAsReturned}>
          <input
            id="reservationRef"
            name="reservationRef"
            type="text"
            required
            className="reservationRef-input"
            value={reservRef}
            onChange={(e) => setReservRef(e.target.value)}
          />
          <button type="submit">Mark as returned</button>
        </form>
      </section>
      <section className="view-reservation-section">
        <h2>View reservation</h2>
        <form onSubmit={handleViewReservation}>
          <input
            type="text"
            placeholder="Reservation ID"
            value={selectedReservationId}
            onChange={(e) => setSelectedReservationId(e.target.value)}
          />
          <button type="submit">View Reservation</button>
        </form>
        {selectedReservationDetails && (
          <div className="overlay">
            <div className="modal">
              <h2>Reservation Details</h2>
              <p>Reservation ID: {selectedReservationId}</p>
              <p>Book Title: {selectedReservationDetails.book.title}</p>
              <p>Start Date: {selectedReservationDetails.startDate}</p>
              <p>End Date: {selectedReservationDetails.endDate}</p>
              <p>Status: {selectedReservationDetails.status}</p>
              {/* Add more reservation details as needed */}
              <button onClick={() => setSelectedReservationId(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="add-admin-section">
        <h2>Add admin</h2>
        <form className="add-admin-form" onSubmit={handleAddAdmin}>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="email-input"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Add admin</button>
        </form>
      </section>
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
      <section className="create-author-section">
        <h2>Create author</h2>
        <form className="create-author-form" onSubmit={handleAddAuthor}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={newAuthor.name}
              onChange={handleInputChangeAuthor}
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={newAuthor.description}
              onChange={handleInputChangeAuthor}
            />
          </label>
          <button type="submit">Create</button>
        </form>
      </section>
      <section className="add-book-section">
        <h2>Add book</h2>
        <form className="add-book-form" onSubmit={handleSubmitCreateBook}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={newBook.title}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={newBook.description}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Image URL:
            <textarea
              name="imageUrl"
              value={newBook.imageUrl}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Authors:
            <select name="authors" multiple onChange={handleAuthorsChange}>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category:
            <select name="categories" multiple onChange={handleCategoryChange}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Available Copies:
            <input
              type="number"
              name="availableCopies"
              value={newBook.availableCopies}
              onChange={handleInputChange}
            />
          </label>
          <button type="submit">Create</button>
        </form>
      </section>
      <section>
        <h2>Categories</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
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
      <section>
        <h2>Authors</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                {editingAuthor && editingAuthor.id === author.id ? (
                  <td>
                    <input
                      type="text"
                      placeholder="Name"
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
                      placeholder="Description"
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
                        Save
                      </button>
                      <button onClick={() => handleDeleteAuthor(author.id)}>
                        Delete
                      </button>
                      <button onClick={() => setEditingAuthor(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingAuthor(author)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteAuthor(author.id)}>
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
      <section className="books-section">
        <h2>Books</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Available Copies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <React.Fragment key={book.id}>
                <tr>
                  <Link
                    to={`/books/${book.id}`}
                    onClick={async () => {
                      await wait(100);
                      window.location.reload();
                    }}
                  >
                    {book.title}
                  </Link>
                  <td>{book.author.name}</td>
                  <td>{book.category.name}</td>
                  <td>{book.availableCopies}</td>
                  <td>
                    <button onClick={() => handleEditBook(book)}>Edit</button>
                    <button onClick={() => handleDeleteBook(book.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
                {editingBookId === book.id && (
                  <tr>
                    <td colSpan="4">
                      <EditBook
                        book={book}
                        onSave={handleSaveBook}
                        onCancel={() => setEditingBookId(null)} // Close edit form
                        authors={authors}
                        categories={categories}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>
      {editingBook && (
        <EditBook
          book={editingBook}
          onSave={handleSaveBook}
          onCancel={handleCancelEdit}
          authors={authors} // Pass the list of authors to the EditBook component
          categories={categories} // Pass the list of categories to the EditBook component
        />
      )}
    </div>
  );
};

export default AdminDashboard;
