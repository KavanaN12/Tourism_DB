import { Link } from "react-router-dom";
import "./dashboard.css"; // create this file

export default function Dashboard({ user }) {
  return (
    <div className="dashboard-container">
      <h2 className="dash-title">Welcome, {user?.full_name} 👋</h2>

      <div className="dash-grid">
        <Link className="dash-card" to="/">
          🏞 View Places
        </Link>

        <Link className="dash-card" to="/add-place">
          ➕ Add Place
        </Link>

        <Link className="dash-card" to="/reviews">
          📝 Reviews
        </Link>

        <Link className="dash-card" to="/favourites">
          ❤️ My Favourites
        </Link>

        <Link className="dash-card" to="/stats">
          📊 Stats & Insights
        </Link>
      </div>
    </div>
  );
}
