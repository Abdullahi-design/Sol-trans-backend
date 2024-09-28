const { PublicKey, Connection, clusterApiUrl } = require('@solana/web3.js');

const connection = new Connection(clusterApiUrl('devnet')); 

async function recentTransactionsWS({ publicKey }, ws) {
    try {
        const userPublicKey = new PublicKey(publicKey);
        console.log(`Requesting recent transaction from user public key: ${userPublicKey.toBase58()}`);

        // Fetch confirmed transaction signatures list for the provided public key
        const transactionList = await connection.getSignaturesForAddress(userPublicKey, { limit: 3 });

        // Extract the signature list from transactions
        const signatureList = transactionList.map(transaction => transaction.signature);

        // Fetch the detailed transaction information
        const transactionDetails = await connection.getParsedTransactions(signatureList);

        // Collect structured data to send to the frontend
        const structuredTransactionData = transactionList.map((transaction, i) => {
            const date = new Date(transaction.blockTime * 1000);
            const transactionInstructions = transactionDetails[i].transaction.message.instructions.map((instruction, n) => ({
                instructionNumber: n + 1,
                programId: instruction.programId.toString(),
            }));

            return {
                transactionNumber: i + 1,
                signature: transaction.signature,
                time: date.toLocaleString(), // Format the date as a readable string
                status: transaction.confirmationStatus,
                instructions: transactionInstructions
            };
        });

        // Send the structured transaction data to the frontend via WebSocket
        ws.send(JSON.stringify({ transactions: structuredTransactionData }));
        
    } catch (error) {
        console.error('Error during checking:', error.message);
        ws.send(JSON.stringify({ errorMessage: error.message }));
    }
}

module.exports = { recentTransactionsWS };
