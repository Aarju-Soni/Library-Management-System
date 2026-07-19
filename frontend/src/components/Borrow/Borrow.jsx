import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Borrow.css";
import Swal from "sweetalert2";

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

  const [year, month, day, hour, minute, second] =
    date.split(/[-T:]/);

  const localDate = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  );

  return localDate.toLocaleString("en-IN", {
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

      const [
        recordsRes,
        booksRes,
        membersRes,
      ] = await Promise.all([
        api.get("/borrow"),
        api.get("/books"),
        api.get("/members"),
      ]);


      const sortedRecords = [...recordsRes.data].sort(
        (a, b) => b.id - a.id
      );


      setRecords(sortedRecords);
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
      setError(
        "Please select a book and a member"
      );
      return;
    }


    const result = await Swal.fire({
      title: "Confirm checkout?",
      text: "This book will be marked as borrowed.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Checkout",
      confirmButtonColor: "#2d5f6b",
    });


    if (!result.isConfirmed) return;


    try {

      await api.post("/borrow", {
        book_id: Number(selectedBook),
        member_id: Number(selectedMember),
      });


      setSelectedBook("");
      setSelectedMember("");


      Swal.fire({
        icon: "success",
        title: "Book checked out",
        text: "Borrow record created successfully.",
      });


      await fetchAll();


    } catch (err) {

      setError(getErrorMessage(err));

    }
  };



  const handleReturn = async (recordId) => {


    const result = await Swal.fire({
      title: "Return book?",
      text: "Confirm that this book has been returned.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Return",
      confirmButtonColor: "#2d5f6b",
    });


    if (!result.isConfirmed) return;



    try {

      await api.put(
        `/borrow/${recordId}/return`
      );


      Swal.fire({
        icon: "success",
        title: "Book returned",
        text: "The return has been recorded.",
      });


      await fetchAll();


    } catch (err) {

      setError(getErrorMessage(err));

    }
  };



  const getBookTitle = (id) =>
    books.find(
      (book) => book.id === id
    )?.title || `Book #${id}`;



  const getMemberName = (id) =>
    members.find(
      (member) => member.id === id
    )?.name || `Member #${id}`;



  const availableBooks = books.filter(
    (book) => {

      const borrowed = records.some(
        (record) =>
          record.book_id === book.id &&
          !record.return_date
      );

      return !borrowed;

    }
  );



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


          {error && (
            <p className="brw-error">
              {error}
            </p>
          )}


          <form
            onSubmit={handleBorrow}
            className="brw-form"
          >

            <div className="brw-field">

              <label className="brw-label">
                Book
              </label>


              <select
                value={selectedBook}
                onChange={(e)=>setSelectedBook(e.target.value)}
                className="brw-select"
              >

                <option value="">
                  Select a book
                </option>


                {availableBooks.map((book)=>(
                  <option
                    key={book.id}
                    value={book.id}
                  >
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
                onChange={(e)=>setSelectedMember(e.target.value)}
                className="brw-select"
              >

                <option value="">
                  Select a member
                </option>


                {members.map((member)=>(
                  <option
                    key={member.id}
                    value={member.id}
                  >
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

                    <td
                      colSpan="5"
                      className="brw-empty"
                    >
                      No records yet — check out a book to start the log.
                    </td>

                  </tr>

                ) : (

                  records.map((record)=>{

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

                          {active && (

                            <button
                              onClick={() =>
                                handleReturn(record.id)
                              }
                              className="brw-btn brw-btn-small brw-btn-return"
                            >
                              Return
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