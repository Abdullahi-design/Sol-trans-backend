require('dotenv').config();
const web3 = require("@solana/web3.js");

const {
    Connection,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    clusterApiUrl
} = require('@solana/web3.js');
const { verifyTransaction } = require('./verifyTransaction');
  
// Create a connection to the Devnet
let connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
console.log(connection, 'fine');
// Generate a new keypair for the sender and receiver
const secret = JSON.parse(process.env.SECRET_KEY);
const fromKeypair = web3.Keypair.fromSecretKey(new Uint8Array(secret))
let toKeypair = new web3.PublicKey("FxneRsYEQDDEhy5CiYaZfMMz2GZCLHP65UZo1LiaRsAf");
  
// Airdrop 1 SOL to the sender's wallet for testing purposes
(async () => {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toKeypair,
                lamports: LAMPORTS_PER_SOL / 100, //0.01 SOL
            })
        );
        console.log('Airdrop complete. From Public Key:', fromKeypair.publicKey.toBase58());
    
        //sign transaction, broadcast and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [fromKeypair],
        );

        console.log('Transaction successful! Signature:', signature);

        // Verify the transaction
        await verifyTransaction(signature);
    } catch (error) {
        
    }
})()
  