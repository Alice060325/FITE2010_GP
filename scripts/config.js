// config.js
require('dotenv').config();
const { ethers } = require('ethers');

// Get provider from environment variables
const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_PROJECT_ID);

// Contract ABI and address (replace with your contract's ABI and address)
const contractABI = [
    // Add your contract's ABI here
];
const contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE'; // <-- Replace with your contract address

// Initialize contract
const contract = new ethers.Contract(contractAddress, contractABI, provider);

module.exports = { provider, contract };