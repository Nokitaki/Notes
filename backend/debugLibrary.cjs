// backend/debugLibrary.cjs
// Check what methods are available in your Cardano library

const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');

console.log('🔍 Cardano Serialization Library Debug\n');
console.log('='.repeat(60));

// Check for hash_transaction
console.log('\n1️⃣ Checking hash_transaction:');
if (typeof CardanoWasm.hash_transaction === 'function') {
  console.log('   ✅ hash_transaction is available');
} else {
  console.log('   ❌ hash_transaction is NOT available');
  console.log('   ℹ️  Will need alternative method');
}

// Check for make_vkey_witness
console.log('\n2️⃣ Checking make_vkey_witness:');
if (typeof CardanoWasm.make_vkey_witness === 'function') {
  console.log('   ✅ make_vkey_witness is available');
} else {
  console.log('   ❌ make_vkey_witness is NOT available');
}

// Check for TransactionHash
console.log('\n3️⃣ Checking TransactionHash:');
if (CardanoWasm.TransactionHash) {
  console.log('   ✅ TransactionHash is available');
  
  // Check methods on TransactionHash
  const methods = Object.getOwnPropertyNames(CardanoWasm.TransactionHash);
  console.log('   Available static methods:', methods.slice(0, 10).join(', '));
} else {
  console.log('   ❌ TransactionHash is NOT available');
}

// Check for Vkeywitness
console.log('\n4️⃣ Checking Vkeywitness:');
if (CardanoWasm.Vkeywitness) {
  console.log('   ✅ Vkeywitness is available');
} else {
  console.log('   ❌ Vkeywitness is NOT available');
}

// Check for Ed25519Signature
console.log('\n5️⃣ Checking Ed25519Signature:');
if (CardanoWasm.Ed25519Signature) {
  console.log('   ✅ Ed25519Signature is available');
} else {
  console.log('   ❌ Ed25519Signature is NOT available');
}

// List all available top-level exports
console.log('\n6️⃣ All CardanoWasm exports (first 50):');
const allExports = Object.keys(CardanoWasm).slice(0, 50);
allExports.forEach(exp => {
  const type = typeof CardanoWasm[exp];
  console.log(`   - ${exp} (${type})`);
});

console.log('\n='.repeat(60));
console.log('✅ Debug complete!\n');

// Try to find hash-related functions
console.log('🔍 Looking for hash functions:');
const hashFunctions = Object.keys(CardanoWasm).filter(key => 
  key.toLowerCase().includes('hash')
);
console.log('   Found:', hashFunctions.join(', '));

console.log('\n='.repeat(60));