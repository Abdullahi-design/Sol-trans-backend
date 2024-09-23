const express = require('express'); 
const { transferRequest, getTransactionSignature } = require('../controller/receive_money/main');

const router = express.Router();

router.post('/create', transferRequest);

// Polling route to get the transaction signature
router.get('/signature', getTransactionSignature);

module.exports = router;