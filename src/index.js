const express = require('express'); 
const cors = require('cors');
require('dotenv').config(); 

// const invoice = require('./router/invoice');
const invoice = require('./router/invoice')

const port = process.env.PORT; 

const app = express(); 
app.use(cors()); 
app.use(express.json()); 

app.use("/invoice", invoice);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
