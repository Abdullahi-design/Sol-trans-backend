const { LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');
// const { userSeedPhrase } = require("../lib/userSeedPhrase");
const { monitorPayment } = require("./transaction");

(async () => {
    // const userSeed = userSeedPhrase();
    // console.log(userSeed);
    // const tempAddress = await createTemporaryAddress(userSeed);
    const tempKeypair = Keypair.generate();
    console.log('Temporary Address:', tempKeypair.publicKey.toBase58());
  
    // Set the 30-minute expiry
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
  
    // Amount to be sent in lamports
    const amountLamports = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
  
    // Monitor for incoming payment
    await monitorPayment(tempKeypair, amountLamports, expiryTime);
})();
