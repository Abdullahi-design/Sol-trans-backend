const { LAMPORTS_PER_SOL, Keypair, PublicKey } = require('@solana/web3.js');
const { monitorPayment } = require("./transaction");

let lastSignature = null;

// WebSocket-compatible transferRequest function
async function transferRequestWS({ publicKey, solAmount }, ws) {
    try {
        const secret = JSON.parse(process.env.SECRET_KEY);
        const mainKeypair = Keypair.fromSecretKey(new Uint8Array(secret));
        const userPublicKey = new PublicKey(publicKey);
        console.log(`Requesting ${solAmount} SOL from user public key: ${userPublicKey.toBase58()}`);

        // Generate temporary keypair for payment
        const tempKeypair = Keypair.generate();
        const tempAcc = tempKeypair.publicKey.toBase58();
        console.log('Temporary Address:', tempAcc);

        const amountLamports = solAmount * LAMPORTS_PER_SOL;
        const expiryTime = new Date().getTime() + 30 * 60 * 1000; // 30 minutes expiry time

        // Send initial response to client with tempAcc
        const initialResponse = { message: 'Send SOL here', solAmount, tempAcc };
        ws.send(JSON.stringify(initialResponse));

        // Monitor for incoming payments
        const signature = await monitorPayment(tempKeypair, amountLamports, expiryTime, mainKeypair);

        if (signature) {
            console.log('Transaction success. Signature:', signature);
            lastSignature = signature; // Store signature for potential later use
            ws.send(JSON.stringify({ signature, successMessage: 'Payment confirmed' }));
        } else {
            console.log('Payment request expired or no funds transferred.');
            ws.send(JSON.stringify({ errorMessage: 'No funds transferred or payment expired' }));
        }
    } catch (error) {
        console.error('Error during transfer:', error.message);
        ws.send(JSON.stringify({ errorMessage: error.message }));
    }
}

module.exports = { transferRequestWS };
