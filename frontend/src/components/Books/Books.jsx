import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Books.css";

function Book() {
  const [books, setBooks] = useState([]);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    published_year: "",
  });

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((error) => error.msg).join(", ");
    }

    return detail || "Something went wrong";
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const [booksRes, recordsRes] = await Promise.all([
        api.get("/books"),
        api.get("/borrow"),
      ]);

      setBooks(booksRes.data);
      setRecords(recordsRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load books");
    }
  };

  const isBookBorrowed = (bookId) => {
    return records.some(
      (record) =>
        record.book_id === bookId &&
        !record.return_date
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      published_year: "",
    });

    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      form.published_year.length !== 4 ||
      Number(form.published_year) < 1000 ||
      Number(form.published_year) > 9999
    ) {
      setError("Please enter a valid year");
      return;
    }

    const bookData = {
      ...form,
      published_year: Number(form.published_year),
    };

    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, bookData);
      } else {
        await api.post("/books", bookData);
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      published_year: book.published_year.toString(),
    });

    setEditingId(book.id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) {
      return;
    }

    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="lib-page">
      <div className="lib-card">
        <header className="lib-header">
          <span className="lib-eyebrow">Catalog</span>
          <h2 className="lib-title">Books</h2>
        </header>

        {error && <p className="lib-error">{error}</p>}

        <form onSubmit={handleSubmit} className="lib-form">
          <div className="lib-field">
            <label className="lib-label" htmlFor="title">
              Title
            </label>

            <input
              id="title"
              type="text"
              name="title"
              placeholder="e.g. The Silent Patient"
              value={form.title}
              onChange={handleChange}
              required
              className="lib-input"
            />
          </div>

          <div className="lib-field">
            <label className="lib-label" htmlFor="author">
              Author
            </label>

            <input
              id="author"
              type="text"
              name="author"
              placeholder="e.g. Alex Michaelides"
              value={form.author}
              onChange={handleChange}
              required
              className="lib-input"
            />
          </div>

          <div className="lib-field lib-field-year">
            <label className="lib-label" htmlFor="published_year">
              Year
            </label>

            <input
              id="published_year"
              type="number"
              name="published_year"
              placeholder="YYYY"
              value={form.published_year}
              onChange={handleChange}
              required
              className="lib-input lib-input-year"
            />
          </div>

          <div className="lib-form-actions">
            <button
              type="submit"
              className="lib-btn lib-btn-primary"
            >
              {editingId ? "Update book" : "Add book"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="lib-btn lib-btn-ghost"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lib-table-wrap">
          <table className="lib-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Year</th>
                <th>Status</th>
                <th className="lib-th-actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="5" className="lib-empty">
                    The shelf is empty — add the first book above.
                  </td>
                </tr>
              ) : (
                books.map((book) => {
                  const borrowed = isBookBorrowed(book.id);

                  return (
                    <tr key={book.id} className="lib-row">
                      <td className="lib-title-cell">
                        {book.title}
                      </td>

                      <td className="lib-muted-cell">
                        {book.author}
                      </td>

                      <td className="lib-year-cell">
                        {book.published_year}
                      </td>

                      <td>
                        <span
                          className={
                            borrowed
                              ? "lib-stamp lib-stamp-borrowed"
                              : "lib-stamp lib-stamp-available"
                          }
                        >
                          {borrowed ? "Borrowed" : "Available"}
                        </span>
                      </td>

                      <td className="lib-actions-cell">
                        <button
                          onClick={() => handleEdit(book)}
                          className="lib-btn lib-btn-small"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(book.id)}
                          disabled={borrowed}
                          className="lib-btn lib-btn-small lib-btn-danger"
                        >
                          {borrowed ? "Borrowed" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Book;