import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Pages
import Places from "./pages/Places";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddPlace from "./pages/AddPlace";
import Reviews from "./pages/Reviews";
import Favourites from "./pages/Favourites";
import Stats from "./pages/Stats";
import SQLPlayground from "./pages/SQLPlayground";
import NoSQLPlayground from "./pages/NoSQLPlayground";

function AppContent() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [sqlUser, setSqlUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setSqlUser(null);
        setAuthChecking(false);
        navigate("/");
        return;
      }

      try {
        // 🔹 Check if SQL profile exists
        const res = await axios.get(
          `http://localhost:5000/api/users/by-uid/${user.uid}`
        );

        setSqlUser(res.data);
        navigate("/dashboard");

      } catch (err) {
        navigate("/profile-setup");
      }

      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setSqlUser(null);
    navigate("/");
  };

  if (authChecking) return <p className="text-center mt-4">Checking session...</p>;

  return (
    <>
      {/* ---------- NAVBAR ---------- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <Link className="navbar-brand" to="/">
          TourismApp
        </Link>

        <div className="ms-auto">
          {!firebaseUser ? (
            <>
              <Link className="btn btn-primary me-2" to="/login">
                Login
              </Link>
              <Link className="btn btn-success" to="/signup">
                Signup
              </Link>
            </>
          ) : (
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* ---------- ROUTES ---------- */}
      <div className="container mt-4">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Places user={sqlUser} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* SQL profile setup (only after Firebase login) */}
          <Route
            path="/profile-setup"
            element={
              <Signup
                onlyProfile={true}
                email={firebaseUser?.email}
                firebaseUid={firebaseUser?.uid}
                onProfileCreated={(u) => {
                  setSqlUser(u);
                  navigate("/dashboard");
                }}
              />
            }
          />

          {/* User Pages */}
          <Route path="/dashboard" element={<Dashboard user={sqlUser} />} />
          <Route path="/add-place" element={<AddPlace user={sqlUser} />} />
          <Route path="/reviews" element={<Reviews user={sqlUser} />} />
          <Route path="/favourites" element={<Favourites user={sqlUser} />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/sql-playground" element={<SQLPlayground />} />
          <Route path="/nosql-playground" element={<NoSQLPlayground />} />

        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
