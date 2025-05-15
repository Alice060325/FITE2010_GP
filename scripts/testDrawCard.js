require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Load deployment details
const deployment = JSON.parse(fs.readFileSync('./deployment.json', 'utf8'));
const contractAddress = deployment.address;
const abi = deployment.abi;

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Initialize contract instance
const contract = new ethers.Contract(contractAddress, abi, wallet);

async function testDrawCard() {
    try {
        console.log("Drawing a random card...");

        // Call the `drawCard` function
        const tx = await contract.drawCard();
        console.log(`Transaction sent: ${tx.hash}`);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        // Find the `CardDrawn` event in the transaction logs
        const cardDrawnEvent = receipt.logs
            .map(log => contract.interface.parseLog(log))
            .find(event => event.name === "CardDrawn");

        if (cardDrawnEvent) {
            const [user, tokenId] = cardDrawnEvent.args;
            console.log(`Card drawn successfully for user: ${user}`);
            console.log(`New Token ID: ${tokenId}`);

            // Fetch and log the card details
            const cardDetails = await contract.getCardDetails(tokenId);
            console.log(`Card Details for Token ID ${tokenId}:`, cardDetails);
        } else {
            console.error("CardDrawn event not found in the logs.");
        }
    } catch (error) {
        console.error("Error drawing card:", error.message);
    }
}

// Run the script
testDrawCard();
