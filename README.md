# FITE2010_GP
📌 Overview
This project is a decentralized card-pulling game built on the Ethereum Sepolia blockchain. Players can pull random cards from a deck and import it in their MetaMask account as an NFT. The game leverages smart contracts to ensure transparency and fairness.

🎮 Features
Random Card Pulling: Players can pull random cards from a virtual deck for free.

Card Collection: Each pulled card is stored in the player's wallet as an NFT (ERC-721/ERC-1155).

Rarity System: Cards have different rarities (N, R, SR, SSR, UR).


🛠 Tech Stack
Blockchain: Ethereum Sepolia

Smart Contracts: Solidity, javascript

NFT Standard: ERC-721 / ERC-1155

Randomness: Chainlink VRF / Custom RNG

Development Tools: Hardhat

📂 Project Structure
.  
contracts/             # Smart contracts  
    CardDrawing.sol    # Main card pulling logic    
metadata/              # All images and metadata for NFTs
scripts/
    config.js
    deploy.js
    interact.js
    mintCard.js
test/
    CardDrawing.test.js
CardDrawingABI.json
deployment.json
hardhat.config.js
README.md  

🚀 How to Run
Prerequisites
npm

Hardhat

Metamask wallet

Installation
Clone the repo:

sh
git clone https://github.com/Alice060325/FITE2010_GP.git
cd FITE2010_GP

Install dependencies:
$npm install --save-dev hardhat@2.22.19
@nomicfoundation/hardhat-toolbox
@openzeppelin/contracts@4.7.3 dotenv @alch/alchemy-web3

In the .env file, replace the Private Key and Public Key with the ones of your MetaMask wallet.

Compile contracts:
npx hardhat compile

Deploy to a testnet (e.g., Sepolia):
npx hardhat run scripts/interact.js

Go to your MetaMask wallet and import the card as an NFT.

You can use Etherscan to verify your transactions, here is an example of ours when developing the game: https://sepolia.etherscan.io/address/0x4C3BB5c4C6D5B2c0F20074C468F73B5B7b9ad466

📜 Smart Contract Details
Card Rarity Distribution:

N, R: 50%

SR: 30%

SSR: 15%

UR: 5%

🔒 Security & Audits
OpenZeppelin contracts for secure NFT implementation.
PRNG is used for randomness.

🙌 Credits
Developed by Chow Yan Lok Annette, Fok Ching Yin, Ye Wing Kwan

Inspired by Pokemon TCG App