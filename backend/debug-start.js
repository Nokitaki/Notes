// backend/debug-start.js
console.log("🐞 Starting Debugger...");

process.on('uncaughtException', (err) => {
  console.error("\n💥 CRITICAL CRASH:", err);
});

try {
  console.log("1. Loading dotenv...");
  require('dotenv').config();
  console.log("   ✅ Dotenv loaded");
} catch (e) { console.error("   ❌ Dotenv failed:", e.message); }

try {
  console.log("2. Loading dependencies (Express, CORS)...");
  require('express');
  require('cors');
  console.log("   ✅ Dependencies loaded");
} catch (e) { 
  console.error("   ❌ Dependency missing! Did you run 'npm install'?"); 
  console.error("   Error:", e.message);
  process.exit(1);
}

try {
  console.log("3. Loading Database...");
  const db = require('./database');
  console.log("   ✅ Database file loaded");
} catch (e) { console.error("   ❌ Database load failed:", e); }

try {
  console.log("4. Loading Transaction Builder...");
  require('./transactionBuilder');
  console.log("   ✅ Transaction Builder loaded");
} catch (e) { console.error("   ❌ Transaction Builder failed:", e); }

try {
  console.log("5. Starting Server...");
  require('./server');
} catch (e) { console.error("   ❌ Server start failed:", e); }