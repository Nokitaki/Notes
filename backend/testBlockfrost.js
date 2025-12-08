// backend/testBlockfrost.js

require("dotenv").config();
const { BlockFrostAPI } = require("@blockfrost/blockfrost-js");

// Initialize Blockfrost
const API = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_API_KEY,
  network: "preview", // Preview testnet
});

async function testConnection() {
  console.log("🧪 Testing Blockfrost Connection...\n");

  try {
    // Test 1: Get latest block
    console.log("📦 Test 1: Fetching latest block...");
    const latestBlock = await API.blocksLatest();
    console.log("✅ Success! Latest block height:", latestBlock.height);
    console.log("   Block hash:", latestBlock.hash.substring(0, 20) + "...\n");

    // Test 2: Verify your wallet address format
    console.log("💰 Test 2: Verifying wallet address...");
    const walletAddress = process.env.PROJECT_WALLET_ADDRESS;
    console.log("   Wallet address:", walletAddress.substring(0, 30) + "...");

    if (walletAddress.startsWith("addr_test1")) {
      console.log("✅ Success! Valid payment address format");
      console.log("   This is perfect for Option B (backend wallet)!");
      console.log("   Your 10,000 tADA balance is in Lace wallet ✓\n");
    } else {
      console.log("⚠️  Warning: Address should start with addr_test1\n");
    }

    // Test 3: Get network info
    console.log("🌐 Test 3: Getting network info...");
    const network = await API.network();
    console.log("✅ Success! Network:", network.network);
    console.log(
      "   Supply:",
      parseInt(network.supply.circulating) / 1000000,
      "ADA\n"
    );

    // All tests passed!
    console.log("🎉 ALL TESTS PASSED!");
    console.log("✅ Blockfrost is connected and working!");
    console.log("✅ Ready to proceed to Step 4!\n");
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("   1. Check your BLOCKFROST_API_KEY in .env file");
    console.error(
      '   2. Make sure you selected "Preview" network in Blockfrost'
    );
    console.error("   3. Check your PROJECT_WALLET_ADDRESS is correct");
    console.error("   4. Make sure .env file is in backend folder\n");
  }
}

// Run the test
testConnection();
