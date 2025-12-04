import { useState } from "react";
import axios from "axios";

export default function AddPlace() {
  const [place_name, setName] = useState("");

  const submitForm = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/api/places", { place_name })
      .then(() => alert("Place added!"))
      .catch(err => console.log(err));
  };

  return (
    <form className="mt-4" onSubmit={submitForm}>
      <label className="form-label">Place Name</label>
      <input type="text" className="form-control"
        value={place_name} onChange={e => setName(e.target.value)} required />
      <button className="btn btn-primary mt-3">Add</button>
    </form>
  );
}
