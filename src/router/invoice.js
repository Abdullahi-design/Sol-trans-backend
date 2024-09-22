const express = require('express'); 
const { transferRequest } = require('../controller/receive_money/main');

const router = express.Router();

router.post('/create', transferRequest);



module.exports = router;