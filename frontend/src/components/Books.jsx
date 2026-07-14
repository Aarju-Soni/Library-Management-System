import { useState, useEffect } from "react";
import api from "../api/axios";

function Books() {
  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    published_year: "",
    available: true,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data);
    } catch (err) {
      setError("Failed to load books");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      published_year: "",
      available: true,
    });

    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const bookData = {
      ...form,
      published_year: parseInt(form.published_year),
    };

    if (isNaN(bookData.published_year)) {
      setError("Published year must be a valid number.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, bookData);
      } else {
        await api.post("/books", bookData);
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      published_year: book.published_year,
      available: book.available,
    });

    setEditingId(book.id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete book");
    }
  };

  return (
    <div>
      <h2>Books</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="published_year"
          placeholder="Published Year"
          value={form.published_year}
          onChange={handleChange}
          required
        />

        <label style={{ marginLeft: "10px" }}>
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={handleChange}
          />
          {" "}Available
        </label>

        <button type="submit" style={{ marginLeft: "10px" }}>
          {editingId ? "Update Book" : "Add Book"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        )}
      </form>

      <table
        border="1"
        cellPadding="8"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published Year</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {books.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No books found.
              </td>
            </tr>
          ) : (
            books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.published_year}</td>
                <td>{book.available ? "Yes" : "No"}</td>

                <td>
                  <button onClick={() => handleEdit(book)}>
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(book.id)}
                    disabled={!book.available}
                    style={{ marginLeft: "10px" }}
                  >
                    {book.available ? "Delete" : "Borrowed"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Books;