import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Do NOT manually redirect to "/", App.js handles it.
      alert("Login successful!");

    } catch (err) {
      if (err.code === "auth/user-not-found") {
        alert("Account not found — redirecting to signup.");
        navigate("/signup");
      } else if (err.code === "auth/wrong-password") {
        alert("Incorrect password. Try again.");
      } else {
        alert("Login failed: " + err.message);
      }
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "400px" }}>
      <h3>Login</h3>

      <form onSubmit={handleLogin}>
        <input
          className="form-control mb-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
