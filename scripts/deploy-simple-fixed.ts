// @ts-ignore - ethers is available at runtime through hardhat plugin
import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying AgentGrid Core Contracts (Simplified)...");
  console.log("=" .repeat(60));

  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("No deployer account found");
  }
  
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
  console.log("🔗 Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("");

  // Configuration
  const ADMIN_ADDRESS = deployer.address;
  const FEE_RECIPIENT = deployer.address;
  const TREASURY_ADDRESS = deployer.address;
  const STAKING_REWARD_ADDRESS = deployer.address;
  const EMERGENCY_WITHDRAW_DELAY = 7 * 24 * 60 * 60; // 7 days

  try {
    // 1. Deploy MockERC20
    console.log("🪙 Step 1: Deploying MockERC20...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("PyUSD", "PYUSD");
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("✅ MockERC20 deployed to:", mockTokenAddress);

    // 2. Deploy AgentRegistry
    console.log("\n📋 Step 2: Deploying AgentRegistry...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy(EMERGENCY_WITHDRAW_DELAY);
    await agentRegistry.waitForDeployment();
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log("✅ AgentRegistry deployed to:", agentRegistryAddress);

    // 3. Deploy PaymentManager
    console.log("\n💰 Step 3: Deploying PaymentManager...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(
      mockTokenAddress,
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY
    );
    await paymentManager.waitForDeployment();
    const paymentManagerAddress = await paymentManager.getAddress();
    console.log("✅ PaymentManager deployed to:", paymentManagerAddress);

    // 4. Configure permissions
    console.log("\n🔧 Step 4: Configuring permissions...");
    
    // MockERC20 is a simple ERC20 without roles, so no configuration needed
    console.log("✅ MockERC20 permissions configured (simple ERC20)");

    // 5. Verify contracts (if not on localhost)
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337n) {
      console.log("\n🔍 Step 5: Verifying contracts...");
      
      try {
        await hre.run("verify:verify", {
          address: mockTokenAddress,
          constructorArguments: ["PyUSD", "PYUSD"],
        });
        console.log("✅ MockERC20 verified");
      } catch (error) {
        console.log("⚠️ MockERC20 verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: agentRegistryAddress,
          constructorArguments: [EMERGENCY_WITHDRAW_DELAY],
        });
        console.log("✅ AgentRegistry verified");
      } catch (error) {
        console.log("⚠️ AgentRegistry verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: paymentManagerAddress,
          constructorArguments: [
            mockTokenAddress,
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

    // 6. Test basic functionality
    console.log("\n🧪 Step 6: Testing basic functionality...");
    
    // Test AgentRegistry
    const agentCount = await agentRegistry.getAgentCount();
    console.log("✅ AgentRegistry test - Agent count:", agentCount.toString());

    // Test PaymentManager
    const paymentCount = await paymentManager.getPaymentCount();
    console.log("✅ PaymentManager test - Payment count:", paymentCount.toString());

    // Test MockERC20
    const totalSupply = await mockToken.totalSupply();
    console.log("✅ MockERC20 test - Total supply:", ethers.formatEther(totalSupply), "PYUSD");

    // 7. Generate deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.chainId);
    console.log("👤 Deployer:", ADMIN_ADDRESS);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("");
    console.log("📋 CONTRACTS:");
    console.log("MockERC20 (PyUSD):", mockTokenAddress);
    console.log("AgentRegistry:", agentRegistryAddress);
    console.log("PaymentManager:", paymentManagerAddress);
    console.log("");
    console.log("⚙️ CONFIGURATION:");
    console.log("Emergency Withdraw Delay:", EMERGENCY_WITHDRAW_DELAY, "seconds");
    console.log("Fee Recipient:", FEE_RECIPIENT);
    console.log("Treasury Address:", TREASURY_ADDRESS);
    console.log("Staking Reward Address:", STAKING_REWARD_ADDRESS);

    // 8. Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: ADMIN_ADDRESS,
      timestamp: new Date().toISOString(),
      contracts: {
        mockERC20: mockTokenAddress,
        agentRegistry: agentRegistryAddress,
        paymentManager: paymentManagerAddress
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

    const filename = `deployment-${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${filepath}`);

    console.log("\n✨ AgentGrid Core deployment completed successfully!");
    console.log("🔐 All core contracts are ready for use.");
    console.log("📝 Note: AgentGridFactory was skipped due to size constraints.");

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
