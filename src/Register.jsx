// Register.jsx
import { useState } from "react";
import "./auth.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }

    alert("Registered successfully. Redirecting to login...");
    window.location.href = "/login";
  };

  return (
    <div className="auth-container">
      <div className="auth-card"> {/* changed here */}
        <h1>Register</h1>

        <form className="auth-form" onSubmit={handleRegister}>
          <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input name="confirm" type="password" placeholder="Confirm Password" value={form.confirm} onChange={handleChange} required />

          <button className="auth-btn">Register</button>
        </form>

        <p className="switch-text">
          Already have an account? <a href="/login" className="switch-link">Login</a>
        </p>
      </div>
    </div>
  );
}
