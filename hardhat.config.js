require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
    },
    ethereum: {
      url: process.env.ETH_RPC_URL || "https://eth.llamarpc.com",
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  mocha: {
    timeout: 40000,
  },
};