// backend/worker.js
console.log("WORKER: 1. Starting up...");

require('dotenv').config();
const { BlockFrostAPI } = require('@blockfrost/blockfrost-js');
const { pool } = require('./database');

const API = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_API_KEY,
  network: 'preview'
});

const CHECK_INTERVAL = 10000; // Check every 10 seconds (faster for testing)

console.log("WORKER: 2. Connected to Blockfrost. Waiting for jobs...");

async function checkPendingTransactions() {
  const client = await pool.connect();
  
  try {
    // 1. Find ANY note that is pending (Create, Update, or Delete)
    // The status matches anything starting with "Pending"
    const query = "SELECT id, title, tx_hash, status FROM notes WHERE status LIKE 'Pending%'";
    const result = await client.query(query);
    
    if (result.rows.length === 0) {
      // process.stdout.write("."); // Heartbeat
      return;
    }

    console.log(`\n🔍 WORKER: Found ${result.rows.length} pending items.`);

    for (const note of result.rows) {
      console.log(`   - Checking Note ID ${note.id} (${note.status}) | TX: ${note.tx_hash?.slice(0, 15)}...`);
      
      try {
        // Query Blockfrost
        const txInfo = await API.txs(note.tx_hash);
        
        // If confirmed (has block height)
        if (txInfo && txInfo.block_height) {
          console.log(`     ✅ CONFIRMED on chain! (Block: ${txInfo.block_height})`);
          
          if (note.status === 'Pending Delete') {
            // CASE: DELETE
            console.log(`     🗑️ Action: Deleting Note ${note.id} from Database...`);
            await client.query("DELETE FROM notes WHERE id = $1", [note.id]);
            console.log(`     ✨ Note deleted successfully.`);
          } 
          else {
            // CASE: CREATE / UPDATE
            console.log(`     💾 Action: Updating status to 'Confirmed'...`);
            await client.query(
              "UPDATE notes SET status = 'Confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
              [note.id]
            );
            console.log(`     ✨ Note updated successfully.`);
          }
        } else {
          console.log(`     ⏳ Status: Still processing on chain...`);
        }
      } catch (error) {
        if (error.status_code === 404) {
          console.log(`     ⏳ Status: TX not found yet (MemPool)`);
        } else {
          console.error(`     ❌ Error checking TX:`, error.message);
        }
      }
    }

  } catch (err) {
    console.error("WORKER ERROR:", err.message);
  } finally {
    client.release();
  }
}

// Start loop
checkPendingTransactions();
setInterval(checkPendingTransactions, CHECK_INTERVAL);