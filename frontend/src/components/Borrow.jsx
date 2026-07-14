import { useState, useEffect } from "react";
import api from "../api/axios";

function Borrow() {
  const [records, setRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const [recordsRes, booksRes, membersRes] = await Promise.all([
        api.get("/borrow"),
        api.get("/books"),
        api.get("/members"),
      ]);

      setRecords(recordsRes.data);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedBook || !selectedMember) {
      setError("Please select both a book and a member");
      return;
    }

    try {
      await api.post("/borrow", {
        book_id: parseInt(selectedBook),
        member_id: parseInt(selectedMember),
      });

      setSelectedBook("");
      setSelectedMember("");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to borrow book");
    }
  };

  const handleReturn = async (recordId) => {
    setError("");

    try {
      await api.put(`/borrow/${recordId}/return`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to return book");
    }
  };

  // Helper lookups since /borrow only returns book_id / member_id, not names
  const getBookTitle = (id) =>
    books.find((b) => b.id === id)?.title || `#${id}`;

  const getMemberName = (id) =>
    members.find((m) => m.id === id)?.name || `#${id}`;

  const availableBooks = books.filter((b) => b.available);

  return (
    <div>
      <h2>Borrow / Return</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleBorrow} style={{ marginBottom: "1.5rem" }}>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          <option value="">Select Book</option>

          {availableBooks.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} — {book.author}
            </option>
          ))}
        </select>

        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="">Select Member</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <button type="submit" style={{ marginLeft: "0.5rem" }}>
          Borrow
        </button>
      </form>

      <h3>Borrow Records</h3>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Book</th>
            <th>Member</th>
            <th>Borrow Date</th>
            <th>Return Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{getBookTitle(record.book_id)}</td>
              <td>{getMemberName(record.member_id)}</td>

              <td>
                {new Date(record.borrow_date).toLocaleString()}
              </td>

              <td>
                {record.return_date
                  ? new Date(record.return_date).toLocaleString()
                  : "Not returned"}
              </td>

              <td>
                {!record.return_date && (
                  <button onClick={() => handleReturn(record.id)}>
                    Return
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Borrow;