// NoSQLPlayground.js
import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";

export default function NoSQLPlayground() {
  const [results, setResults] = useState([]);
  const [placeFilter, setPlaceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState(4);
  const [message, setMessage] = useState("");

  const runPlaceFilter = async () => {
    const q = query(
      collection(db, "reviews"),
      where("placeName", "==", placeFilter)
    );

    const snap = await getDocs(q);
    setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const runRatingFilter = async () => {
    const q = query(
      collection(db, "reviews"),
      where("rating", ">=", Number(ratingFilter))
    );

    const snap = await getDocs(q);
    setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addAttraction = async () => {
    try {
      await updateDoc(doc(db, "tourist_places", "samplePlaceId"), {
        attractions: arrayUnion("New Auto-Generated Attraction"),
      });
      setMessage("Attraction added using arrayUnion()!");
    } catch (err) {
      setMessage("Failed: Ensure 'tourist_places/samplePlaceId' exists.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>🧪 Firestore NoSQL Playground</h2>
      <p className="text-muted">Test live Firestore queries & updates.</p>

      <h5 className="mt-4">1️⃣ Filter Reviews by Place</h5>
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="e.g., Hampi"
          value={placeFilter}
          onChange={(e) => setPlaceFilter(e.target.value)}
        />
        <button className="btn btn-primary" onClick={runPlaceFilter}>
          Filter
        </button>
      </div>

      <h5 className="mt-4">2️⃣ Get Reviews with Rating ≥ X</h5>
      <div className="d-flex gap-2 mb-3">
        <input
          type="number"
          min="1"
          max="5"
          className="form-control"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        />
        <button className="btn btn-warning" onClick={runRatingFilter}>
          Run
        </button>
      </div>

      <h5 className="mt-4">3️⃣ Demonstrate arrayUnion()</h5>
      <button className="btn btn-success mb-3" onClick={addAttraction}>
        ➕ Add Attraction to a Place
      </button>

      {message && <div className="alert alert-info">{message}</div>}

      <h5 className="mt-4">Query Output</h5>
      {results.length === 0 ? (
        <p className="text-muted">No results yet.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              {Object.keys(results[0]).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                {Object.values(r).map((v, i) => (
                  <td key={i}>{String(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
