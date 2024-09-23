require('dotenv').config();
const web3 = require("@solana/web3.js");

let connection = new web3.Connection(clusterApiUrl("devnet"), 'confirmed');
console.log(connection, 'here');

const secret = JSON.parse(process.env.SECRET_KEY);
const fromKeypair = web3.Keypair.fromSecretKey(new Uint8Array(secret))

//generate random address to send to 
const toKeypair = web3.Keypair.generate();

console.log('token pairs generated:', toKeypair);
(async () => {
    const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toKeypair.publicKey,
            lamports: LAMPORTS_PER_SOL / 100, //0.01 SOL
        })
    );

    //sign transaction, broadcast and confirm
    const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeypair],
    );
    console.log('SIGNATURE', signature);
})