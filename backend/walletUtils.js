// backend/walletUtils.js (FIXED - Uses blakejs)
require("dotenv").config();
const bip39 = require("bip39");
const CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
const blake = require("blakejs");

class WalletManager {
  constructor() {
    this.walletAddress = process.env.PROJECT_WALLET_ADDRESS;
    this.seedPhrase = process.env.WALLET_SEED_PHRASE;

    if (!this.seedPhrase) {
      throw new Error("WALLET_SEED_PHRASE not found in .env file!");
    }

    console.log("ðŸ” Wallet Manager initialized");
    console.log("ðŸ“ Address:", this.walletAddress?.substring(0, 30) + "...");
  }

  getRootKey() {
    const entropy = bip39.mnemonicToEntropy(this.seedPhrase);
    const entropyBytes = Buffer.from(entropy, "hex");
    return CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
      entropyBytes,
      Buffer.from("")
    );
  }

  getPaymentSigningKey() {
    const rootKey = this.getRootKey();
    return rootKey
      .derive(harden(1852))
      .derive(harden(1815))
      .derive(harden(0))
      .derive(0)
      .derive(0);
  }

  getPaymentKeyHash() {
    return this.getPaymentSigningKey().to_public().to_raw_key().hash();
  }

  /**
   * Sign transaction - Uses make_vkey_witness with computed hash
   */
  signTransaction(txBody) {
    try {
      const signingKey = this.getPaymentSigningKey();

      // Get transaction body bytes
      const txBodyBytes = txBody.to_bytes();

      // Compute Blake2b-256 hash
      const txBodyHash = blake.blake2b(txBodyBytes, null, 32); // 32 bytes = 256 bits

      // Create TransactionHash from the hash bytes
      const txHash = CardanoWasm.TransactionHash.from_bytes(txBodyHash);

      // Create witness using make_vkey_witness (this function IS available!)
      // Convert Bip32PrivateKey to raw PrivateKey
      const privateKey = signingKey.to_raw_key();
      const vkeyWitness = CardanoWasm.make_vkey_witness(txHash, privateKey);

      // Create witness set
      const witnessSet = CardanoWasm.TransactionWitnessSet.new();
      const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
      vkeyWitnesses.add(vkeyWitness);
      witnessSet.set_vkeys(vkeyWitnesses);

      // Create signed transaction
      return witnessSet;
    } catch (error) {
      console.error("âŒ Signing error:", error.message);
      throw error;
    }
  }

  async verifyWallet() {
    try {
      console.log("\nðŸ” Verifying wallet setup...");
      console.log("  âœ“ Root key generation");
      this.getRootKey();
      console.log("  âœ“ Payment key derivation");
      this.getPaymentSigningKey();
      console.log("  âœ“ Public key extraction");
      this.getPaymentSigningKey().to_public();
      console.log("  âœ“ Key hash generation");
      const keyHash = this.getPaymentKeyHash();
      console.log("\nâœ… Wallet verification successful!");
      console.log(
        "ðŸ”‘ Public Key Hash:",
        Buffer.from(keyHash.to_bytes()).toString("hex").substring(0, 20) + "..."
      );
      return true;
    } catch (error) {
      console.error("\nâŒ Wallet verification failed:", error.message);
      return false;
    }
  }
}

function harden(num) {
  return 0x80000000 + num;
}

module.exports = new WalletManager();