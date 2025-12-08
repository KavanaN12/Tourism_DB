import { useState, useEffect } from "react";
import axios from "axios";

export default function AddPlace({ user }) {
  const [place_name, setPlaceName] = useState("");
  const [stateId, setStateId] = useState("");
  const [states, setStates] = useState([]);
  const [category, setCategory] = useState("");
  const [best_time, setBestTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = true; // You can replace with user?.is_admin when implemented

  useEffect(() => {
    axios.get("http://localhost:5000/api/states").then((res) => {
      setStates(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      alert("Admin only");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/places", {
        place_name,
        state_id: stateId,
        category,
        best_time,
        description,
        added_by: user?.email || null
      });

      alert("Place added!");

      setPlaceName("");
      setStateId("");
      setCategory("");
      setBestTime("");
      setDescription("");

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3>Add New Tourist Place</h3>

      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          placeholder="Place Name"
          value={place_name}
          onChange={(e) => setPlaceName(e.target.value)}
          required
        />

        <select
          className="form-control mb-2"
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
          required
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.state_id} value={s.state_id}>
              {s.state_name}
            </option>
          ))}
        </select>

        <input
          className="form-control mb-2"
          placeholder="Category (e.g. Heritage)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Best Time (e.g. October - March)"
          value={best_time}
          onChange={(e) => setBestTime(e.target.value)}
        />

        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="btn btn-success" disabled={loading}>
          {loading ? "Adding..." : "Add Place"}
        </button>
      </form>
    </div>
  );
}
