const { ethers } = require('ethers'); // Import ethers
const { Interface } = ethers; // Correct import for Interface in ethers v6
const { provider, contract } = require('./config');
const metadata = require('../metadata/cardDesigns.json');
const fs = require('fs');
const path = require('path');

// Read deployment info and ABI
const deploymentInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployment.json'), 'utf-8'));
let contractABI = deploymentInfo.abi;

// Parse the ABI if needed
if (typeof contractABI === 'string') {
    contractABI = JSON.parse(contractABI);
}
if (!Array.isArray(contractABI)) {
    throw new Error('Invalid ABI format. Ensure the ABI is an array.');
}

async function mintCard(cardId) {
    if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY environment variable is not set.');
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractWithSigner = contract.connect(wallet);

    const cardMetadata = metadata.cards.find(card => card.id === cardId);
    if (!cardMetadata) {
        console.error(`No metadata found for card ID: ${cardId}`);
        return;
    }

    try {
        console.log(`Minting card with ID: ${cardId}...`);
        const tx = await contractWithSigner.mintCard(wallet.address, cardId);
        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();

        console.log('Transaction receipt logs:', receipt.logs);

        // Initialize Interface with the ABI
        const iface = new Interface(contractABI);
        console.log('Interface initialized successfully.');

        // Decode logs
        const decodedLogs = receipt.logs.map((log) => {
            try {
                return iface.parseLog(log);
            } catch (error) {
                console.warn('Failed to parse log:', log, error.message);
                return null; // Ignore logs that don't match any event in the ABI
            }
        }).filter((event) => event !== null);

        console.log('Decoded logs:', decodedLogs);

        // Find the CardDrawn event
        const cardDrawnEvent = decodedLogs.find(event => event.name === 'CardDrawn');
        if (!cardDrawnEvent) {
            throw new Error('CardDrawn event not found in transaction logs');
        }

        // Access the token ID from the args array
        const tokenId = Number(cardDrawnEvent.args[1]); // Convert BigInt to a number
        console.log(`Card minted successfully with Token ID: ${tokenId}`);

        // Validate and set metadata
        console.log("Setting metadata for the card...");

        // Rarity mapping
        const rarityMapping = {
            N: 1,
            R: 2,
            SR: 3,
            UR: 4,
            SSR: 5
        };

        // Validate and map Rarity attribute
        const rarityAttribute = cardMetadata.attributes.find(attr => attr.trait_type === "Rarity");
        if (!rarityAttribute || !rarityMapping[rarityAttribute.value]) {
            throw new Error(`Invalid or missing Rarity attribute for card ID: ${cardId}`);
        }

        // Get the mapped rarity value
        const rarityValue = rarityMapping[rarityAttribute.value];

        // Call setCardMetadata
        const metadataTx = await contractWithSigner.setCardMetadata(
            tokenId,
            cardMetadata.name,
            cardMetadata.description,
            cardMetadata.image,
            rarityValue
        );
        console.log(`Metadata transaction sent: ${metadataTx.hash}`);
        await metadataTx.wait();
        console.log(`Metadata updated for card ID: ${tokenId}`);
    } catch (error) {
        console.error(`Error minting card: ${error.message}`);
    }
}

// Example usage
mintCard(1);
