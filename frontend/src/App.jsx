import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Books from "./components/Books"
import Members from "./components/Members"
import Borrow from "./components/Borrow"

function App() {

  return (
    <BrowserRouter>
      <Navbar/>
      <div style={{padding: "1rem"}}>
        <Routes>
          <Route path="/" element={<Books/>}/>
          <Route path="/members" element={<Members/>}/>
          <Route path="/borrow" element={<Borrow/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
