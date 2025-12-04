import { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Signup({ email, firebaseUid, onProfileCreated, onlyProfile = false }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [localEmail, setLocalEmail] = useState(email || "");
  const [password, setPassword] = useState("");

  /* --------------------- FULL SIGNUP (Firebase + SQL) --------------------- */
  const handleFullSignup = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, localEmail, password);

      const res = await axios.post("http://localhost:5000/api/register", {
        firebase_uid: cred.user.uid,
        full_name: fullName,
        email: localEmail,
      });

      if (onProfileCreated) onProfileCreated(res.data);

      alert("Signup successful!");
      navigate("/"); // Go to homepage after success
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("Account already exists — redirecting to login.");
        navigate("/login");
      } else {
        alert("Signup failed: " + err.message);
      }
    }
  };

  /* --------------------- SQL ONLY (After Login) ----------------------- */
  const handleProfileOnly = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        firebase_uid: firebaseUid,
        full_name: fullName,
        email: localEmail,
      });

      if (onProfileCreated) onProfileCreated(res.data);

      alert("Profile saved!");
      navigate("/"); // go home after saving profile
    } catch (err) {
      alert("Profile creation failed: " + err.message);
    }
  };

  /* ------------------------- VIEW RENDERING --------------------------- */

  // This runs when the user already logged in Firebase but SQL missing → profile only mode
  if (onlyProfile) {
    return (
      <div className="container mt-4" style={{ maxWidth: "400px" }}>
        <h3>Complete Your Profile</h3>
        <p className="text-muted">Your login exists — now store name in SQL.</p>

        <form onSubmit={handleProfileOnly}>
          <input className="form-control mb-2" type="email" value={localEmail} disabled />
          <input
            className="form-control mb-3"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <button className="btn btn-success w-100">Save Profile</button>
        </form>
      </div>
    );
  }

  /* --------------------- FULL SIGNUP UI --------------------- */
  return (
    <div className="container mt-4" style={{ maxWidth: "400px" }}>
      <h3>Signup</h3>

      <form onSubmit={handleFullSignup}>
        <input
          className="form-control mb-2"
          type="email"
          placeholder="Email"
          value={localEmail}
          onChange={(e) => setLocalEmail(e.target.value)}
          required
        />

        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="form-control mb-3"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <button className="btn btn-success w-100">Create Account</button>
      </form>
    </div>
  );
}
