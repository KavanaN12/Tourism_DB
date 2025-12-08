import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Places({ user, guestMode = false }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favMessage, setFavMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/places")
      .then((res) => {
        // FIX: Extract array correctly from backend response
        setPlaces(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load places:", err);
        setLoading(false);
      });
  }, []);

  const handleAddFavourite = async (placeId) => {
    if (!user) {
      alert("Login required to add favourites.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/favourites", {
        user_id: user.user_id,
        place_id: placeId,
      });

      setFavMessage("Added to favourites ✔");
      setTimeout(() => setFavMessage(""), 2000);
    } catch (error) {
      alert("Failed to add favourite");
    }
  };

  if (loading) return <p>Loading places...</p>;

  return (
    <>
      <h2>Tourist Places</h2>

      {!user && (
        <div className="mb-3">
          <Link className="btn btn-primary me-2" to="/login">
            Login
          </Link>
          <Link className="btn btn-success" to="/signup">
            Signup
          </Link>
        </div>
      )}

      {favMessage && <p style={{ color: "green" }}>{favMessage}</p>}

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>State</th>
            {!guestMode && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {places.map((p) => (
            <tr key={p.place_id}>
              <td>{p.place_name}</td>
              <td>{p.category || "—"}</td>
              <td>{p.state_name}</td>

              {!guestMode && (
                <td>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleAddFavourite(p.place_id)}
                  >
                    ❤️ Add Favourite
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
