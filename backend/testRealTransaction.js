// backend/testRealTransaction.js
// Test submitting a REAL transaction to Cardano blockchain

const transactionBuilder = require('./transactionBuilder');

async function testRealTransaction() {
  console.log('🧪 Testing REAL Blockchain Transaction\n');
  console.log('=' .repeat(60));
  console.log('⚠️  WARNING: This will submit a REAL transaction!');
  console.log('   - Uses real testnet ADA');
  console.log('   - Costs ~0.17 tADA in fees');
  console.log('   - Will appear on CardanoScan');
  console.log('   - Cannot be reversed!');
  console.log('=' .repeat(60));
  
  try {
    // Test note data
    const testNote = {
      id: 999999,
      title: 'Blockchain Test Note',
      content: 'This is a real transaction on Cardano Preprod testnet!'
    };
    
    const userId = 1;

    console.log('\n📝 Test Note:');
    console.log('   Title:', testNote.title);
    console.log('   Content:', testNote.content);
    console.log('   User ID:', userId);

    console.log('\n⏳ Submitting transaction (this may take 10-30 seconds)...\n');

    // Submit transaction
    const result = await transactionBuilder.createNoteTransaction(
      'CREATE',
      testNote,
      userId
    );

    // Check result
    if (result.success) {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 SUCCESS! Transaction submitted to blockchain!');
      console.log('='.repeat(60));
      console.log('\n📊 Transaction Details:');
      console.log('   TX Hash:', result.txHash);
      console.log('   Content Hash:', result.contentHash?.substring(0, 20) + '...');
      console.log('   Timestamp:', new Date(result.timestamp).toLocaleString());
      
      console.log('\n🔍 View on CardanoScan:');
      console.log('   ' + result.explorer);
      
      console.log('\n⏰ Note: Transaction may take 20-30 seconds to appear on CardanoScan');
      
      console.log('\n✅ STEP 3 COMPLETE!');
      console.log('   Your app can now write to REAL blockchain!');
      console.log('\n📋 Next: Type "proceed" for Step 4');
      
      // Wait a bit and check status
      console.log('\n⏳ Checking transaction status in 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log('\n🔍 Checking blockchain...');
      const status = await transactionBuilder.checkTransaction(result.txHash);
      
      if (status.found) {
        console.log('✅ Transaction found on blockchain!');
        console.log('   Status:', status.confirmations);
        console.log('   Fees:', status.fees, 'lovelace');
      } else {
        console.log('⏰ Transaction still processing...');
        console.log('   Check CardanoScan in 1-2 minutes');
      }
      
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('❌ TRANSACTION FAILED');
      console.log('='.repeat(60));
      console.log('\n💥 Error:', result.error);
      
      console.log('\n🔧 Common Issues:');
      console.log('   1. "No UTXOs found" → Wallet is empty');
      console.log('   2. "BadInputsUTxO" → Previous TX still pending');
      console.log('   3. "OutsideValidityInterval" → TTL expired, retry immediately');
      console.log('   4. Network timeout → Blockfrost API busy, retry');
      
      console.log('\n💡 Solution: Wait 1 minute and run again');
    }

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ UNEXPECTED ERROR');
    console.log('='.repeat(60));
    console.error('\n💥 Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Network error. Check your internet connection.');
    } else if (error.message.includes('Invalid API key')) {
      console.log('\n🔧 Check BLOCKFROST_API_KEY in .env file');
    } else if (error.message.includes('rate limit')) {
      console.log('\n🔧 Blockfrost rate limit. Wait 1 minute and retry.');
    } else {
      console.log('\n🔧 Full error:');
      console.error(error);
    }
  }
}

// Run test
console.log('\n⚠️  This will spend real testnet ADA (about 0.17 tADA in fees)\n');
console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

setTimeout(() => {
  testRealTransaction();
}, 3000);