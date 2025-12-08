require('dotenv').config();
const { BlockFrostAPI } = require('@blockfrost/blockfrost-js');

const API = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_API_KEY,
  network: 'preview'
});

async function checkBalance() {
  try {
    const address = process.env.PROJECT_WALLET_ADDRESS;
    console.log('Checking address:', address);
    
    const utxos = await API.addressesUtxos(address);
    
    let lovelace = 0;
    for (const utxo of utxos) {
      const ada = utxo.amount.find(a => a.unit === 'lovelace');
      if (ada) {
        lovelace += parseInt(ada.quantity);
      }
    }
    
    console.log('✅ Balance:', (lovelace / 1000000) + ' tADA');
    console.log('✅ UTXOs found:', utxos.length);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkBalance();