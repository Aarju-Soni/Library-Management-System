import {Link} from "react-router-dom";

function Navbar() {
    return (
        <nav style={{display:"flex", gap:"1rem", padding: "1rem", borderBottom: "1px solid #ccc"}}>
            <Link to="/">Books</Link>
            <Link to="/members">Members</Link>
            <Link to="/borrow">Borrow</Link>
        </nav>
    );
}

export default Navbar;