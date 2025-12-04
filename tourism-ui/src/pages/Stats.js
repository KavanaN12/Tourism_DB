import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Stats({ user }) {

  const [sqlStats, setSqlStats] = useState([]);
  const [topFavs, setTopFavs] = useState([]);
  const [userStats, setUserStats] = useState({ favourites: 0, reviews: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1️⃣ SQL visitors statistics
        const visitors = await axios.get("http://localhost:5000/api/stats");
        setSqlStats(visitors.data);

        // 2️⃣ SQL top favourites
        const favs = await axios.get("http://localhost:5000/api/top-favourites");
        setTopFavs(favs.data);

        // 3️⃣ Personalized user stats
        if (user) {
          const userRes = await axios.get(`http://localhost:5000/api/user-stats/${user.user_id}`);

          // Firestore reviews owned by user
          const q = query(collection(db, "reviews"), where("userId", "==", user.user_id));
          const snapshot = await getDocs(q);

          const reviewCount = snapshot.size;
          const avgRating = reviewCount > 0
            ? snapshot.docs.reduce((sum, d) => sum + d.data().rating, 0) / reviewCount
            : 0;

          setUserStats({
            favourites: userRes.data.favourites,
            reviews: reviewCount,
            avgRating,
          });
        }

        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }

    loadData();
  }, [user]);

  if (loading) return <p>Loading Statistics...</p>;

  const visitorChart = {
    labels: sqlStats.map(s => s.place_name),
    datasets: [
      {
        label: "Total Visitors",
        data: sqlStats.map(s => s.total_visitors),
        backgroundColor: "#4e73df"
      }
    ]
  };

  return (
    <div>
      <h2>📊 Tourism Analytics Dashboard</h2>

      {/* GLOBAL VISITOR STATS */}
      <section className="mt-4">
        <h4>🌍 Visitor Footfall by Place</h4>
        <Bar data={visitorChart} />

        <table className="table table-bordered mt-4">
          <thead>
            <tr>
              <th>Place Name</th>
              <th>Total Visitors</th>
            </tr>
          </thead>
          <tbody>
            {sqlStats.map((s, i) => (
              <tr key={i}>
                <td>{s.place_name}</td>
                <td>{s.total_visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr />

      {/* TOP FAVOURITED PLACES */}
      <section>
        <h4>⭐ Trending Places (Top Favourited)</h4>
        <ul className="list-group">
          {topFavs.map((item, i) => (
            <li key={i} className="list-group-item">
              {i + 1}. <strong>{item.place_name}</strong> — ❤️ {item.fav_count}
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* USER PERSONAL STATS */}
      {user && (
        <section>
          <h4>👤 Your Activity Insights</h4>
          <ul className="list-group">
            <li className="list-group-item">❤️ Favourites: {userStats.favourites}</li>
            <li className="list-group-item">📝 Reviews Written: {userStats.reviews}</li>
            <li className="list-group-item">⭐ Average Rating You Give: {userStats.avgRating.toFixed(1)}</li>
          </ul>
        </section>
      )}
    </div>
  );
}
