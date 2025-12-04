import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

  const labels = stats.map((s) => s.place_name);
  const values = stats.map((s) => s.total_visitors);

  const data = {
    labels,
    datasets: [
      {
        label: "Total Visitors",
        data: values,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div>
      <h2>Visitor Statistics (SQL)</h2>

      {stats.length === 0 ? (
        <p className="mt-3">Loading stats...</p>
      ) : (
        <>
          <Bar data={data} options={options} />
          <table className="table table-bordered mt-4">
            <thead>
              <tr>
                <th>Place</th>
                <th>Total Visitors</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, index) => (
                <tr key={index}>
                  <td>{s.place_name}</td>
                  <td>{s.total_visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
