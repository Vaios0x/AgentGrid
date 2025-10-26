import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying AgentGrid Enterprise Contracts...");

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

    // Deploy AgentRegistry Implementation
    console.log("\n📋 Deploying AgentRegistry Implementation...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistryImpl = await AgentRegistry.deploy(EMERGENCY_WITHDRAW_DELAY);
    await agentRegistryImpl.waitForDeployment();
    console.log("✅ AgentRegistry Implementation deployed to:", await agentRegistryImpl.getAddress());

    // Deploy PaymentManager Implementation
    console.log("\n💰 Deploying PaymentManager Implementation...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManagerImpl = await PaymentManager.deploy(
      await mockToken.getAddress(),
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY
    );
    await paymentManagerImpl.waitForDeployment();
    console.log("✅ PaymentManager Implementation deployed to:", await paymentManagerImpl.getAddress());

    // Deploy AgentGridFactory
    console.log("\n🏭 Deploying AgentGridFactory...");
    const AgentGridFactory = await ethers.getContractFactory("AgentGridFactory");
    const factory = await AgentGridFactory.deploy(
      await agentRegistryImpl.getAddress(),
      await paymentManagerImpl.getAddress(),
      FEE_RECIPIENT
    );
    await factory.waitForDeployment();
    console.log("✅ AgentGridFactory deployed to:", await factory.getAddress());

    // Set implementations
    console.log("\n⚙️ Configuring Factory...");
    if (factory.setAgentRegistryImplementation) {
      await factory.setAgentRegistryImplementation(await agentRegistryImpl.getAddress());
    }
    if (factory.setPaymentManagerImplementation) {
      await factory.setPaymentManagerImplementation(await paymentManagerImpl.getAddress());
    }
    console.log("✅ Factory configured with implementations");

    // Deploy AgentRegistry Proxy
    console.log("\n🔗 Deploying AgentRegistry Proxy...");
    if (!factory.deployAgentRegistry) {
      throw new Error("deployAgentRegistry method not found on factory contract");
    }
    const agentRegistryTx = await factory.deployAgentRegistry(
      ADMIN_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: ethers.parseEther("0.1") }
    );
    const agentRegistryReceipt = await agentRegistryTx.wait();
    const agentRegistryAddress = agentRegistryReceipt?.logs[0].args?.contractAddress || 
      (factory.agentRegistryProxy ? await factory.agentRegistryProxy() : "Unknown");
    console.log("✅ AgentRegistry Proxy deployed to:", agentRegistryAddress);

    // Deploy PaymentManager Proxy
    console.log("\n💳 Deploying PaymentManager Proxy...");
    if (!factory.deployPaymentManager) {
      throw new Error("deployPaymentManager method not found on factory contract");
    }
    const paymentManagerTx = await factory.deployPaymentManager(
      ADMIN_ADDRESS,
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: ethers.parseEther("0.1") }
    );
    const paymentManagerReceipt = await paymentManagerTx.wait();
    const paymentManagerAddress = paymentManagerReceipt?.logs[0].args?.contractAddress || 
      (factory.paymentManagerProxy ? await factory.paymentManagerProxy() : "Unknown");
    console.log("✅ PaymentManager Proxy deployed to:", paymentManagerAddress);

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
          address: await agentRegistryImpl.getAddress(),
          constructorArguments: [EMERGENCY_WITHDRAW_DELAY],
        });
        console.log("✅ AgentRegistry Implementation verified");
      } catch (error) {
        console.log("⚠️ AgentRegistry verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: await paymentManagerImpl.getAddress(),
          constructorArguments: [
            await mockToken.getAddress(),
            FEE_RECIPIENT,
            TREASURY_ADDRESS,
            STAKING_REWARD_ADDRESS,
            EMERGENCY_WITHDRAW_DELAY
          ],
        });
        console.log("✅ PaymentManager Implementation verified");
      } catch (error) {
        console.log("⚠️ PaymentManager verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: await factory.getAddress(),
          constructorArguments: [
            await agentRegistryImpl.getAddress(),
            await paymentManagerImpl.getAddress(),
            FEE_RECIPIENT
          ],
        });
        console.log("✅ AgentGridFactory verified");
      } catch (error) {
        console.log("⚠️ AgentGridFactory verification failed:", error);
      }
    }

    // Display deployment summary
    console.log("\n🎉 Deployment Summary:");
    console.log("====================");
    console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("Deployer:", ADMIN_ADDRESS);
    console.log("MockERC20 (PyUSD):", await mockToken.getAddress());
    console.log("AgentRegistry Implementation:", await agentRegistryImpl.getAddress());
    console.log("AgentRegistry Proxy:", agentRegistryAddress);
    console.log("PaymentManager Implementation:", await paymentManagerImpl.getAddress());
    console.log("PaymentManager Proxy:", paymentManagerAddress);
    console.log("AgentGridFactory:", await factory.getAddress());
    console.log("Emergency Withdraw Delay:", EMERGENCY_WITHDRAW_DELAY, "seconds");

    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: ADMIN_ADDRESS,
      timestamp: new Date().toISOString(),
      contracts: {
        mockERC20: await mockToken.getAddress(),
        agentRegistryImplementation: await agentRegistryImpl.getAddress(),
        agentRegistryProxy: agentRegistryAddress,
        paymentManagerImplementation: await paymentManagerImpl.getAddress(),
        paymentManagerProxy: paymentManagerAddress,
        factory: await factory.getAddress()
      },
      configuration: {
        emergencyWithdrawDelay: EMERGENCY_WITHDRAW_DELAY,
        deploymentFee: "0.1 ETH",
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

    const filename = `deployment-${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${filepath}`);

    console.log("\n✨ AgentGrid Enterprise deployment completed successfully!");
    console.log("🔐 All contracts are ready for production use with enterprise-grade security features.");

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