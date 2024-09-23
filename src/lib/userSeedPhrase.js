function userSeedPhrase() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let accountReference = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        accountReference += characters.charAt(randomIndex);
    }
    return `seed-${accountReference}`; 
}

module.exports = { userSeedPhrase};
