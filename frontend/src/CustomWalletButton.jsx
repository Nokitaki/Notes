// src/CustomWalletButton.jsx
import { useState } from 'react';
import { useWallet, useWalletList } from '@meshsdk/react';

const CustomWalletButton = () => {
  const { connect, connecting } = useWallet();
  const wallets = useWalletList();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = async (walletName) => {
    try {
      await connect(walletName, true); // persist = true
      setIsModalOpen(false);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <>
      {/* Connect Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={connecting}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: connecting ? 'wait' : 'pointer',
          fontWeight: '600',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        }}
      >
        {connecting ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            Connecting...
          </>
        ) : (
          <>
            💳 Connect Wallet
          </>
        )}
      </button>

      {/* Wallet Selection Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '420px',
              width: '90%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              animation: 'slideUp 0.3s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{
                margin: 0,
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Connect Your Wallet
              </h2>
              <p style={{
                margin: '0.5rem 0 0 0',
                color: '#94a3b8',
                fontSize: '0.9rem',
              }}>
                Select a wallet to get started
              </p>
            </div>

            {/* Wallet List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    disabled={connecting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                      }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem',
                      }}>
                        {wallet.name}
                      </div>
                      <div style={{
                        color: '#64748b',
                        fontSize: '0.8rem',
                      }}>
                        Click to connect
                      </div>
                    </div>
                    <span style={{
                      marginLeft: 'auto',
                      color: '#667eea',
                      fontSize: '1.2rem',
                    }}>
                      →
                    </span>
                  </button>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#94a3b8',
                }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>🔍</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>No wallets detected</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Please install a Cardano wallet extension
                  </p>
                  <a
                    href="https://namiwallet.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '1rem',
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                    }}
                  >
                    Get Nami Wallet
                  </a>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.875rem',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#94a3b8';
              }}
            >
              Cancel
            </button>

            {/* Footer */}
            <p style={{
              textAlign: 'center',
              margin: '1rem 0 0 0',
              color: '#475569',
              fontSize: '0.75rem',
            }}>
              🔒 Your wallet credentials never leave your device
            </p>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default CustomWalletButton;
