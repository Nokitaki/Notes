// Login.jsx
import { useState } from "react";
import "./auth.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email && password) {
      localStorage.setItem("user", JSON.stringify({ email }));
      onLogin(true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card"> {/* changed here */}
        <h1>Login</h1>

        <form className="auth-form" onSubmit={handleLogin}>
          <input 
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button className="auth-btn">Login</button>
        </form>

        <p className="switch-text">
          Don't have an account? <a href="/register" className="switch-link">Register</a>
        </p>
      </div>
    </div>
  );
}
