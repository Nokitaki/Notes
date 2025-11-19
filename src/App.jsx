import { useState, useEffect } from "react";
import { styles } from "./styles.js";
import NoteForm from "./NoteForm.jsx";
import NotesList from "./NotesList.jsx";
import Modal from "./Modal.jsx";
import EditModal from "./EditModal.jsx";
import "./App.css";

const API_URL = "http://localhost:5000/api/notes";

function App() {
  // ---------------- AUTH STATE ----------------
  const [user, setUser] = useState(() => {
    return localStorage.getItem("user") || null;
  });

  const [authView, setAuthView] = useState("login"); // login | register

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    localStorage.setItem("user", loginEmail);
    setUser(loginEmail);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!regName || !regEmail || !regPassword || !regConfirm) {
      alert("All fields required.");
      return;
    }
    if (regPassword !== regConfirm) {
      alert("Passwords do not match!");
      return;
    }

    alert("Registration successful! Please login.");
    setAuthView("login");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // ---------------- NOTES LOGIC (YOUR CODE) ----------------
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError("Failed to fetch notes. Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    try {
      const newNote = { title, content, color };
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });

      const created = await response.json();
      setNotes((prev) => [created, ...prev]);
      setTitle("");
      setContent("");
      setColor("#ffffff");
    } catch (err) {
      alert("Failed to create note.");
    }
  };

  // ---------------- AUTH SCREENS ----------------

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">

          {authView === "login" ? (
            <>
              <h2>Login</h2>
              <form className="auth-form" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button className="auth-btn">Login</button>
              </form>
              <p className="switch-text">
                Don't have an account?{" "}
                <span onClick={() => setAuthView("register")}>Register</span>
              </p>
            </>
          ) : (
            <>
              <h2>Register</h2>
              <form className="auth-form" onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />
                <button className="auth-btn">Register</button>
              </form>
              <p className="switch-text">
                Already have an account?{" "}
                <span onClick={() => setAuthView("login")}>Login</span>
              </p>
            </>
          )}

        </div>
      </div>
    );
  }

  // ---------------- NOTES PAGE ----------------
  return (
    <>
      <div style={styles.container}>
        <button
          onClick={handleLogout}
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            padding: "8px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>

        <NoteForm
          title={title}
          content={content}
          color={color}
          setTitle={setTitle}
          setContent={setContent}
          setColor={setColor}
          onCreateNote={handleCreateNote}
        />

        <NotesList
          notes={notes}
          onEdit={(note) => setEditNote(note)}
          onDelete={() => {}}
          onCardClick={(note) => {
            setSelectedNote(note);
            setIsModalOpen(true);
          }}
        />
      </div>

      <Modal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditModal
        note={editNote}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={() => {}}
      />
    </>
  );
}

export default App;
