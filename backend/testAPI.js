// backend/testAPI.js
// Quick API test with random usernames

async function testAPI() {
  const BASE_URL = 'http://localhost:5000';
  
  // Generate random username
  const randomNum = Math.floor(Math.random() * 10000);
  const testUsername = `testuser${randomNum}`;

  try {
    console.log('🧪 Testing Enhanced Notes API...\n');

    // Test 1: Signup
    console.log('1️⃣ Testing Signup...');
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: testUsername,  // Random username
        password: 'test123' 
      })
    });
    const signupData = await signupRes.json();
    
    if (!signupRes.ok) {
      console.error('❌ Signup failed:', signupData);
      return;
    }
    
    console.log('✅ Signup:', signupData.message);
    console.log('   Username:', testUsername);
    console.log('   User ID:', signupData.user.id);
    console.log('   Balance:', signupData.user.ada_balance, 'tADA\n');

    const userId = signupData.user.id;

    // Test 2: Create Note
    console.log('2️⃣ Testing Create Note...');
    const createRes = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Note',
        content: 'This is a test note with blockchain integration!',
        color: '#fef3c7',
        userId: userId
      })
    });
    const createData = await createRes.json();
    
    // Debug: Show full response
    console.log('📄 Full Response:', JSON.stringify(createData, null, 2));
    
    if (!createRes.ok) {
      console.error('❌ Create note failed:', createData);
      return;
    }
    
    console.log('✅ Note Created:', createData.message || 'Success');
    if (createData.blockchain) {
      console.log('   TX Hash:', createData.blockchain.txHash);
    }
    if (createData.reward) {
      console.log('   Reward:', createData.reward.amount, 'tADA');
    }
    console.log('');

    // Test 3: Get Stats
    console.log('3️⃣ Testing Blockchain Stats...');
    const statsRes = await fetch(`${BASE_URL}/api/blockchain/stats`);
    const statsData = await statsRes.json();
    console.log('✅ Stats Retrieved:');
    console.log('   Total Transactions:', statsData.blockchain.totalTransactions);
    console.log('   Total Users:', statsData.database.totalUsers);
    console.log('   Total Notes:', statsData.database.totalNotes);
    console.log('   Network:', statsData.network);

    console.log('\n🎉 ALL API TESTS PASSED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();