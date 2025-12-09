// backend/simple.js
console.log("1. Starting Simple Server...");
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello'));

app.listen(5001, () => {
  console.log("✅ SUCCESS: Simple server running on 5001");
});