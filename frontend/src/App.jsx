import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Books from "./components/Books/Books";
import Members from "./components/Members/Members";
import Borrow from "./components/Borrow/Borrow";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Books />} />
          <Route path="/members" element={<Members />} />
          <Route path="/borrow" element={<Borrow />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
