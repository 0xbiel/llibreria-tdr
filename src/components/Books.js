// Books.js
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { app, auth } from "../firebase";
import { Link } from "react-router-dom";
import EditBook from "./EditBook";
import { useHistory } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Books = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const db = getFirestore(app);
  const [editingBook, setEditingBook] = useState(null);
  const [editingBookId, setEditingBookId] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const history = useHistory();
  const [publishers, setPublishers] = useState([]);
  const [publicationYear, setPublicationYear] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    imageUrl: "",
    isbn: "",
    description: "",
    authorRef: "",
    categoryRef: "",
    availableCopies: "",
    languageRef: "",
    numberOfPages: "",
    publisherRef: "",
    publicationYear: "",
    dateAdded: "",
    subjectRef: "",
  });

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const filterBooks = () => {
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.publisher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.publicationYear.toString().includes(searchQuery),
    );
  };

  const handleAuthorsChange = (e) => {
    const selectedAuthors = Array.from(e.target.selectedOptions, (option) =>
      doc(db, "authors", option.value),
    );
    // Assuming you want to store only one author for a book, you can take the first one
    setNewBook({
      ...newBook,
      authorRef: selectedAuthors[0], // Store a single Firestore document reference
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategories = Array.from(e.target.selectedOptions, (option) =>
      doc(db, "categories", option.value),
    );
    // Assuming you want to store only one category for a book, you can take the first one
    setNewBook({
      ...newBook,
      categoryRef: selectedCategories[0], // Store a single Firestore document reference
    });
  };

  const handleLanguageChange = (e) => {
    const selectedLanguages = Array.from(e.target.selectedOptions, (option) =>
      doc(db, "languages", option.value),
    );
    // Assuming you want to store only one language for a book, you can take the first one
    setNewBook({
      ...newBook,
      languageRef: selectedLanguages[0],
    });
  };

  const handleEditBook = (book) => {
    setEditingBookId(book.id);
  };

  const handleDeleteBook = async (bookId) => {
    const confirmation = window.confirm(
      "Estas segur que vols eliminar aquest llibre?",
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
      })),
    );
    setAuthors(authorList);
  };

  const fetchPublishers = async () => {
    const publishersRef = collection(db, "publishers");
    const snapshot = await getDocs(publishersRef);
    const publisherList = await Promise.all(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    );
    setPublishers(publisherList);
  };

  const handleSaveBook = async (editedBook) => {
    try {
      // Update the book details in the database
      const bookRef = doc(db, "books", editedBook.id);
      await updateDoc(bookRef, {
        title: editedBook.title,
        imageUrl: editedBook.imageUrl,
        description: editedBook.description,
        isbn: editedBook.isbn,
        authorRef: editedBook.authorRef,
        categoryRef: editedBook.categoryRef,
        availableCopies: editedBook.availableCopies, // Save availableCopies
        languageRef: editedBook.languageRef,
        numberOfPages: editedBook.numberOfPages,
        publisherRef: editedBook.publisherRef,
        subjectRef: editedBook.subjectRef,
      });

      // Update the state to reflect the changes
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === editedBook.id ? editedBook : book,
        ),
      );

      // Reset the editing state
      setEditingBook(null);
    } catch (error) {
      console.error("Error updating book:", error);
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
      })),
    );
    setCategories(categoryList);
  };

  const fetchLanguages = async () => {
    const languagesRef = collection(db, "languages");
    const snapshot = await getDocs(languagesRef);
    const languageList = await Promise.all(
      snapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data(),
      })),
    );
    setLanguages(languageList);
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
  };

  const handleSubmitCreateBook = async (e) => {
    e.preventDefault();

    const yearPublished = parseInt(newBook.publicationYear, 10);
    const availableCopies = parseInt(newBook.availableCopies, 10);
    const numberOfPages = parseInt(newBook.numberOfPages, 10);

    const bookData = {
      title: newBook.title,
      imageUrl: newBook.imageUrl,
      isbn: newBook.isbn,
      description: newBook.description,
      authorRef: newBook.authorRef,
      categoryRef: newBook.categoryRef,
      availableCopies: availableCopies,
      languageRef: newBook.languageRef,
      numberOfPages: numberOfPages,
      publisherRef: newBook.publisherRef,
      publicationYear: yearPublished,
      dateAdded: newBook.dateAdded || getCurrentDate(),
      subjectRef: newBook.subjectRef,
    };

    const docRef = await addDoc(collection(db, "books"), bookData).catch(
      (error) => {
        console.error("Error adding document: ", error);
      },
    );

    console.log("Document written with ID: ", docRef.id);

    setNewBook({
      title: "",
      imageUrl: "",
      description: "",
      authorRef: "",
      categoryRef: "",
      availableCopies: "",
      numberOfPages: "",
      publisherRef: "",
      subjectRef: "",
    });
  };

  const fetchBooks = async () => {
    const booksRef = collection(db, "books");
    const snapshot = await getDocs(booksRef);
    const fetchedBooks = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const bookData = doc.data();
        const authorRef = bookData.authorRef;
        const categoryRef = bookData.categoryRef;
        const languageRef = bookData.languageRef;
        const publisherRef = bookData.publisherRef;
        const subjectRef = bookData.subjectRef;

        // Make sure authorRef is properly defined before using it
        if (authorRef) {
          const authorDoc = await getDoc(authorRef);
          const authorData = authorDoc.data();

          // Make sure categoryRef is properly defined before using it
          if (categoryRef) {
            const categoryDoc = await getDoc(categoryRef);
            const categoryData = categoryDoc.data();

            if (languageRef) {
              const languageDoc = await getDoc(languageRef);
              const languageData = languageDoc.data();

              if (publisherRef) {
                const publisherDoc = await getDoc(publisherRef);
                const publisherData = publisherDoc.data();

                if (subjectRef) {
                  const subjectDoc = await getDoc(subjectRef);
                  const subjectData = subjectDoc.data();

                  return {
                    id: doc.id,
                    ...bookData,
                    author: authorData,
                    category: categoryData,
                    language: languageData,
                    publisher: publisherData,
                    subject: subjectData,
                  };
                } else {
                  return {
                    id: doc.id,
                    ...bookData,
                    author: authorData,
                    category: categoryData,
                    language: languageData,
                    publisher: publisherData,
                    subject: { name: "null" },
                  };
                }
              }

              return {
                id: doc.id,
                ...bookData,
                author: authorData,
                category: categoryData,
                language: languageData,
                publisher: { name: "null" },
                subject: { name: "null" },
              };
            } else {
              return {
                id: doc.id,
                ...bookData,
                author: authorData,
                category: categoryData,
                language: { name: "null" },
                publisher: { name: "null" },
                subject: { name: "null" },
              };
            }
          } else {
            return {
              id: doc.id,
              ...bookData,
              author: authorData,
              category: { name: "null" },
              publisher: { name: "null" },
              subject: { name: "null" },
            };
          }
        }

        return {
          id: doc.id,
          ...bookData,
          author: { name: "null" },
          category: { name: "null" },
          language: { name: "null" },
          publisher: { name: "null" },
        };
      }),
    );
    setBooks(fetchedBooks);
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
          fetchBooks();
          fetchAuthors();
          fetchLanguages();
          fetchCategories();
          fetchPublishers();
          fetchSubjects();
        } catch (e) {}
      } else {
        backWhereYouCameFrom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  const fetchSubjects = async () => {
    const subjectsRef = collection(db, "subjects");
    const snapshot = await getDocs(subjectsRef);
    const subjectList = await Promise.all(
      snapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data(),
      })),
    );
    setSubjects(subjectList);
  };

  const handlePublisherChange = (e) => {
    const selectedPublisherId = e.target.value;
    const selectedPublisherRef = doc(db, "publishers", selectedPublisherId);

    setNewBook({
      ...newBook,
      publisherRef: selectedPublisherRef,
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const handleSubjectChange = (e) => {
    const selectedSubjectId = e.target.value;
    const selectedSubjectRef = doc(db, "subjects", selectedSubjectId);

    setNewBook({
      ...newBook,
      subjectRef: selectedSubjectRef,
    });
  };

  return (
    <div>
      <section className="add-book-section">
        <h2>Afagir llibre</h2>
        <form className="add-book-form" onSubmit={handleSubmitCreateBook}>
          <label>Titol</label>
          <input
            type="text"
            name="title"
            value={newBook.title}
            onChange={handleInputChange}
          />
          <label>ISBN</label>
          <input
            type="text"
            name="isbn"
            value={newBook.isbn}
            onChange={handleInputChange}
          />
          <label>Descripció</label>
          <textarea
            type="text"
            name="description"
            value={newBook.description}
            onChange={handleInputChange}
          />
          <label>Imatge URL</label>
          <textarea
            name="imageUrl"
            value={newBook.imageUrl}
            onChange={handleInputChange}
          />
          <label>Autor:</label>
          <select name="authors" multiple onChange={handleAuthorsChange}>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          <label>Editorial:</label>
          <select name="publisher" multiple onChange={handlePublisherChange}>
            {publishers.map((publisher) => (
              <option key={publisher.id} value={publisher.id}>
                {publisher.name}
              </option>
            ))}
          </select>
          <label>Categoria:</label>
          <select name="categories" multiple onChange={handleCategoryChange}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <label>Idioma:</label>
          <select name="languages" multiple onChange={handleLanguageChange}>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
          <label>Assignatura:</label>
          <select name="subject" multiple onChange={handleSubjectChange}>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <label>Copies totals:</label>
          <input
            type="number"
            name="availableCopies"
            value={newBook.availableCopies}
            onChange={handleInputChange}
          />
          <label>Número de pàgines:</label>
          <input
            type="number"
            name="numberOfPages"
            value={newBook.numberOfPages}
            onChange={handleInputChange}
          />
          <label>Any de publicació:</label>
          <input
            type="number"
            name="publicationYear"
            value={newBook.publicationYear}
            onChange={handleInputChange}
          />

          <button type="submit">Crear</button>
        </form>
      </section>
      <div className="divider"></div>
      <section className="books-section">
        <h2>Consultar llibres</h2>
        <label>
          Cerca:
          <input
            type="text"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <table>
          <thead>
            <tr>
              <th>Titol</th>
              <th>Autor</th>
              <th>Editorial</th>
              <th>ISBN</th>
              <th>Categoria</th>
              <th>Llanguatge</th>
              <th>Copies totals</th>
              <th>Número de pàgines</th>
              <th>Any publicació</th>
              <th>Data creat</th>
              <th>Assignatura</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            {filterBooks().map((book) => (
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
                  <td>{book.publisher.name}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category.name}</td>
                  <td>{book.language.name}</td>
                  <td>{book.availableCopies}</td>
                  <td>{book.numberOfPages}</td>
                  <td>{book.publicationYear}</td>
                  <td>{book.dateAdded}</td>
                  <td>{book.subject.name}</td>
                  <td>
                    <button onClick={() => handleEditBook(book)}>Editar</button>
                    <button onClick={() => handleDeleteBook(book.id)}>
                      Eliminar
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
                        languages={languages}
                        publishers={publishers}
                        subjects={subjects}
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
          authors={authors}
          categories={categories}
          languages={languages}
          publishers={publishers}
          subjects={subjects}
        />
      )}
    </div>
  );
};

export default Books;
