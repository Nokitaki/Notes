import { useEffect, useState } from "react";
import axios from "axios";
import WalletConnect from "../components/WalletConnect";
import NoteForm from "../components/NoteForm";
import NotesList from "../components/NotesList";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff"); // Default color for the note

  // Load the user's notes from the backend
  async function loadNotes() {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:4000/api/notes",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotes(res.data);
  }

  // Create a new note and send it to the backend
  async function createNote() {
    if (!title || !content) {
      alert("Please fill in both title and content.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:4000/api/notes",
        { title, content, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // After note creation, reset the form and refresh notes list
      setTitle("");
      setContent("");
      setColor("#ffffff");
      loadNotes();

      alert("Note created successfully! You earned ADA.");
    } catch (err) {
      console.error(err);
      alert("Error creating note. Please try again.");
    }
  }

  // Fetch notes when the component mounts
  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <main className="dashboard">
      <h1>Your Notes Dashboard</h1>

      {/* WalletConnect allows the user to connect their wallet */}
      <WalletConnect />

      {/* Pass your existing NoteForm component with necessary props */}
      <NoteForm
        title={title}
        content={content}
        color={color}
        setTitle={setTitle}
        setContent={setContent}
        setColor={setColor}
        onCreateNote={createNote}
      />

      {/* Display the list of notes */}
      <NotesList notes={notes} />
    </main>
  );
}
