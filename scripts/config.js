// scripts/config.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Get provider from environment variables
const provider = new ethers.providers.InfuraProvider('sepolia', process.env.API_URL);

// Load Deployment Info
const deploymentPath = path.join(__dirname, '..', 'deployment.json');
if (!fs.existsSync(deploymentPath)) {
    console.error("Deployment file not found. Please deploy the contract first.");
    process.exit(1);
}

let deployment;
try {
    deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("Deployment Object:", deployment); // Log deployment object for debugging
} catch (error) {
    console.error("Error reading or parsing deployment.json:", error);
    process.exit(1);
}

const contractABI = deployment.abi;
const contractAddress = deployment.address;

if (!contractAddress) {
    console.error("Contract address is undefined. Ensure the contract was deployed successfully.");
    process.exit(1);
}

// Initialize contract
const contract = new ethers.Contract(contractAddress, contractABI, provider);

module.exports = { provider, contract };