import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Places from "./pages/Places";
import AddPlace from "./pages/AddPlace";
import Stats from "./pages/Stats";
import Reviews from "./pages/Reviews";

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
        <Link className="navbar-brand" to="/">Tourism DB</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/places">Places</Link>
          <Link className="nav-link" to="/add-place">Add Place</Link>
          <Link className="nav-link" to="/stats">Statistics</Link>
          <Link className="nav-link" to="/reviews">Reviews</Link>

        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/add-place" element={<AddPlace />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/reviews" element={<Reviews />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
