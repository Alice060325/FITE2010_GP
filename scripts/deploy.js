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

    await cardDrawing.deployed();
    console.log("CardDrawing deployed to:", cardDrawing.address);

    // Save deployment information to deployment.json
    const deploymentInfo = {
        address: cardDrawing.address,
        abi: JSON.parse(cardDrawing.interface.format('json'))
    };

    fs.writeFileSync(path.join(__dirname, '..', 'deployment.json'), JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment information saved to deployment.json");
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });
