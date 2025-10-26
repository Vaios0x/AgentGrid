import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying AgentGrid Contracts to Sepolia...");

  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("No deployer account found");
  }
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Configuration
  const ADMIN_ADDRESS = deployer.address;
  const FEE_RECIPIENT = deployer.address;
  const TREASURY_ADDRESS = deployer.address;
  const STAKING_REWARD_ADDRESS = deployer.address;
  const EMERGENCY_WITHDRAW_DELAY = 7 * 24 * 60 * 60; // 7 days

  try {
    // Deploy MockERC20 for testing
    console.log("\n🪙 Deploying MockERC20...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("PyUSD", "PYUSD");
    await mockToken.waitForDeployment();
    console.log("✅ MockERC20 deployed to:", await mockToken.getAddress());

    // Deploy AgentRegistry
    console.log("\n📋 Deploying AgentRegistry...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy(EMERGENCY_WITHDRAW_DELAY);
    await agentRegistry.waitForDeployment();
    console.log("✅ AgentRegistry deployed to:", await agentRegistry.getAddress());

    // Deploy PaymentManager
    console.log("\n💰 Deploying PaymentManager...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(
      await mockToken.getAddress(),
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY
    );
    await paymentManager.waitForDeployment();
    console.log("✅ PaymentManager deployed to:", await paymentManager.getAddress());

    // Verify contracts (if on a supported network)
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337n) { // Not localhost
      console.log("\n🔍 Verifying contracts...");
      try {
        await hre.run("verify:verify", {
          address: await mockToken.getAddress(),
          constructorArguments: ["PyUSD", "PYUSD"],
        });
        console.log("✅ MockERC20 verified");
      } catch (error) {
        console.log("⚠️ MockERC20 verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: await agentRegistry.getAddress(),
          constructorArguments: [EMERGENCY_WITHDRAW_DELAY],
        });
        console.log("✅ AgentRegistry verified");
      } catch (error) {
        console.log("⚠️ AgentRegistry verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: await paymentManager.getAddress(),
          constructorArguments: [
            await mockToken.getAddress(),
            FEE_RECIPIENT,
            TREASURY_ADDRESS,
            STAKING_REWARD_ADDRESS,
            EMERGENCY_WITHDRAW_DELAY
          ],
        });
        console.log("✅ PaymentManager verified");
      } catch (error) {
        console.log("⚠️ PaymentManager verification failed:", error);
      }
    }

    // Display deployment summary
    console.log("\n🎉 Deployment Summary:");
    console.log("====================");
    console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("Deployer:", ADMIN_ADDRESS);
    console.log("MockERC20 (PyUSD):", await mockToken.getAddress());
    console.log("AgentRegistry:", await agentRegistry.getAddress());
    console.log("PaymentManager:", await paymentManager.getAddress());
    console.log("Emergency Withdraw Delay:", EMERGENCY_WITHDRAW_DELAY, "seconds");

    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: ADMIN_ADDRESS,
      timestamp: new Date().toISOString(),
      contracts: {
        mockERC20: await mockToken.getAddress(),
        agentRegistry: await agentRegistry.getAddress(),
        paymentManager: await paymentManager.getAddress()
      },
      configuration: {
        emergencyWithdrawDelay: EMERGENCY_WITHDRAW_DELAY,
        feeRecipient: FEE_RECIPIENT,
        treasuryAddress: TREASURY_ADDRESS,
        stakingRewardAddress: STAKING_REWARD_ADDRESS
      }
    };

    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `deployment-sepolia-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${filepath}`);

    console.log("\n✨ AgentGrid deployment completed successfully!");
    console.log("🔗 View on Sepolia Etherscan:");
    console.log(`   MockERC20: https://sepolia.etherscan.io/address/${await mockToken.getAddress()}`);
    console.log(`   AgentRegistry: https://sepolia.etherscan.io/address/${await agentRegistry.getAddress()}`);
    console.log(`   PaymentManager: https://sepolia.etherscan.io/address/${await paymentManager.getAddress()}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
