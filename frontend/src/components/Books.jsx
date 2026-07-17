import { useState, useEffect } from "react";
import api from "../api/axios";

function Books() {
  const [books, setBooks] = useState([]);
  const [records, setRecords] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    published_year: "",
  });


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

    const bookData = {
      ...form,
      published_year: Number(form.published_year),
    };


    try {

      if (editingId) {
        await api.put(
          `/books/${editingId}`,
          bookData
        );
      } else {
        await api.post(
          "/books",
          bookData
        );
      }


      resetForm();
      await fetchBooks();


    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Something went wrong"
      );
    }
  };


  const handleEdit = (book) => {

    setForm({
      title: book.title,
      author: book.author,
      published_year: book.published_year,
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
      await fetchBooks();

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to delete book"
      );

    }
  };



  return (
    <div>

      <h2>Books</h2>


      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}



      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "20px",
        }}
      >

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
          style={{
            marginLeft: "10px",
          }}
        />


        <input
          type="number"
          name="published_year"
          placeholder="Published Year"
          value={form.published_year}
          onChange={handleChange}
          required
          style={{
            marginLeft: "10px",
          }}
        />


        <button
          type="submit"
          style={{
            marginLeft: "10px",
          }}
        >
          {editingId ? "Update Book" : "Add Book"}
        </button>


        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              marginLeft: "10px",
            }}
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>



        <tbody>

          {books.length === 0 ? (

            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                }}
              >
                No books found.
              </td>
            </tr>

          ) : (

            books.map((book) => {

              const borrowed = isBookBorrowed(book.id);


              return (

                <tr key={book.id}>

                  <td>{book.title}</td>

                  <td>{book.author}</td>

                  <td>{book.published_year}</td>


                  <td>
                    {borrowed ? "Borrowed" : "Available"}
                  </td>


                  <td>

                    <button
                      onClick={() =>
                        handleEdit(book)
                      }
                    >
                      Edit
                    </button>


                    <button
                      onClick={() =>
                        handleDelete(book.id)
                      }
                      disabled={borrowed}
                      style={{
                        marginLeft: "10px",
                      }}
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
  );
}


export default Books;