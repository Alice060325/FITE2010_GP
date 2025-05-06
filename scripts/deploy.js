// scripts/deploy.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load ABI and Bytecode
const contractPath = path.join(__dirname, '..', 'contract', 'CardDrawing.sol');
const compiledPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'CardDrawing.sol', 'CardDrawing.json');

async function deployContract() {
    // Read the compiled contract JSON
    const contractJson = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));
    const { abi, bytecode } = contractJson;

    // Initialize provider and wallet
    const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_PROJECT_ID);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Deploying contract...");

    // Create a ContractFactory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Deploy the contract
    const contract = await factory.deploy();

    console.log("Transaction hash:", contract.deployTransaction.hash);

    // Wait for the contract to be mined
    await contract.deployed();

    console.log("Contract deployed at:", contract.address);

    // Optionally, save the contract address and ABI to a file for later use
    const deploymentInfo = {
        address: contract.address,
        abi: abi
    };

    fs.writeFileSync(path.join(__dirname, '..', 'deployment.json'), JSON.stringify(deploymentInfo, null, 2));

    console.log("Deployment information saved to deployment.json");
}

deployContract()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });
