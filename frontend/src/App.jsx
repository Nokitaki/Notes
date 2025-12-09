// frontend/src/App.jsx
import { useState, useEffect } from "react";
import { useWallet, CardanoWallet } from "@meshsdk/react"; 
import { TransactionService } from "./TransactionService";
import { styles } from "./styles.js";
import appStyles from "./styles/App.module.css";
import NoteForm from "./NoteForm.jsx";
import NotesList from "./NotesList.jsx";
import Modal from "./Modal.jsx";
import EditModal from "./EditModal.jsx";
import "./App.css";

const API_URL = "http://localhost:5002/api/notes";

function App() {
  const { connected, wallet, disconnect, name } = useWallet();

  // App State
  const [userAddress, setUserAddress] = useState(null); // Logic ID (Stake Key)
  const [viewAddress, setViewAddress] = useState(null); // Display ID (Addr Key)
  const [notes, setNotes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Safety: Wrong Network State
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // UI State: Wallet Profile Modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form & Modal State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Initial Wallet Sync
  useEffect(() => {
    let isMounted = true;
    const syncWallet = async () => {
      if (connected && wallet) {
        try {
          setLoading(true);
          
          // A. Get Stake Address (For DB Identity)
          const rewardAddresses = await wallet.getRewardAddresses();
          const stakeAddress = rewardAddresses[0]; 

          // B. Get Change Address (For UI Display)
          const changeAddress = await wallet.getChangeAddress();
          
          if (isMounted) {
            console.log("🔑 ID:", stakeAddress);
            
            setUserAddress(stakeAddress);
            setViewAddress(changeAddress);
            
            await fetchNotes(stakeAddress); // Always fetch using STAKE address
            
            const netId = await wallet.getNetworkId();
            if (netId === 1) setIsWrongNetwork(true);
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
          setViewAddress(null);
          setNotes([]);
          setIsWrongNetwork(false);
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
        headers: { "Content-Type": "application/json", "x-wallet-address": address },
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // 3. Data Polling (Checks DB for 'Confirmed' status every 5s)
  useEffect(() => {
    if (!userAddress) return;
    const interval = setInterval(() => fetchNotes(userAddress), 5000);
    return () => clearInterval(interval);
  }, [userAddress]);

  // 4. WATCHDOG: SMART POLLING (Fixes "Message Channel Closed" Error)
  useEffect(() => {
    if (!connected || !wallet) return;

    let timeoutId;
    let isMounted = true;

    const checkWalletState = async () => {
      try {
        // A. Check for Account Switch
        const addresses = await wallet.getRewardAddresses();
        const currentOnChainAddress = addresses[0];
        const currentChangeAddress = await wallet.getChangeAddress();

        if (isMounted) {
           if (currentOnChainAddress && userAddress && currentOnChainAddress !== userAddress) {
            console.log("🔄 Account Switch Detected:", currentOnChainAddress);
            setUserAddress(currentOnChainAddress);
            setViewAddress(currentChangeAddress);
            await fetchNotes(currentOnChainAddress); 
            showNotification("Account Switched!");
          } else if (currentChangeAddress !== viewAddress) {
             // Just update the view if the payment address rotated
             setViewAddress(currentChangeAddress);
          }

          // B. Check Network
          const netId = await wallet.getNetworkId();
          setIsWrongNetwork(netId === 1);
        }
      } catch (err) {
        // Silent catch: Prevents console spam if wallet is busy
      }
      
      // Schedule the next check ONLY after this one finishes
      if (isMounted) {
        timeoutId = setTimeout(checkWalletState, 2000); // Check every 2s
      }
    };

    checkWalletState(); // Start loop

    return () => { 
      isMounted = false;
      clearTimeout(timeoutId); 
    };
  }, [connected, wallet, userAddress, viewAddress]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  // --- ACTIONS ---
  const handleCopyAddress = () => {
    if (viewAddress) {
      navigator.clipboard.writeText(viewAddress);
      showNotification("📋 Address Copied!");
    }
  };

  // 🔥 FAST CREATE (NO DELAY)
  const handleCreateNote = async (noteData) => {
    if (isWrongNetwork) { showNotification("❌ Wrong Network!"); return; }
    if (!noteData.title.trim()) { showNotification("Please enter a title."); return; }
    if (!connected || !name) { showNotification("Please connect your wallet first!"); return; }

    try {
      setLoading(true);
      showNotification("⏳ Please sign the transaction...");
      
      const walletApi = await window.cardano[name].enable();
      // 1. Submit to Blockchain
      const txHash = await TransactionService.submitNote(walletApi, noteData, "CREATE");
      
      // 2. Immediate Save to DB (Status: Pending)
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
        // 3. Update UI Instantly
        setNotes((prev) => [data.note, ...prev]);
        showNotification("🎉 Note created! (Pending Confirmation)");
        setTitle(""); setContent("");
      }
    } catch (err) {
      console.error("Transaction Error:", err);
      showNotification("Failed to create note");
    } finally {
      setLoading(false); // Stop Spinner immediately
    }
  };

  // 🔥 FAST UPDATE (NO DELAY)
  const handleUpdateNote = async (id, newTitle, newContent) => {
    if (isWrongNetwork) { showNotification("❌ Wrong Network!"); return; }
    if (!connected || !name) return;
    try {
      setLoading(true);
      showNotification("⏳ Preparing update...");
      
      const walletApi = await window.cardano[name].enable();
      // 1. Submit to Blockchain
      const txHash = await TransactionService.submitNote(walletApi, { id, title: newTitle, content: newContent }, "UPDATE");
      
      // 2. Immediate Save to DB (Status: Pending Update)
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': userAddress },
        body: JSON.stringify({ title: newTitle, content: newContent, txHash: txHash, contentHash: "hash-placeholder" })
      });

      if (response.ok) {
        // 3. Update UI Instantly
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

  // 🔥 FAST DELETE (NO DELAY)
  const handleDeleteNote = async (id) => {
    if (isWrongNetwork) { showNotification("❌ Wrong Network!"); return; }
    if (!window.confirm("Are you sure? This costs ADA.")) return;
    try {
      setLoading(true);
      
      const walletApi = await window.cardano[name].enable();
      // 1. Submit to Blockchain
      const txHash = await TransactionService.submitNote(walletApi, { id, title: "Deleted", content: "" }, "DELETE");
      
      // 2. Immediate Save to DB (Status: Pending Delete)
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-wallet-address": userAddress },
        body: JSON.stringify({ txHash })
      });

      if (response.ok) {
        // 3. Update UI Instantly (Mark as Pending Delete)
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
      
      {/* 🔴 WRONG NETWORK OVERLAY */}
      {isWrongNetwork && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️ Wrong Network</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>This app runs on <strong>Cardano Preview Testnet</strong>.</p>
          <div style={{ background: '#333', padding: '15px 30px', borderRadius: '10px', border: '1px solid #555' }}>
            <p style={{ color: '#ff6b6b', margin: 0, fontSize: '1.1rem' }}>Please switch from <b>Mainnet</b> ➡️ <b>Preview</b></p>
          </div>
        </div>
      )}

      {/* 👤 WALLET PROFILE MODAL */}
      {isProfileOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 5000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }} onClick={() => setIsProfileOpen(false)}>
          <div style={{
            background: '#1e293b', padding: '2rem', borderRadius: '16px',
            border: '1px solid #475569', maxWidth: '500px', width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
              💳 Wallet Details
            </h2>
            
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your Connected Address:</p>
            <div style={{ 
              background: '#0f172a', padding: '1rem', borderRadius: '8px', 
              wordBreak: 'break-all', fontFamily: 'monospace', color: '#e2e8f0',
              border: '1px solid #334155', marginBottom: '1.5rem', fontSize: '0.9rem'
            }}>
              {viewAddress || "Loading..."}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button 
                onClick={handleCopyAddress}
                style={{
                  background: '#3b82f6', color: 'white', border: 'none', padding: '12px',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                }}
              >
                📄 Copy Address
              </button>
              
              <a 
                href={`https://preview.cardanoscan.io/address/${viewAddress}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  textAlign: 'center', background: '#334155', color: 'white', 
                  padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
                }}
              >
                🔍 View on Explorer
              </a>

              <button 
                onClick={() => setIsProfileOpen(false)}
                style={{
                  marginTop: '0.5rem', background: 'transparent', color: '#94a3b8', 
                  border: 'none', cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && <div className={appStyles.notification}>{notification}</div>}
      
      {/* HEADER */}
      <div className={appStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>📝</span>
          <h1 style={{ 
            fontSize: '1.25rem', fontWeight: '800', margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Ronan & Frends Notes
          </h1>
        </div>

        {/* Right Side: Wallet Connection */}
        <div className={appStyles.userInfo}>
          {connected ? (
            <>
              {/* CLICKABLE ADDRESS -> OPENS MODAL */}
              <button 
                onClick={() => setIsProfileOpen(true)}
                className={appStyles.username}
                style={{ 
                  cursor: 'pointer',
                  marginRight: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}
              >
                👤 {viewAddress ? `${viewAddress.slice(0, 10)}...${viewAddress.slice(-4)}` : "Loading..."}
              </button>

              <button onClick={() => disconnect()} className={appStyles.logoutButton}>
                Disconnect
              </button>
            </>
          ) : (
            <CardanoWallet label="Connect Wallet" />
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        {connected ? (
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
          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            width: '100%', textAlign: 'center', color: 'white', paddingTop: '2rem'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800' }}>
              Your Thoughts, <br/> On The Blockchain.
            </h1>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6', opacity: 0.9 }}>
              Secure, decentralized, and permanent. Connect your Cardano wallet to start writing notes that last forever.
            </p>
            <div style={{ 
              marginTop: '2rem', padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)'
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