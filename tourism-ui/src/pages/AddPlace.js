import { useState } from "react";
import axios from "axios";

export default function AddPlace({ user }) {
  const [place_name, setPlaceName] = useState("");
  const [state_id, setStateId] = useState("");
  const [category, setCategory] = useState("");
  const [best_time, setBestTime] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/places", {
        place_name,
        state_id,
        category,
        best_time,
        description,
        added_by: user.email,
      });

      alert("Place added!");
      setPlaceName("");
      setStateId("");
      setCategory("");
      setBestTime("");
      setDescription("");
    } catch (err) {
      alert("Failed to add place: " + err.message);
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
        <input
          className="form-control mb-2"
          placeholder="State ID (e.g., 1)"
          value={state_id}
          onChange={(e) => setStateId(e.target.value)}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="Category (e.g., Heritage, Beach)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="Best Time (e.g., Winter)"
          value={best_time}
          onChange={(e) => setBestTime(e.target.value)}
          required
        />
        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="btn btn-success">Add Place</button>
      </form>
    </div>
  );
}
