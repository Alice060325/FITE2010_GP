require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
module.exports = {
   solidity: "0.8.18",
   defaultNetwork: "sepolia",
   networks: {
      sepolia: {
         url: process.env.API_URL,
         accounts: [process.env.PRIVATE_KEY]
      },
   },
}
