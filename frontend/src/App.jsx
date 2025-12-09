// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react'; // Import Mesh Hook
import { TransactionService } from './TransactionService'; // Import the Blaze Transaction Service
import { styles } from './styles.js';
import appStyles from './styles/App.module.css';
import WalletConnector from './WalletConnector.jsx';
import NoteForm from './NoteForm.jsx';
import NotesList from './NotesList.jsx';
import Modal from './Modal.jsx';
import EditModal from './EditModal.jsx';
import './App.css';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  // Mesh Wallet Hook - extracting 'name' to access window.cardano directly
  const { connected, wallet, disconnect, name } = useWallet();
  
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

  // --- REAL BLOCKCHAIN TRANSACTIONS ---

  const handleCreateNote = async (noteData) => {
    if (!noteData.title.trim()) {
      showNotification('Please enter a title.');
      return;
    }
    
    // 1. Verify Wallet Connection
    if (!connected || !name) {
      showNotification('Please connect your wallet first!');
      return;
    }

    try {
      setLoading(true);
      showNotification("⏳ Please sign the transaction in your wallet...");

      // 2. Get Raw Wallet API for Blaze (FIXED)
      const walletApi = await window.cardano[name].enable();
      
      // 3. Submit to Blockchain (Blaze)
      const txHash = await TransactionService.submitNote(walletApi, noteData, "CREATE");

      // 4. Send to Backend (Fast Cache)
      showNotification("✅ Transaction sent! Saving to database...");
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': userAddress
        },
        body: JSON.stringify({
          title: noteData.title,
          content: noteData.content,
          color: noteData.color,
          txHash: txHash,
          contentHash: "hash-placeholder" 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add "Pending" note to UI immediately (Optimistic UI)
        setNotes(prev => [data.note, ...prev]);
        showNotification("🎉 Note created successfully! (Pending Confirmation)");
        
        // Reset Form
        setTitle('');
        setContent('');
      } else {
        throw new Error("Backend save failed");
      }

    } catch (err) {
      console.error("Transaction Error:", err);
      showNotification(err.message.includes("User declined") ? "Transaction cancelled" : "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id, newTitle, newContent, tags) => {
      if (!connected || !name) return;

      try {
        setLoading(true);
        showNotification("⏳ Preparing update transaction...");

        // FIX: Get Raw Wallet API
        const walletApi = await window.cardano[name].enable();

        const txHash = await TransactionService.submitNote(
            walletApi, 
            { id, title: newTitle, content: newContent }, 
            "UPDATE"
        );
        
        showNotification("✅ Update submitted to chain: " + txHash.slice(0, 10) + "...");
        
        // Ideally call backend PUT here to update local cache, 
        // for now we just verify the blockchain part works.
        
      } catch (err) {
        console.error(err);
        showNotification("Update failed");
      } finally {
        setLoading(false);
      }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure? This requires a blockchain fee.")) return;
    
    try {
        setLoading(true);
        // FIX: Get Raw Wallet API
        const walletApi = await window.cardano[name].enable();
        
        // Submit DELETE metadata to chain
        const txHash = await TransactionService.submitNote(
            walletApi, 
            { id, title: "Deleted", content: "" }, 
            "DELETE"
        );

        // Delete from local DB
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'x-wallet-address': userAddress }
        });

        setNotes(prev => prev.filter(n => n.id !== id));
        showNotification("🗑️ Note deleted (Tx: " + txHash.slice(0,8) + ")");
    } catch (err) {
        showNotification("Delete failed");
    } finally {
        setLoading(false);
    }
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
          onTogglePin={() => {}} 
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