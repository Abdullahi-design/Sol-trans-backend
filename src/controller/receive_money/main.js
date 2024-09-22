const { LAMPORTS_PER_SOL, Keypair, PublicKey } = require('@solana/web3.js');
const { monitorPayment } = require("./transaction");

async function transferRequest(req, res) {

    try {
        const { publicKey, solAmount } = req.body;
        // Load your main wallet's keypair
        const secret = JSON.parse(process.env.SECRET_KEY);
        const mainKeypair = Keypair.fromSecretKey(new Uint8Array(secret));

        // Convert the wallet string input into a Uint8Array for the keypair
        // const mainKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(mainWalletString)));

        // Convert the provided public key string to a PublicKey object
        const userPublicKey = new PublicKey(publicKey);
        console.log(`Transferring ${solAmount} SOL to user public key: ${userPublicKey.toBase58()}`);


        // Generate a temporary keypair for payment monitoring
        const tempKeypair = Keypair.generate();
        console.log('Temporary Address:', tempKeypair.publicKey.toBase58());

        // Set the 30-minute expiry
        const now = new Date();
        const expiryTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

        // Convert SOL amount to lamports
        const amountLamports = solAmount * LAMPORTS_PER_SOL;

        // Monitor for incoming payment
        await monitorPayment(tempKeypair, amountLamports, expiryTime, mainKeypair);

        res.status(200).json({ message: 'Funds transferred!' });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Transfering Funds', error: error.message });
        throw error;
    }

}

module.exports = { transferRequest }