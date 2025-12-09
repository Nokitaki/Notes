// frontend/src/App.jsx
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { TransactionService } from "./TransactionService";
import { styles } from "./styles.js";
import appStyles from "./styles/App.module.css";
import WalletConnector from "./WalletConnector.jsx";
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
      // Note: We don't set loading=true here to avoid UI flickering during polling
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

  // 3. REAL-TIME POLLING (New Feature 🚀)
  useEffect(() => {
    if (!userAddress) return;

    // Poll every 10 seconds to check for blockchain confirmations
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing notes...");
      fetchNotes(userAddress);
    }, 10000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [userAddress]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  // --- REAL BLOCKCHAIN TRANSACTIONS ---

  const handleCreateNote = async (noteData) => {
    if (!noteData.title.trim()) {
      showNotification("Please enter a title.");
      return;
    }

    if (!connected || !name) {
      showNotification("Please connect your wallet first!");
      return;
    }

    try {
      setLoading(true);
      showNotification("⏳ Please sign the transaction in your wallet...");

      const walletApi = await window.cardano[name].enable();
      const txHash = await TransactionService.submitNote(
        walletApi,
        noteData,
        "CREATE"
      );

      showNotification("✅ Transaction sent! Saving to database...");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": userAddress,
        },
        body: JSON.stringify({
          title: noteData.title,
          content: noteData.content,
          color: noteData.color,
          txHash: txHash,
          contentHash: "hash-placeholder",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes((prev) => [data.note, ...prev]);
        showNotification("🎉 Note created! (Pending Confirmation)");
        setTitle("");
        setContent("");
      } else {
        throw new Error("Backend save failed");
      }
    } catch (err) {
      console.error("Transaction Error:", err);
      showNotification(
        err.message.includes("User declined")
          ? "Transaction cancelled"
          : "Failed to create note"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id, newTitle, newContent) => {
    if (!connected || !name) return;
    try {
      setLoading(true);
      showNotification("⏳ Preparing update transaction...");
      
      const walletApi = await window.cardano[name].enable();
      const txHash = await TransactionService.submitNote(
        walletApi,
        { id, title: newTitle, content: newContent },
        "UPDATE"
      );

      showNotification("✅ Transaction sent! Updating DB...");

      // Update DB to "Pending Update"
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': userAddress 
        },
        body: JSON.stringify({
            title: newTitle,
            content: newContent,
            txHash: txHash,
            contentHash: "hash-placeholder"
        })
      });

      if (response.ok) {
        setNotes(prev => prev.map(n => 
            n.id === id ? { ...n, title: newTitle, content: newContent, status: 'Pending Update' } : n
        ));
        showNotification("🔄 Note updating... (Waiting for confirmation)");
      }

    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes("BadInputs") || err.message.includes("UTxO"))) {
         showNotification("⚠️ Wallet Busy: Please wait 20s for previous transaction.");
      } else {
         showNotification("Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure? This requires a blockchain fee.")) return;
    
    try {
      setLoading(true);
      const walletApi = await window.cardano[name].enable();
      
      const txHash = await TransactionService.submitNote(
        walletApi,
        { id, title: "Deleted", content: "" },
        "DELETE"
      );

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json",
            "x-wallet-address": userAddress 
        },
        body: JSON.stringify({ txHash })
      });

      if (response.ok) {
        setNotes((prev) => prev.map((n) => n.id === id ? { ...n, status: 'Pending Delete' } : n));
        showNotification("🗑️ Delete initiated... (Waiting for confirmation)");
      }

    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes("BadInputs") || err.message.includes("UTxO"))) {
        showNotification("⚠️ Wallet Busy: Please wait 20s for previous transaction.");
      } else {
        showNotification("Delete failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Modal Handlers
  const handleCardClick = (note) => { setSelectedNote(note); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedNote(null); };
  const handleEditClick = (note) => { setEditNote(note); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditNote(null); };

  if (!connected) {
    return <WalletConnector onConnect={() => console.log("Connecting...")} />;
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {notification && <div className={appStyles.notification}>{notification}</div>}
      <div className={appStyles.header}>
        <div className={appStyles.userInfo}>
          <span className={appStyles.username}>
            👤 {userAddress ? `${userAddress.slice(0, 10)}...${userAddress.slice(-6)}` : "Loading..."}
          </span>
          <span className={appStyles.balance}>🟢 Connected</span>
        </div>
        <button onClick={() => disconnect()} className={appStyles.logoutButton}>Disconnect</button>
      </div>
      <div style={styles.container}>
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
      </div>
      <Modal note={selectedNote} isOpen={isModalOpen} onClose={handleCloseModal} />
      <EditModal note={editNote} isOpen={isEditModalOpen} onClose={handleCloseEditModal} onUpdate={handleUpdateNote} />
    </div>
  );
}

export default App;