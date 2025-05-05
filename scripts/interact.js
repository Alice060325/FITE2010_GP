// interact.js
const { ethers } = require('ethers');
const { contract } = require('./config');

async function drawCard() {
    // Get wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractWithSigner = contract.connect(wallet);

    try {
        const tx = await contractWithSigner.drawCard();
        console.log(`Drawing card... Transaction sent: ${tx.hash}`);

        await tx.wait();
        console.log(`Card drawn successfully!`);
    } catch (error) {
        console.error(`Error drawing card: ${error.message}`);
    }
}

async function getCardDetails(cardId) {
    try {
        const details = await contract.getCardDetails(cardId);
        console.log(`Card Details for ID ${cardId}:`, details);
    } catch (error) {
        console.error(`Error fetching card details: ${error.message}`);
    }
}

// Example usage:
// drawCard();
// getCardDetails(1);