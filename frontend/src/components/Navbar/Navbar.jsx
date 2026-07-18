import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Books" },
    { to: "/members", label: "Members" },
    { to: "/borrow", label: "Borrow" },
  ];

  return (
    <nav className="nav-bar">
      <span className="nav-mark">LMS</span>

      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={
              location.pathname === link.to
                ? "nav-link nav-link-active"
                : "nav-link"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;