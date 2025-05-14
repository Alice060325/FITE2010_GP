const { ethers } = require('ethers');
const { contract } = require('./config');

async function getCardDetails(cardId) {
    try {
        const details = await contract.getCardDetails(cardId);
        console.log(`Card Details for ID ${cardId}:`, details);
    } catch (error) {
        console.error(`Error fetching card details: ${error.message}`);
    }
}

// Fetch the details of card with ID 1
getCardDetails(1);
