// src/WalletConnector.jsx
import { CardanoWallet } from '@meshsdk/react';
import styles from './styles/Auth.module.css'; // Re-using your nice styles

const WalletConnector = ({ onConnect }) => {
  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>
          📝 Notes App
          <br />
          <span className={styles.subtitle}>Blockchain Edition</span>
        </h1>

        <div style={{ 
          marginTop: '2rem', 
          display: 'flex', 
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Mesh's Pre-made Wallet Button */}
          <CardanoWallet 
            label="Connect Wallet to Enter"
            onConnected={(details) => {
              // This runs when user connects their wallet
              console.log("Wallet Connected:", details);
              onConnect(); 
            }}
          />
          
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '1rem' }}>
            Supported Wallets: Nami, Eternl, Flint, Lace, etc.
          </p>
        </div>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            🔐 <strong>Secure Login:</strong> No passwords required.
          </p>
          <p className={styles.infoText}>
            ✨ Your wallet address is your identity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnector;