// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react'; // Import Mesh Hook
import { styles } from './styles.js';
import appStyles from './styles/App.module.css';
import WalletConnector from './WalletConnector.jsx'; // Use new Connector
import NoteForm from './NoteForm.jsx';
import NotesList from './NotesList.jsx';
import Modal from './Modal.jsx';
import EditModal from './EditModal.jsx';
import './App.css';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  // Mesh Wallet Hook
  const { connected, wallet, disconnect } = useWallet();
  
  // App State
  const [userAddress, setUserAddress] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  
  // Modals
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 1. Handle Wallet Connection & Auth
  useEffect(() => {
    const syncWallet = async () => {
      if (connected && wallet) {
        try {
          setLoading(true);
          // Get the user's change address (starts with addr_test...)
          const address = await wallet.getChangeAddress();
          setUserAddress(address);
          
          // Fetch their notes immediately
          await fetchNotes(address);
        } catch (error) {
          console.error("Wallet Sync Error:", error);
          showNotification("Failed to sync wallet");
        } finally {
          setLoading(false);
        }
      } else {
        // Reset state if disconnected
        setUserAddress(null);
        setNotes([]);
      }
    };

    syncWallet();
  }, [connected, wallet]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  // 2. Fetch Notes (Using Wallet Address Header)
  const fetchNotes = async (address) => {
    if (!address) return;

    try {
      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address // New Auth Header
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  // --- Placeholders for Step 3 (Transaction Logic) ---
  // We will fill these with real blockchain logic in the next step
  
  const handleCreateNote = async (noteData) => {
    alert("Step 3: We will implement Blockchain Transaction here next!");
    // logic will go here
  };

  const handleUpdateNote = async (id, newTitle, newContent) => {
    alert("Step 3: Update logic with Blockchain will go here!");
  };

  const handleDeleteNote = async (id) => {
    alert("Step 3: Delete logic with Blockchain will go here!");
  };

  // --- Modal Handlers ---
  const handleCardClick = (note) => { setSelectedNote(note); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedNote(null); };
  const handleEditClick = (note) => { setEditNote(note); setIsEditModalOpen(true); setEditingId(null); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditNote(null); };

  // --- Render ---
  
  // If not connected, show the Wallet Button
  if (!connected) {
    return <WalletConnector onConnect={() => console.log("Connecting...")} />;
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {notification && <div className={appStyles.notification}>{notification}</div>}

      {/* Header */}
      <div className={appStyles.header}>
        <div className={appStyles.userInfo}>
          <span className={appStyles.username}>
            👤 {userAddress ? `${userAddress.slice(0, 10)}...${userAddress.slice(-6)}` : 'Loading...'}
          </span>
          <span className={appStyles.balance}>
            🟢 Connected
          </span>
        </div>
        <button onClick={() => disconnect()} className={appStyles.logoutButton}>
          Disconnect
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.container}>
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
          onEdit={handleEditClick}
          onDelete={handleDeleteNote}
          onCardClick={handleCardClick}
          onTogglePin={() => {}} // Pin logic local only
        />
      </div>
      
      {/* Modals */}
      <Modal note={selectedNote} isOpen={isModalOpen} onClose={handleCloseModal} />
      <EditModal 
        note={editNote} 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        onUpdate={handleUpdateNote} 
      />
    </div>
  );
}

export default App;