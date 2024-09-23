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

// Monitor payments to the temporary address and transfer funds if received
const monitorPayment = async (tempKeypair, amountLamports, expiryTime, mainKeypair) => {
  const checkInterval = 10 * 1000; // Poll every 10 seconds

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const now = new Date().getTime();

      if (now >= expiryTime) {
        console.log("Payment request expired.");
        clearInterval(interval);
        return resolve(null); // Indicate that no funds were received within the time frame
      }

      try {
        // Check the balance of the temporary address
        const balance = await connection.getBalance(tempKeypair.publicKey);

        console.log('balance: ', balance);

        if (balance >= amountLamports) {
          console.log("Payment received:", balance / LAMPORTS_PER_SOL, "SOL");
          clearInterval(interval);

          // Transfer the funds to your main wallet
          const signature = await transferFunds(tempKeypair, mainKeypair);
          return resolve(signature); // Return the transaction signature after successful transfer
        } else {
          console.log("Waiting for payment...");
        }
      } catch (error) {
        console.error("Error monitoring payment:", error);
        clearInterval(interval);
        return reject(error); // Reject on error
      }
    }, checkInterval);
  });
};

// Transfer funds from temporary account to main account
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
        return null;
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
      console.log('Funds transferred! Transaction signature:', signature);

      return signature; // Return the transaction signature
    } else {
      console.log('No balance available to transfer.');
      return null;
    }
  } catch (error) {
    console.error("Error transferring funds:", error);
    throw error;
  }
};

module.exports = {
  monitorPayment,
  transferFunds
};
