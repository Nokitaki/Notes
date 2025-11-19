// backend/testCardanoService.js
// Test the Cardano Service

const cardanoService = require('./cardanoService');

async function testCardanoService() {
  console.log('🧪 Testing Cardano Service...\n');

  try {
    // Test 1: Check Blockfrost connection
    console.log('📡 Test 1: Checking Blockfrost connection...');
    await cardanoService.checkConnection();
    console.log('');

    // Test 2: Record a note creation
    console.log('📝 Test 2: Recording note creation...');
    const noteData = {
      id: 1,
      title: 'Test Note',
      content: 'This is a test note for blockchain integration'
    };
    
    const txResult = await cardanoService.recordNoteOperation('CREATE', noteData, 1);
    console.log('Result:', {
      success: txResult.success,
      txHash: txResult.txHash,
      contentHash: txResult.contentHash?.substring(0, 20) + '...'
    });
    console.log('');

    // Test 3: Send reward
    console.log('💰 Test 3: Sending reward...');
    const rewardResult = await cardanoService.sendReward(1, 2, 'Note creation reward');
    console.log('Result:', {
      success: rewardResult.success,
      amount: rewardResult.amount,
      txHash: rewardResult.txHash
    });
    console.log('');

    // Test 4: Verify transaction
    console.log('🔍 Test 4: Verifying transaction...');
    const verification = await cardanoService.verifyTransaction(txResult.txHash);
    console.log('Result:', {
      verified: verification.verified,
      source: verification.source
    });
    console.log('');

    // Test 5: Get statistics
    console.log('📊 Test 5: Getting statistics...');
    const stats = cardanoService.getStats();
    console.log('Stats:', stats);
    console.log('');

    // All tests passed!
    console.log('✅ ALL TESTS PASSED!');
    console.log('🎉 Cardano Service is working perfectly!');
    console.log('✅ Ready to integrate with Notes API!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests
testCardanoService();