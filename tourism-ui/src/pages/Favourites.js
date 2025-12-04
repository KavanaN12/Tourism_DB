import { useEffect, useState } from "react";
import axios from "axios";

export default function Favourites({ user }) {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return; // prevents error before user loads

    axios
      .get(`http://localhost:5000/api/favourites/${user.user_id}`)
      .then((res) => {
        setFavourites(res.data);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, [user]);

  // Prevent view if not logged in
  if (!user) {
    return <p className="text-danger">⚠ Please login to view your favourite places.</p>;
  }

  if (loading) return <p>Loading your favourites...</p>;

  return (
    <div>
      <h2>My Favourite Places ❤️</h2>

      {favourites.length === 0 ? (
        <p className="mt-3 text-muted">You have no favourite places yet.</p>
      ) : (
        <ul className="list-group mt-3">
          {favourites.map((f, index) => (
            <li key={index} className="list-group-item">
              <strong>{f.place_name}</strong> — {f.category} ({f.best_time})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
