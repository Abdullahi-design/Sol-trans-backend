const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const { transferRequestWS } = require('./controller/receive_money/main');
const { recentTransactionsWS } = require('./controller/recent_transactions/recentTransactions');
// const { broadcastSignature } = require('./broadcast');

const port = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(port, () => {
  console.log(`Server running on wss://localhost:${port}`);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');

  // Listen for messages from the client
  ws.on('message', async(message) => {
    console.log('Received:', message);
    const data = JSON.parse(message);

    const { action, publicKey, solAmount } = data;

    try {
      // Handle different actions based on the "action" field
      if (action === 'transferRequest') {
        // Use transferRequestWS to handle the payment process
        await transferRequestWS({ publicKey, solAmount, wss }, ws);
      } else if (action === 'recentTransactions') {
        // Get recent transactions for the publicKey
        await recentTransactionsWS({ publicKey }, ws);
      } else {
        ws.send(JSON.stringify({ errorMessage: 'Unknown action type' }));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error.message);
      ws.send(JSON.stringify({ errorMessage: 'Error processing request.' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
