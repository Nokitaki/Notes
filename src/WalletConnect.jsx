import { useState } from "react";
import axios from "axios";

export default function WalletConnect() {
  const [address, setAddress] = useState(null);

  async function connectWallet() {
    if (!window.cardano || !window.cardano.nami)
      return alert("Install Nami Wallet first.");

    try {
      const api = await window.cardano.nami.enable();
      const used = await api.getUsedAddresses();
      const walletAddr = used[0];

      setAddress(walletAddr);

      const token = localStorage.getItem("token");

      await axios.post("http://localhost:4000/api/wallet/connect",
        { address: walletAddr },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Wallet connected successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet");
    }
  }

  return (
    <div className="wallet-box">
      <button onClick={connectWallet} className="wallet-btn">
        Connect Wallet
      </button>
      {address && <p className="wallet-address">{address}</p>}
    </div>
  );
}
