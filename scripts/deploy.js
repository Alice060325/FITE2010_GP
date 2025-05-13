// scripts/deploy.js
require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Confirm the network being deployed to
        const network = await hre.ethers.provider.getNetwork();
        console.log(`Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);

        // Get the ContractFactory and deploy
        const CardDrawing = await hre.ethers.getContractFactory("CardDrawing");
        console.log("Deploying CardDrawing contract...");

        // Deploy the contract
        const cardDrawing = await CardDrawing.deploy();
        await cardDrawing.waitForDeployment(); // Wait for the deployment transaction to complete
        const contractAddress = await cardDrawing.getAddress(); // Get the deployed contract address
        console.log("CardDrawing deployed to:", contractAddress);

        // Prepare the ABI
        const abi = cardDrawing.interface.format('json'); // ABI in JSON format
        console.log("ABI Object:", abi);

        // Prepare deployment information
        const deploymentInfo = {
            address: contractAddress,
            abi: abi,
        };

        // Save deployment information to deployment.json
        try {
            const deploymentPath = path.join(__dirname, '..', 'deployment.json');
            fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
            console.log("Deployment information saved to deployment.json");
        } catch (err) {
            console.error("Error writing to deployment.json:", err);
        }

        // Save ABI to a separate file
        try {
            const abiPath = path.join(__dirname, '..', 'CardDrawingABI.json');
            fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
            console.log("ABI saved to CardDrawingABI.json");
        } catch (err) {
            console.error("Error writing ABI to file:", err);
        }

        // Log the deployment transaction hash
        console.log("Deployment transaction hash:", cardDrawing.deploymentTransaction().hash);

    } catch (error) {
        console.error("Error deploying contract:", error);
        process.exit(1); // Exit with error code
    }
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });
