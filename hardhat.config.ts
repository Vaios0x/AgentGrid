import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { HEDERA_ACCOUNTS, HEDERA_NETWORKS, HEDERA_CONFIG } from "./config/hedera";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "u"
          }
        }
      },
      viaIR: true,
      evmVersion: "shanghai"
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      // forking: {
      //   url: process.env.ETH_RPC_URL || "https://eth.llamarpc.com",
      //   blockNumber: 19500000, // Pin to specific block for consistent testing
      // },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Testnets
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/R-rmhTU0BMCn2NdDHZUhj",
      chainId: 11155111,
      accounts: ["9ddfdc054d4b07b7afc45b1f5e95878a04eacbc2a23b1c95d3d9a0f3ad493ebc"],
      gasPrice: 20000000000, // 20 gwei
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 5,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
      gasPrice: 20000000000,
    },
    // Mainnets
    ethereum: {
      url: process.env.ETH_RPC_URL || "https://eth.llamarpc.com",
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
      gasPrice: 20000000000,
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
      gasPrice: 100000000, // 0.1 gwei
    },
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
      chainId: 10,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
      gasPrice: 1000000, // 0.001 gwei
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
      gasPrice: 1000000,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      chainId: 137,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
      gasPrice: 30000000000, // 30 gwei
    },
    // L2 Testnets
    arbitrum_sepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
    },
    optimism_sepolia: {
      url: process.env.OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
      chainId: 11155420,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
    },
    base_sepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      chainId: 84532,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450"],
    },
    // Hedera Networks
    hedera_testnet: {
      url: HEDERA_NETWORKS.testnet.url,
      chainId: HEDERA_NETWORKS.testnet.chainId,
      accounts: [
        HEDERA_ACCOUNTS.ecdsa.privateKey,
        HEDERA_ACCOUNTS.ed25519.privateKey
      ],
      gasPrice: HEDERA_CONFIG.gasPrice,
      gas: HEDERA_CONFIG.gasLimit,
    },
    hedera_mainnet: {
      url: HEDERA_NETWORKS.mainnet.url,
      chainId: HEDERA_NETWORKS.mainnet.chainId,
      accounts: [
        HEDERA_ACCOUNTS.ecdsa.privateKey,
        HEDERA_ACCOUNTS.ed25519.privateKey
      ],
      gasPrice: HEDERA_CONFIG.gasPrice,
      gas: HEDERA_CONFIG.gasLimit,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
