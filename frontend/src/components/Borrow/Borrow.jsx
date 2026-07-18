import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Borrow.css";

function Borrow() {
  const [records, setRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedBook, setSelectedBook] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  const [error, setError] = useState("");

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((error) => error.msg).join(", ");
    }

    return detail || "Something went wrong";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const fetchAll = async () => {
    try {
      setError("");

      const [recordsRes, booksRes, membersRes] =
        await Promise.all([
          api.get("/borrow"),
          api.get("/books"),
          api.get("/members"),
        ]);

      setRecords(recordsRes.data);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
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
        book_id: Number(selectedBook),
        member_id: Number(selectedMember),
      });

      setSelectedBook("");
      setSelectedMember("");

      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleReturn = async (recordId) => {
    setError("");

    try {
      await api.put(`/borrow/${recordId}/return`);
      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Delete this borrow record?")) {
      return;
    }

    setError("");

    try {
      await api.delete(`/borrow/${recordId}`);
      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getBookTitle = (id) =>
    books.find((book) => book.id === id)?.title ||
    `Book #${id}`;

  const getMemberName = (id) =>
    members.find((member) => member.id === id)?.name ||
    `Member #${id}`;

  const availableBooks = books.filter((book) => {
    const borrowed = records.some(
      (record) =>
        record.book_id === book.id &&
        !record.return_date
    );

    return !borrowed;
  });

  return (
    <div className="brw-page">
      <div className="brw-layout">
        <section className="brw-ticket">
          <div className="brw-ticket-notch brw-ticket-notch-top" />

          <span className="brw-eyebrow">
            Circulation Desk
          </span>

          <h2 className="brw-title">
            New checkout
          </h2>

          {error && <p className="brw-error">{error}</p>}

          <form onSubmit={handleBorrow} className="brw-form">
            <div className="brw-field">
              <label className="brw-label">
                Book
              </label>

              <select
                value={selectedBook}
                onChange={(e) =>
                  setSelectedBook(e.target.value)
                }
                className="brw-select"
              >
                <option value="">
                  Select a book
                </option>

                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} — {book.author}
                  </option>
                ))}
              </select>
            </div>

            <div className="brw-field">
              <label className="brw-label">
                Member
              </label>

              <select
                value={selectedMember}
                onChange={(e) =>
                  setSelectedMember(e.target.value)
                }
                className="brw-select"
              >
                <option value="">
                  Select a member
                </option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="brw-btn brw-btn-primary"
              disabled={
                availableBooks.length === 0 ||
                members.length === 0
              }
            >
              Check out
            </button>
          </form>

          <div className="brw-ticket-notch brw-ticket-notch-bottom" />
        </section>

        <section className="brw-log">
          <header className="brw-log-header">
            <h3 className="brw-log-title">
              Borrow records
            </h3>

            <span className="brw-log-count">
              {records.length} total
            </span>
          </header>

          <div className="brw-table-wrap">
            <table className="brw-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Borrowed</th>
                  <th>Returned</th>
                  <th className="brw-th-actions">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="brw-empty">
                      No records yet — check out a book to start the log.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const active = !record.return_date;

                    return (
                      <tr
                        key={record.id}
                        className={
                          active
                            ? "brw-row brw-row-active"
                            : "brw-row"
                        }
                      >
                        <td className="brw-title-cell">
                          {getBookTitle(record.book_id)}
                        </td>

                        <td>
                          {getMemberName(record.member_id)}
                        </td>

                        <td className="brw-date-cell">
                          {formatDate(record.borrow_date)}
                        </td>

                        <td className="brw-date-cell">
                          {active ? (
                            <span className="brw-live">
                              <span className="brw-live-dot" />
                              Not returned
                            </span>
                          ) : (
                            formatDate(record.return_date)
                          )}
                        </td>

                        <td className="brw-actions-cell">
                          {active ? (
                            <button
                              onClick={() =>
                                handleReturn(record.id)
                              }
                              className="brw-btn brw-btn-small brw-btn-return"
                            >
                              Return
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleDelete(record.id)
                              }
                              className="brw-btn brw-btn-small brw-btn-danger"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Borrow;