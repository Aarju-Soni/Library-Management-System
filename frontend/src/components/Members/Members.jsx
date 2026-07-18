import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Members.css";

const AVATAR_COLORS = [
  "#1E4034",
  "#7A5C1E",
  "#5B3A29",
  "#2F4858",
  "#6B3F3F",
  "#3D5A3D",
];

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

function getAvatarColor(name) {
  const sum = name
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function Members() {
  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((error) => error.msg).join(", ");
    }

    return detail || "Something went wrong";
  };

  const fetchMembers = async () => {
    try {
      setError("");

      const res = await api.get("/members");
      setMembers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load members");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
    });

    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, form);
      } else {
        await api.post("/members", form);
      }

      resetForm();
      await fetchMembers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name,
      email: member.email,
    });

    setEditingId(member.id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member?")) {
      return;
    }

    try {
      await api.delete(`/members/${id}`);
      await fetchMembers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mem-page">
      <div className="mem-ledger">
        <header className="mem-header">
          <span className="mem-eyebrow">
            Membership Ledger
          </span>

          <h2 className="mem-title">
            Members
          </h2>
        </header>

        {error && <p className="mem-error">{error}</p>}

        <form onSubmit={handleSubmit} className="mem-form">
          <div className="mem-field">
            <input
              id="mem-name"
              name="name"
              placeholder=" "
              value={form.name}
              onChange={handleChange}
              required
              className="mem-input"
            />

            <label
              htmlFor="mem-name"
              className="mem-floating-label"
            >
              Full name
            </label>
          </div>

          <div className="mem-field">
            <input
              id="mem-email"
              name="email"
              type="email"
              placeholder=" "
              value={form.email}
              onChange={handleChange}
              required
              className="mem-input"
            />

            <label
              htmlFor="mem-email"
              className="mem-floating-label"
            >
              Email
            </label>
          </div>

          <div className="mem-form-actions">
            <button
              type="submit"
              className="mem-btn mem-btn-primary"
            >
              {editingId ? "Update member" : "Enroll member"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="mem-btn mem-btn-ghost"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mem-table-wrap">
          <table className="mem-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Joined</th>
                <th className="mem-th-actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="4" className="mem-empty">
                    No entries yet — enroll the first member above.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="mem-row">
                    <td>
                      <div className="mem-identity">
                        <span
                          className="mem-avatar"
                          style={{
                            background: getAvatarColor(
                              member.name
                            ),
                          }}
                        >
                          {getInitials(member.name)}
                        </span>

                        <span className="mem-name">
                          {member.name}
                        </span>
                      </div>
                    </td>

                    <td className="mem-email-cell">
                      {member.email}
                    </td>

                    <td className="mem-date-cell">
                      {new Date(
                        member.joined_date
                      ).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>

                    <td className="mem-actions-cell">
                      <button
                        onClick={() => handleEdit(member)}
                        className="mem-btn mem-btn-small"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(member.id)}
                        className="mem-btn mem-btn-small mem-btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Members;