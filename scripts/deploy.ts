import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AgentRegistry
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.deployed();
  
  console.log("AgentRegistry deployed to:", agentRegistry.address);

  // Deploy PaymentManager
  // PYUSD contract address on mainnet: 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8
  const PYUSD_ADDRESS = process.env.PYUSD_CONTRACT_ADDRESS || "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
  const FEE_RECIPIENT = deployer.address; // In production, this should be a multisig or DAO
  
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy(PYUSD_ADDRESS, FEE_RECIPIENT);
  await paymentManager.deployed();
  
  console.log("PaymentManager deployed to:", paymentManager.address);
  console.log("PYUSD Token Address:", PYUSD_ADDRESS);
  console.log("Fee Recipient:", FEE_RECIPIENT);

  // Verify contracts on Etherscan (if not on localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await agentRegistry.deployTransaction.wait(6);
    await paymentManager.deployTransaction.wait(6);

    console.log("Verifying AgentRegistry...");
    try {
      await hre.run("verify:verify", {
        address: agentRegistry.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("AgentRegistry verification failed:", error);
    }

    console.log("Verifying PaymentManager...");
    try {
      await hre.run("verify:verify", {
        address: paymentManager.address,
        constructorArguments: [PYUSD_ADDRESS, FEE_RECIPIENT],
      });
    } catch (error) {
      console.log("PaymentManager verification failed:", error);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", network.name);
  console.log("AgentRegistry:", agentRegistry.address);
  console.log("PaymentManager:", paymentManager.address);
  console.log("PYUSD Token:", PYUSD_ADDRESS);
  console.log("Fee Recipient:", FEE_RECIPIENT);
  console.log("Platform Fee: 5%");
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contracts: {
      AgentRegistry: agentRegistry.address,
      PaymentManager: paymentManager.address,
    },
    tokens: {
      PYUSD: PYUSD_ADDRESS,
    },
    feeRecipient: FEE_RECIPIENT,
    platformFee: "5%",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const fs = require('fs');
  const path = require('path');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
