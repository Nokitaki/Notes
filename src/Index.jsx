import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true); // Switch between login and register form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle form submission (login or register)
  async function submit() {
    try {
      const url = isLogin
        ? "http://localhost:4000/api/auth/login"
        : "http://localhost:4000/api/auth/signup";  // Choose URL based on login/register

      const res = await axios.post(url, { email, password });
      localStorage.setItem("token", res.data.token);  // Store the JWT token in localStorage

      alert(isLogin ? "Login successful!" : "Registration successful!");
      window.location.href = "/dashboard";  // Redirect to the dashboard page after success
    } catch (err) {
      alert("Failed. Check your details.");
      console.error(err);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-box">
        <h1>{isLogin ? "Login" : "Register"}</h1>

        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Submit button */}
        <button onClick={submit}>
          {isLogin ? "Login" : "Register"}
        </button>

        {/* Toggle between login and register forms */}
        <p onClick={() => setIsLogin(!isLogin)} className="toggle">
          {isLogin ? "Create an account" : "Already have an account?"}
        </p>
      </div>
    </main>
  );
}
