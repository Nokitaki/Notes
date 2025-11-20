// backend/testWallet.js
// Test wallet setup with seed phrase

const walletManager = require('./walletUtils');

async function testWallet() {
  console.log('🧪 Testing Wallet Setup\n');
  console.log('=' .repeat(50));
  
  try {
    // Run wallet verification
    const isValid = await walletManager.verifyWallet();
    
    if (isValid) {
      console.log('\n' + '='.repeat(50));
      console.log('🎉 SUCCESS! Your wallet is ready for blockchain transactions!');
      console.log('='.repeat(50));
      console.log('\n✅ Next step: Proceed to Step 3');
    } else {
      console.log('\n' + '='.repeat(50));
      console.log('❌ FAILED! Please check your seed phrase in .env');
      console.log('='.repeat(50));
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check WALLET_SEED_PHRASE in .env file');
      console.log('   2. Ensure it has exactly 24 words');
      console.log('   3. Words should be separated by spaces');
      console.log('   4. Should be wrapped in quotes');
      console.log('\n   Example format:');
      console.log('   WALLET_SEED_PHRASE="word1 word2 word3 ... word24"');
    }
    
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ ERROR:', error.message);
    console.log('='.repeat(50));
    
    if (error.message.includes('WALLET_SEED_PHRASE not found')) {
      console.log('\n🔧 Fix: Add this line to your backend/.env file:');
      console.log('   WALLET_SEED_PHRASE="your 24 words here"');
    } else if (error.message.includes('Invalid mnemonic')) {
      console.log('\n🔧 Fix: Check your seed phrase:');
      console.log('   - Must be exactly 24 words');
      console.log('   - Must be valid BIP39 words');
      console.log('   - Check for typos');
    } else {
      console.log('\n🔧 Full error details:');
      console.error(error);
    }
  }
}

// Run test
testWallet();