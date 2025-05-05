// mintCard.js
const { ethers } = require('ethers');
const { contract } = require('./config');

async function mintCard(cardId) {
    // Get wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Connect contract with wallet
    const contractWithSigner = contract.connect(wallet);

    try {
        const tx = await contractWithSigner.mintCard(wallet.address, cardId);
        console.log(`Transaction sent: ${tx.hash}`);

        // Wait for transaction to be confirmed
        await tx.wait();
        console.log(`Card minted successfully! Card ID: ${cardId}`);
    } catch (error) {
        console.error(`Error minting card: ${error.message}`);
    }
}

// Example usage: mint a card with ID 1
// mintCard(1);