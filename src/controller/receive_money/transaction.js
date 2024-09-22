const { 
  Keypair, 
  PublicKey, 
  Connection, 
  SystemProgram, 
  Transaction, 
  sendAndConfirmTransaction, 
  LAMPORTS_PER_SOL 
} = require('@solana/web3.js');
require('dotenv').config();

let connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load your main wallet's keypair
const secret = JSON.parse(process.env.SECRET_KEY);
const mainKeypair = Keypair.fromSecretKey(new Uint8Array(secret));

// Create a temporary associated token account for each user
// const createTemporaryAddress = async (seed) => {
//   const tempAddress = new PublicKey("AHhf2wq98QgjHpjk4XxmY4oGV5inkNMAzwHmE8Cnr6wP");
//   console.log('Temporary Address:', tempAddress.toBase58());
//   return tempAddress;
// };
// const tempKeypair = Keypair.generate();
// console.log('Temporary Address:', tempKeypair.publicKey.toBase58());

// Monitor payments to the temporary address and transfer funds if received within 30 minutes
const monitorPayment = async (tempKeypair, amountLamports, expiryTime) => {
  const checkInterval = 10 * 1000; // Poll every 10 seconds

  const interval = setInterval(async () => {
    const now = new Date();

    if (now >= expiryTime) {
      console.log("Payment request expired.");
      clearInterval(interval);
      return;
    }

    try {
      // Check the balance of the temporary address
      const balance = await connection.getBalance(tempKeypair.publicKey);

      console.log('balance: ', balance);

      if (balance >= amountLamports) {
        console.log("Payment received:", balance / LAMPORTS_PER_SOL, "SOL");
        clearInterval(interval);

        // Transfer the funds to your main wallet
        await transferFunds(tempKeypair, mainKeypair);
        return;
      } else {
        console.log("Waiting for payment...");
      }
    } catch (error) {
      console.error("Error monitoring payment:", error);
    }
  }, checkInterval);
};

// When transferring funds, you will pass the tempKeypair to sign the transaction
const transferFunds = async (tempKeypair, mainKeypair) => {
  try {
    const balance = await connection.getBalance(tempKeypair.publicKey);
    console.log('balance :', balance);

    if (balance > 0) {
      console.log({
        fromPubkey: tempKeypair.publicKey, // Transfer from the temporary address
        toPubkey: mainKeypair.publicKey,   // Transfer to the main wallet
      });

      // Create a transaction to transfer the balance
      let transaction = new Transaction();

      // Transfer all lamports minus fee
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = tempKeypair.publicKey;

      const fee = await connection.getFeeForMessage(transaction.compileMessage());
      const transferAmount = balance - fee.value;

      if (transferAmount <= 0) {
        console.log('Not enough lamports to cover transaction fees');
        return;
      }

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: tempKeypair.publicKey,
          toPubkey: mainKeypair.publicKey,
          lamports: transferAmount,
        })
      );

      // Sign and send the transaction
      const signature = await sendAndConfirmTransaction(connection, transaction, [tempKeypair]);
      console.log('Funds transferred and account closed! Transaction signature:', signature);
    } else {
      console.log('No balance available to transfer.');
    }
  } catch (error) {
    console.error("Error transferring funds:", error);
  }
};

module.exports = {
  monitorPayment,
  transferFunds
};
