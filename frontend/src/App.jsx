// frontend/src/App.jsx
import { useState, useEffect } from "react";
import { useWallet, CardanoWallet } from "@meshsdk/react"; // Added CardanoWallet import
import { TransactionService } from "./TransactionService";
import { styles } from "./styles.js";
import appStyles from "./styles/App.module.css";
// import WalletConnector from "./WalletConnector.jsx"; // No longer needed as a full page
import NoteForm from "./NoteForm.jsx";
import NotesList from "./NotesList.jsx";
import Modal from "./Modal.jsx";
import EditModal from "./EditModal.jsx";
import "./App.css";

const API_URL = "http://localhost:5002/api/notes";

function App() {
  const { connected, wallet, disconnect, name } = useWallet();

  // App State
  const [userAddress, setUserAddress] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form & Modal State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Initial Wallet Sync (Runs once on connect)
  useEffect(() => {
    let isMounted = true;

    const syncWallet = async () => {
      if (connected && wallet) {
        try {
          setLoading(true);
          
          // Get Stake Address (User ID)
          const rewardAddresses = await wallet.getRewardAddresses();
          const stakeAddress = rewardAddresses[0]; 
          
          if (isMounted) {
            console.log("🔑 Logged in as:", stakeAddress);
            setUserAddress(stakeAddress);
            await fetchNotes(stakeAddress);
          }
        } catch (error) {
          console.error("Wallet Sync Error:", error);
          if (isMounted) showNotification("Failed to sync wallet");
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) {
          setUserAddress(null);
          setNotes([]);
        }
      }
    };

    syncWallet();

    return () => { isMounted = false; };
  }, [connected, wallet]);

  // 2. Fetch Notes Helper
  const fetchNotes = async (address) => {
    if (!address) return;

    try {
      const response = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": address,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // 3. Real-time Polling
  useEffect(() => {
    if (!userAddress) return;
    const interval = setInterval(() => {
      fetchNotes(userAddress);
    }, 10000);
    return () => clearInterval(interval);
  }, [userAddress]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  // --- TRANSACTIONS (Unchanged) ---
  const handleCreateNote = async (noteData) => {
    if (!noteData.title.trim()) { showNotification("Please enter a title."); return; }
    if (!connected || !name) { showNotification("Please connect your wallet first!"); return; }

    try {
      setLoading(true);
      showNotification("⏳ Please sign the transaction...");
      const walletApi = await window.cardano[name].enable();
      const txHash = await TransactionService.submitNote(walletApi, noteData, "CREATE");
      
      showNotification("✅ Transaction sent! Saving...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-wallet-address": userAddress },
        body: JSON.stringify({
          title: noteData.title, content: noteData.content, color: noteData.color,
          txHash: txHash, contentHash: "hash-placeholder",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes((prev) => [data.note, ...prev]);
        showNotification("🎉 Note created! (Pending Confirmation)");
        setTitle(""); setContent("");
      }
    } catch (err) {
      console.error("Transaction Error:", err);
      showNotification("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id, newTitle, newContent) => {
    if (!connected || !name) return;
    try {
      setLoading(true);
      showNotification("⏳ Preparing update...");
      const walletApi = await window.cardano[name].enable();
      const txHash = await TransactionService.submitNote(walletApi, { id, title: newTitle, content: newContent }, "UPDATE");
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': userAddress },
        body: JSON.stringify({ title: newTitle, content: newContent, txHash: txHash, contentHash: "hash-placeholder" })
      });

      if (response.ok) {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, title: newTitle, content: newContent, status: 'Pending Update' } : n));
        showNotification("🔄 Updating...");
      }
    } catch (err) {
      if (err.message && (err.message.includes("BadInputs") || err.message.includes("UTxO"))) {
         showNotification("⚠️ Wallet Busy: Please wait 20s.");
      } else { showNotification("Update failed"); }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure? This costs ADA.")) return;
    try {
      setLoading(true);
      const walletApi = await window.cardano[name].enable();
      const txHash = await TransactionService.submitNote(walletApi, { id, title: "Deleted", content: "" }, "DELETE");
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-wallet-address": userAddress },
        body: JSON.stringify({ txHash })
      });

      if (response.ok) {
        setNotes((prev) => prev.map((n) => n.id === id ? { ...n, status: 'Pending Delete' } : n));
        showNotification("🗑️ Deleting...");
      }
    } catch (err) {
      if (err.message && (err.message.includes("BadInputs") || err.message.includes("UTxO"))) {
        showNotification("⚠️ Wallet Busy: Please wait 20s.");
      } else { showNotification("Delete failed"); }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (note) => { setSelectedNote(note); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedNote(null); };
  const handleEditClick = (note) => { setEditNote(note); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditNote(null); };

  // --- RENDER ---
  return (
    <div style={{ margin: 0, padding: 0 }}>
      {notification && <div className={appStyles.notification}>{notification}</div>}
      
      {/* HEADER: ALWAYS VISIBLE */}
      <div className={appStyles.header}>
        {/* App Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>📝</span>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '800', 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Blockchain Notes
          </h1>
        </div>

        {/* Right Side: Wallet Connection */}
        <div className={appStyles.userInfo}>
          {connected ? (
            <>
              <span className={appStyles.username}>
                👤 {userAddress ? `${userAddress.slice(0, 8)}...${userAddress.slice(-4)}` : "Loading..."}
              </span>
              <button onClick={() => disconnect()} className={appStyles.logoutButton}>
                Disconnect
              </button>
            </>
          ) : (
            <CardanoWallet label="Connect Wallet" />
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.container}>
        {connected ? (
          // VIEW A: LOGGED IN
          <>
            <NoteForm
              title={title} content={content} color={color}
              setTitle={setTitle} setContent={setContent} setColor={setColor}
              onCreateNote={handleCreateNote}
            />
            <NotesList
              notes={notes}
              onEdit={handleEditClick} onDelete={handleDeleteNote} onCardClick={handleCardClick}
              onTogglePin={() => {}}
            />
          </>
        ) : (
          // VIEW B: LOGGED OUT (Welcome Screen)
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            textAlign: 'center',
            color: 'white',
            paddingTop: '2rem'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800' }}>
              Your Thoughts, <br/> On The Blockchain.
            </h1>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6', opacity: 0.9 }}>
              Secure, decentralized, and permanent. Connect your Cardano wallet to start writing notes that last forever.
            </p>
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem 2rem', 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)', 
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                👆 Click <strong>"Connect Wallet"</strong> in the top right to begin.
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal note={selectedNote} isOpen={isModalOpen} onClose={handleCloseModal} />
      <EditModal note={editNote} isOpen={isEditModalOpen} onClose={handleCloseEditModal} onUpdate={handleUpdateNote} />
    </div>
  );
}

export default App;