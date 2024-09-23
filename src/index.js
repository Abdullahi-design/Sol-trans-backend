const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const { transferRequestWS } = require('./controller/receive_money/main'); // Import WebSocket transfer function
// const { broadcastSignature } = require('./broadcast'); // Import broadcast function

const port = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log('Received:', message);
    const data = JSON.parse(message);

    const { publicKey, solAmount } = data;

    // Use the transferRequestWS function to handle the payment process, passing the wss
    transferRequestWS({ publicKey, solAmount, wss }, ws);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
