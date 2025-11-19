// backend/cardanoService.js
// Cardano Blockchain Service for Notes App (Option B)

require('dotenv').config();
const crypto = require('crypto');
const { BlockFrostAPI } = require('@blockfrost/blockfrost-js');

class CardanoService {
  constructor() {
    // Initialize Blockfrost API
    this.API = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY,
      network: 'preprod' // testnet
    });

    // Your project wallet
    this.projectWallet = {
      address: process.env.PROJECT_WALLET_ADDRESS,
      balance: 10000 // Initial balance from faucet
    };

    // Transaction tracking
    this.transactions = [];
    
    console.log('🔗 Cardano Service initialized');
    console.log('📍 Network: Preprod Testnet');
    console.log('💼 Project Wallet:', this.projectWallet.address?.substring(0, 30) + '...');
  }

  /**
   * Generate a transaction hash (simulated for now)
   * In production, this would be a real blockchain transaction hash
   */
  generateTxHash() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return `tx_${timestamp}_${random}`;
  }

  /**
   * Create SHA-256 hash of content for verification
   * This proves content hasn't been tampered with
   */
  hashContent(content) {
    if (!content) return null;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Record a note operation on the blockchain
   * @param {string} operation - CREATE, UPDATE, or DELETE
   * @param {object} noteData - Note information
   * @param {number} userId - User ID from database
   * @returns {object} Transaction result
   */
  async recordNoteOperation(operation, noteData, userId) {
    try {
      // Simulate network delay (like real blockchain)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate transaction hash
      const txHash = this.generateTxHash();
      
      // Create content hash for verification
      const contentHash = this.hashContent(noteData.content);

      // Build transaction metadata
      const metadata = {
        operation: operation,
        noteId: noteData.id,
        noteTitle: noteData.title,
        userId: userId,
        contentHash: contentHash,
        timestamp: Date.now(),
        network: 'preprod'
      };

      // Store transaction record
      const transaction = {
        txHash: txHash,
        operation: operation,
        noteId: noteData.id,
        userId: userId,
        metadata: metadata,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      this.transactions.push(transaction);

      // Log for demo purposes
      console.log('\n📝 Blockchain Transaction Recorded:');
      console.log(`   Operation: ${operation}`);
      console.log(`   Note: "${noteData.title}"`);
      console.log(`   TX Hash: ${txHash}`);
      console.log(`   Content Hash: ${contentHash?.substring(0, 16)}...`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Status: ✅ Confirmed\n`);

      return {
        success: true,
        txHash: txHash,
        contentHash: contentHash,
        metadata: metadata,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ Blockchain operation failed:', error.message);
      throw new Error(`Failed to record blockchain transaction: ${error.message}`);
    }
  }

  /**
   * Send reward to user (tracked in database)
   * In production, this would be a real ADA transfer
   * @param {number} userId - User ID
   * @param {number} amount - Amount of tADA to reward
   * @param {string} reason - Reason for reward
   * @returns {object} Reward result
   */
  async sendReward(userId, amount, reason = 'Note creation') {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Generate reward transaction hash
      const rewardTxHash = this.generateTxHash();

      // Check project wallet balance (simulated)
      if (this.projectWallet.balance < amount) {
        throw new Error('Insufficient funds in project wallet');
      }

      // Deduct from project wallet (simulated)
      this.projectWallet.balance -= amount;

      // Log reward
      console.log('🎁 Reward Sent:');
      console.log(`   User ID: ${userId}`);
      console.log(`   Amount: ${amount} tADA`);
      console.log(`   Reason: ${reason}`);
      console.log(`   TX Hash: ${rewardTxHash}`);
      console.log(`   Project Balance Remaining: ${this.projectWallet.balance} tADA\n`);

      return {
        success: true,
        amount: amount,
        txHash: rewardTxHash,
        reason: reason,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ Reward failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify a transaction exists (using Blockfrost)
   * This is useful for validating transaction hashes
   * @param {string} txHash - Transaction hash to verify
   * @returns {object} Transaction details or null
   */
  async verifyTransaction(txHash) {
    try {
      // For simulated transactions, check local storage
      if (txHash.startsWith('tx_')) {
        const localTx = this.transactions.find(tx => tx.txHash === txHash);
        if (localTx) {
          return {
            verified: true,
            transaction: localTx,
            source: 'local'
          };
        }
      }

      // For real blockchain transactions, query Blockfrost
      // Uncomment when using real transactions:
      /*
      const tx = await this.API.txs(txHash);
      return {
        verified: true,
        transaction: tx,
        source: 'blockchain'
      };
      */

      return {
        verified: false,
        error: 'Transaction not found'
      };

    } catch (error) {
      console.error('Verification failed:', error.message);
      return {
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Get all transactions for a user
   * @param {number} userId - User ID
   * @returns {array} Array of transactions
   */
  getUserTransactions(userId) {
    return this.transactions.filter(tx => tx.userId === userId);
  }

  /**
   * Get transaction statistics
   * @returns {object} Stats about blockchain operations
   */
  getStats() {
    return {
      totalTransactions: this.transactions.length,
      projectWalletBalance: this.projectWallet.balance,
      projectWalletAddress: this.projectWallet.address,
      operations: {
        create: this.transactions.filter(tx => tx.operation === 'CREATE').length,
        update: this.transactions.filter(tx => tx.operation === 'UPDATE').length,
        delete: this.transactions.filter(tx => tx.operation === 'DELETE').length
      }
    };
  }

  /**
   * Check if Blockfrost connection is working
   * @returns {boolean} Connection status
   */
  async checkConnection() {
    try {
      const latestBlock = await this.API.blocksLatest();
      console.log('✅ Blockfrost connection active');
      console.log(`   Latest block: ${latestBlock.height}`);
      return true;
    } catch (error) {
      console.error('❌ Blockfrost connection failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new CardanoService();