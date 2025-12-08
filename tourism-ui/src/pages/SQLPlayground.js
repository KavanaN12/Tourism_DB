// SQLPlayground.js
import { useState } from "react";
import axios from "axios";

export default function SQLPlayground() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const sampleQueries = [
    {
      title: "List all tourist places with state & category",
      sql: `SELECT tp.place_name, s.state_name, c.name AS category
            FROM tourist_places tp
            JOIN states s ON tp.state_id = s.state_id
            LEFT JOIN categories c ON tp.category_id = c.category_id
            ORDER BY s.state_name;`
    },
    {
      title: "Top 5 most visited places",
      sql: `SELECT tp.place_name,
                   SUM(v.domestic_visitors + v.foreign_visitors) AS total_visitors
            FROM visitor_statistics v
            JOIN tourist_places tp ON tp.place_id = v.place_id
            GROUP BY tp.place_name
            ORDER BY total_visitors DESC
            LIMIT 5;`
    },
    {
      title: "State-wise attraction count",
      sql: `SELECT s.state_name, COUNT(pa.attraction_id) AS attraction_count
            FROM states s
            LEFT JOIN tourist_places tp ON tp.state_id = s.state_id
            LEFT JOIN place_attractions pa ON pa.place_id = tp.place_id
            GROUP BY s.state_name
            ORDER BY attraction_count DESC;`
    },
    {
      title: "List accommodations with pricing",
      sql: `SELECT tp.place_name, a.hotel_name, a.type, a.price_min, a.price_max
            FROM accommodations a
            JOIN tourist_places tp ON tp.place_id = a.place_id
            ORDER BY tp.place_name;`
    }
  ];

  const runQuery = async () => {
    setError("");
    setResult(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/query/run",
        { sql: query },
        { headers: { "x-admin": "true" } } // Use real auth later
      );

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>🧪 SQL Playground</h2>
      <p className="text-muted">Run SELECT queries & view results instantly.</p>

      <div className="mb-3">
        <label className="form-label fw-bold">Sample Queries</label>

        {sampleQueries.map((q, i) => (
          <button
            key={i}
            className="btn btn-outline-primary d-block w-100 mb-2 text-start"
            onClick={() => setQuery(q.sql)}
          >
            {q.title}
          </button>
        ))}
      </div>

      <textarea
        className="form-control mb-3"
        style={{ minHeight: "140px" }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Write your SQL query here..."
      />

      <button className="btn btn-success mb-3" onClick={runQuery}>
        ▶ Run Query
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      {result && (
        <div>
          <h5>Query Output</h5>

          {result.rows.length === 0 ? (
            <p>No rows returned.</p>
          ) : (
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  {Object.keys(result.rows[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
