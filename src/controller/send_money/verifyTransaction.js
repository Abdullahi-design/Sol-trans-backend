const web3 = require("@solana/web3.js");

const {
    Connection
} = require('@solana/web3.js');

const verifyTransaction = async (transactionSignature) => {
    try {
      // Create a connection to the Devnet (or use 'testnet'/'mainnet' as needed)
      let connection = new Connection(web3.clusterApiUrl('devnet'), 'confirmed');
      
      // Fetch transaction status using the transaction signature
      const transactionStatus = await connection.getSignatureStatus(transactionSignature);
  
      // Get full transaction details if needed (optional)
      const transactionDetails = await connection.getTransaction(transactionSignature);
  
      if (transactionStatus.value && transactionStatus.value.confirmationStatus === 'confirmed') {
        console.log('Transaction confirmed:', transactionSignature);
        console.log('Transaction Details:', transactionDetails);
        return { success: true, message: 'Transaction confirmed', details: transactionDetails };
      } else {
        console.log('Transaction not confirmed yet or failed:', transactionSignature);
        return { success: false, message: 'Transaction not confirmed or failed' };
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return { success: false, message: 'Error verifying transaction' };
    }
};

module.exports = { verifyTransaction }