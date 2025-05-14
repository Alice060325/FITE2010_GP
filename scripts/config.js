require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load deployment information
const deploymentInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployment.json'), 'utf-8'));
const contractAddress = deploymentInfo.address;
let contractABI = deploymentInfo.abi;

// Parse ABI if it’s a string (edge case)
if (typeof contractABI === 'string') {
    contractABI = JSON.parse(contractABI);
}

// Get provider from environment variables
const provider = new ethers.JsonRpcProvider(process.env.API_URL);

// Initialize contract
const contract = new ethers.Contract(contractAddress, contractABI, provider);

module.exports = { provider, contract };
