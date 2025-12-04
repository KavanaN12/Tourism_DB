import { useState } from "react";
import axios from "axios";

export default function ProfileSetup({ firebaseUser, onDone }) {
  const [fullName, setFullName] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        firebase_uid: firebaseUser.uid,
        full_name: fullName,
        email: firebaseUser.email
      });

      onDone(res.data);
    } catch(err) {
      alert("Error saving profile: " + err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3>Complete Your Profile</h3>
      <form onSubmit={handleSave}>
        <input
          className="form-control mb-3"
          type="email"
          value={firebaseUser.email}
          disabled
        />
        <input
          className="form-control mb-3"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100">Save Profile</button>
      </form>
    </div>
  );
}
