import { ethers, network } from "hardhat";

/**
 * Quick Deploy Script for AgentGrid
 * This script provides a simplified deployment process for testing
 */

async function main() {
  console.log("🚀 Quick Deploy - AgentGrid Enterprise");
  console.log("=" .repeat(50));

  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("❌ No deployer account found");
  }
  
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("🌐 Network:", network.name);
  console.log("");

  // Configuration
  const ADMIN_ADDRESS = deployer.address;
  const EMERGENCY_WITHDRAW_DELAY = 7 * 24 * 60 * 60; // 7 days

  try {
    // 1. Deploy AgentRegistry
    console.log("📋 Deploying AgentRegistry...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log("✅ AgentRegistry deployed to:", agentRegistryAddress);

    // 2. Initialize AgentRegistry
    console.log("⚙️ Initializing AgentRegistry...");
    if (!agentRegistry.initialize) {
      throw new Error("initialize method not found on AgentRegistry contract");
    }
    const initTx = await agentRegistry.initialize(ADMIN_ADDRESS, EMERGENCY_WITHDRAW_DELAY);
    await initTx.wait();
    console.log("✅ AgentRegistry initialized");

    // 3. Deploy PaymentManager
    console.log("💰 Deploying PaymentManager...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy();
    await paymentManager.waitForDeployment();
    const paymentManagerAddress = await paymentManager.getAddress();
    console.log("✅ PaymentManager deployed to:", paymentManagerAddress);

    // 4. Initialize PaymentManager
    console.log("⚙️ Initializing PaymentManager...");
    if (!paymentManager.initialize) {
      throw new Error("initialize method not found on PaymentManager contract");
    }
    const initPaymentTx = await paymentManager.initialize(
      ADMIN_ADDRESS,
      ADMIN_ADDRESS, // fee recipient
      ADMIN_ADDRESS, // treasury
      ADMIN_ADDRESS, // staking reward
      EMERGENCY_WITHDRAW_DELAY
    );
    await initPaymentTx.wait();
    console.log("✅ PaymentManager initialized");

    // 5. Test basic functionality
    console.log("🧪 Testing basic functionality...");
    
    // Test AgentRegistry
    if (agentRegistry.getAgentCount) {
      const agentCount = await agentRegistry.getAgentCount();
      console.log("✅ Agent count:", agentCount.toString());
    } else {
      console.log("⚠️ getAgentCount method not available on AgentRegistry");
    }

    // Test PaymentManager
    if (paymentManager.getPaymentCount) {
      const paymentCount = await paymentManager.getPaymentCount();
      console.log("✅ Payment count:", paymentCount.toString());
    } else {
      console.log("⚠️ getPaymentCount method not available on PaymentManager");
    }

    // 6. Display summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 QUICK DEPLOY SUMMARY");
    console.log("=".repeat(50));
    console.log("🌐 Network:", network.name);
    console.log("👤 Deployer:", ADMIN_ADDRESS);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("");
    console.log("📋 CONTRACTS:");
    console.log("AgentRegistry:", agentRegistryAddress);
    console.log("PaymentManager:", paymentManagerAddress);
    console.log("");
    console.log("✨ Quick deployment completed successfully!");
    console.log("🔐 Contracts are ready for testing.");

    // Save addresses to file
    const fs = require('fs');
    const path = require('path');
    
    const addresses = {
      network: network.name,
      chainId: network.config.chainId,
      deployer: ADMIN_ADDRESS,
      timestamp: new Date().toISOString(),
      contracts: {
        agentRegistry: agentRegistryAddress,
        paymentManager: paymentManagerAddress
      }
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `quick-deploy-${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(addresses, null, 2));
    console.log(`\n💾 Addresses saved to: ${filepath}`);

  } catch (error) {
    console.error("❌ Quick deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
