// scripts/deploy.js
require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    // Confirm the network being deployed to
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get the ContractFactory and deploy
    const CardDrawing = await hre.ethers.getContractFactory("CardDrawing");
    console.log("Deploying CardDrawing contract...");

    const cardDrawing = await CardDrawing.deploy();
    await cardDrawing.waitForDeployment();
    console.log("CardDrawing deployed to:", cardDrawing.address);

    // Prepare deployment information
    let abi;
    try {
        abi = cardDrawing.interface.format('full'); // Use 'full' to get the complete ABI object
        console.log("ABI Object:", abi); // Log the ABI output

        // Check if abi is a string and parse it if necessary
        if (typeof abi === 'string') {
            abi = JSON.parse(abi);
        }

    } catch (err) {
        console.error("Error formatting ABI:", err);
        return; // Exit if there's an error
    }

    const deploymentInfo = {
        address: cardDrawing.address,
        abi: abi // Use the formatted ABI
    };

    // Save deployment information to deployment.json
    try {
        fs.writeFileSync(path.join(__dirname, '..', 'deployment.json'), JSON.stringify(deploymentInfo, null, 2));
        console.log("Deployment information saved to deployment.json");
    } catch (err) {
        console.error("Error writing to deployment.json:", err);
    }

    // Save ABI to a separate file
    try {
        fs.writeFileSync(path.join(__dirname, '..', 'CardDrawingABI.json'), JSON.stringify(abi, null, 2));
        console.log("ABI saved to CardDrawingABI.json");
    } catch (err) {
        console.error("Error writing ABI to file:", err);
    }
    console.log("CardDrawing contract deployment transaction:", cardDrawing.deployTransaction);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });
    