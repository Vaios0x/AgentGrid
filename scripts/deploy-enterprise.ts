import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Starting AgentGrid Enterprise Deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deployment configuration
  const ADMIN_ADDRESS = deployer.address;
  const FEE_RECIPIENT = deployer.address;
  const TREASURY_ADDRESS = deployer.address;
  const STAKING_REWARD_ADDRESS = deployer.address;
  const EMERGENCY_WITHDRAW_DELAY = 7 * 24 * 60 * 60; // 7 days
  const DEPLOYMENT_FEE = ethers.parseEther("0.1"); // 0.1 ETH

  try {
    // 1. Deploy AgentRegistry Implementation
    console.log("\n📋 Deploying AgentRegistry Implementation...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistryImpl = await AgentRegistry.deploy();
    await agentRegistryImpl.waitForDeployment();
    console.log("✅ AgentRegistry Implementation deployed to:", await agentRegistryImpl.getAddress());

    // 2. Deploy PaymentManager Implementation
    console.log("\n💰 Deploying PaymentManager Implementation...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManagerImpl = await PaymentManager.deploy();
    await paymentManagerImpl.waitForDeployment();
    console.log("✅ PaymentManager Implementation deployed to:", await paymentManagerImpl.getAddress());

    // 3. Deploy AgentGridFactory
    console.log("\n🏭 Deploying AgentGridFactory...");
    const AgentGridFactory = await ethers.getContractFactory("AgentGridFactory");
    const factory = await AgentGridFactory.deploy(
      ADMIN_ADDRESS,
      DEPLOYMENT_FEE,
      FEE_RECIPIENT
    );
    await factory.waitForDeployment();
    console.log("✅ AgentGridFactory deployed to:", await factory.getAddress());

    // 4. Set implementations in factory
    console.log("\n⚙️ Configuring Factory...");
    await factory.setAgentRegistryImplementation(await agentRegistryImpl.getAddress());
    await factory.setPaymentManagerImplementation(await paymentManagerImpl.getAddress());
    console.log("✅ Factory configured with implementations");

    // 5. Deploy AgentRegistry Proxy
    console.log("\n🔗 Deploying AgentRegistry Proxy...");
    const agentRegistryTx = await factory.deployAgentRegistry(
      ADMIN_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: DEPLOYMENT_FEE }
    );
    const agentRegistryReceipt = await agentRegistryTx.wait();
    const agentRegistryAddress = agentRegistryReceipt?.logs[0].args?.contractAddress || 
      await factory.agentRegistryProxy();
    console.log("✅ AgentRegistry Proxy deployed to:", agentRegistryAddress);

    // 6. Deploy PaymentManager Proxy
    console.log("\n💳 Deploying PaymentManager Proxy...");
    const paymentManagerTx = await factory.deployPaymentManager(
      ADMIN_ADDRESS,
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: DEPLOYMENT_FEE }
    );
    const paymentManagerReceipt = await paymentManagerTx.wait();
    const paymentManagerAddress = paymentManagerReceipt?.logs[0].args?.contractAddress || 
      await factory.paymentManagerProxy();
    console.log("✅ PaymentManager Proxy deployed to:", paymentManagerAddress);

    // 7. Verify contracts (if on a supported network)
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337n) { // Not localhost
      console.log("\n🔍 Verifying contracts...");
      try {
        await hre.run("verify:verify", {
          address: await agentRegistryImpl.getAddress(),
          constructorArguments: [],
        });
        console.log("✅ AgentRegistry Implementation verified");
      } catch (error) {
        console.log("⚠️ AgentRegistry verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: await paymentManagerImpl.getAddress(),
          constructorArguments: [],
        });
        console.log("✅ PaymentManager Implementation verified");
      } catch (error) {
        console.log("⚠️ PaymentManager verification failed:", error);
      }

      try {
        await hre.run("verify:verify", {
          address: await factory.getAddress(),
          constructorArguments: [ADMIN_ADDRESS, DEPLOYMENT_FEE, FEE_RECIPIENT],
        });
        console.log("✅ AgentGridFactory verified");
      } catch (error) {
        console.log("⚠️ AgentGridFactory verification failed:", error);
      }
    }

    // 8. Display deployment summary
    console.log("\n🎉 Deployment Summary:");
    console.log("====================");
    console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("Deployer:", ADMIN_ADDRESS);
    console.log("AgentRegistry Implementation:", await agentRegistryImpl.getAddress());
    console.log("AgentRegistry Proxy:", agentRegistryAddress);
    console.log("PaymentManager Implementation:", await paymentManagerImpl.getAddress());
    console.log("PaymentManager Proxy:", paymentManagerAddress);
    console.log("AgentGridFactory:", await factory.getAddress());
    console.log("Emergency Withdraw Delay:", EMERGENCY_WITHDRAW_DELAY, "seconds");
    console.log("Deployment Fee:", ethers.formatEther(DEPLOYMENT_FEE), "ETH");

    // 9. Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: ADMIN_ADDRESS,
      timestamp: new Date().toISOString(),
      contracts: {
        agentRegistryImplementation: await agentRegistryImpl.getAddress(),
        agentRegistryProxy: agentRegistryAddress,
        paymentManagerImplementation: await paymentManagerImpl.getAddress(),
        paymentManagerProxy: paymentManagerAddress,
        factory: await factory.getAddress()
      },
      configuration: {
        emergencyWithdrawDelay: EMERGENCY_WITHDRAW_DELAY,
        deploymentFee: ethers.formatEther(DEPLOYMENT_FEE),
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
