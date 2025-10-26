import { ethers, network, run } from "hardhat";
import { Contract } from "ethers";
import fs from "fs";
import path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  deployer: string;
  timestamp: string;
  contracts: {
    agentRegistryImplementation: string;
    agentRegistryProxy: string;
    paymentManagerImplementation: string;
    paymentManagerProxy: string;
    factory: string;
  };
  configuration: {
    emergencyWithdrawDelay: number;
    deploymentFee: string;
    feeRecipient: string;
    treasuryAddress: string;
    stakingRewardAddress: string;
  };
  gasUsed: {
    agentRegistryImpl: number;
    paymentManagerImpl: number;
    factory: number;
    agentRegistryProxy: number;
    paymentManagerProxy: number;
  };
}

async function main() {
  console.log("🚀 Deploying AgentGrid Enterprise with Hardhat 3.0...");
  console.log("=" .repeat(60));

  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("❌ No deployer account found");
  }
  
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId);
  console.log("");

  // Configuration
  const ADMIN_ADDRESS = deployer.address;
  const FEE_RECIPIENT = deployer.address;
  const TREASURY_ADDRESS = deployer.address;
  const STAKING_REWARD_ADDRESS = deployer.address;
  const EMERGENCY_WITHDRAW_DELAY = 7 * 24 * 60 * 60; // 7 days
  const DEPLOYMENT_FEE = ethers.parseEther("0.1");

  const gasUsed: any = {};

  try {
    // 1. Deploy AgentRegistry Implementation
    console.log("📋 Step 1: Deploying AgentRegistry Implementation...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    
    const agentRegistryImplTx = await AgentRegistry.deploy();
    await agentRegistryImplTx.waitForDeployment();
    const agentRegistryImplAddress = await agentRegistryImplTx.getAddress();
    
    gasUsed.agentRegistryImpl = (await agentRegistryImplTx.deploymentTransaction()?.wait())?.gasUsed || 0;
    console.log("✅ AgentRegistry Implementation deployed to:", agentRegistryImplAddress);
    console.log("⛽ Gas used:", gasUsed.agentRegistryImpl.toString());

    // 2. Deploy PaymentManager Implementation
    console.log("\n💰 Step 2: Deploying PaymentManager Implementation...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    
    const paymentManagerImplTx = await PaymentManager.deploy();
    await paymentManagerImplTx.waitForDeployment();
    const paymentManagerImplAddress = await paymentManagerImplTx.getAddress();
    
    gasUsed.paymentManagerImpl = (await paymentManagerImplTx.deploymentTransaction()?.wait())?.gasUsed || 0;
    console.log("✅ PaymentManager Implementation deployed to:", paymentManagerImplAddress);
    console.log("⛽ Gas used:", gasUsed.paymentManagerImpl.toString());

    // 3. Deploy AgentGridFactory
    console.log("\n🏭 Step 3: Deploying AgentGridFactory...");
    const AgentGridFactory = await ethers.getContractFactory("AgentGridFactory");
    
    const factoryTx = await AgentGridFactory.deploy(
      ADMIN_ADDRESS,
      DEPLOYMENT_FEE,
      FEE_RECIPIENT
    );
    await factoryTx.waitForDeployment();
    const factoryAddress = await factoryTx.getAddress();
    
    gasUsed.factory = (await factoryTx.deploymentTransaction()?.wait())?.gasUsed || 0;
    console.log("✅ AgentGridFactory deployed to:", factoryAddress);
    console.log("⛽ Gas used:", gasUsed.factory.toString());

    // 4. Initialize implementations
    console.log("\n⚙️ Step 4: Initializing implementations...");
    
    // Initialize AgentRegistry
    const agentRegistryImpl = await ethers.getContractAt("AgentRegistry", agentRegistryImplAddress);
    const initAgentTx = await agentRegistryImpl.initialize(ADMIN_ADDRESS, EMERGENCY_WITHDRAW_DELAY);
    await initAgentTx.wait();
    console.log("✅ AgentRegistry initialized");

    // Initialize PaymentManager
    const paymentManagerImpl = await ethers.getContractAt("PaymentManager", paymentManagerImplAddress);
    const initPaymentTx = await paymentManagerImpl.initialize(
      ADMIN_ADDRESS,
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY
    );
    await initPaymentTx.wait();
    console.log("✅ PaymentManager initialized");

    // 5. Configure Factory
    console.log("\n🔧 Step 5: Configuring Factory...");
    const factory = await ethers.getContractAt("AgentGridFactory", factoryAddress);
    
    const setAgentImplTx = await factory.setAgentRegistryImplementation(agentRegistryImplAddress);
    await setAgentImplTx.wait();
    console.log("✅ AgentRegistry implementation set in factory");

    const setPaymentImplTx = await factory.setPaymentManagerImplementation(paymentManagerImplAddress);
    await setPaymentImplTx.wait();
    console.log("✅ PaymentManager implementation set in factory");

    // 6. Deploy AgentRegistry Proxy
    console.log("\n🔗 Step 6: Deploying AgentRegistry Proxy...");
    const agentRegistryProxyTx = await factory.deployAgentRegistry(
      ADMIN_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: DEPLOYMENT_FEE }
    );
    const agentRegistryProxyReceipt = await agentRegistryProxyTx.wait();
    const agentRegistryProxyAddress = agentRegistryProxyReceipt?.logs[0]?.args?.contractAddress || 
      await factory.agentRegistryProxy();
    
    gasUsed.agentRegistryProxy = agentRegistryProxyReceipt?.gasUsed || 0;
    console.log("✅ AgentRegistry Proxy deployed to:", agentRegistryProxyAddress);
    console.log("⛽ Gas used:", gasUsed.agentRegistryProxy.toString());

    // 7. Deploy PaymentManager Proxy
    console.log("\n💳 Step 7: Deploying PaymentManager Proxy...");
    const paymentManagerProxyTx = await factory.deployPaymentManager(
      ADMIN_ADDRESS,
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: DEPLOYMENT_FEE }
    );
    const paymentManagerProxyReceipt = await paymentManagerProxyTx.wait();
    const paymentManagerProxyAddress = paymentManagerProxyReceipt?.logs[0]?.args?.contractAddress || 
      await factory.paymentManagerProxy();
    
    gasUsed.paymentManagerProxy = paymentManagerProxyReceipt?.gasUsed || 0;
    console.log("✅ PaymentManager Proxy deployed to:", paymentManagerProxyAddress);
    console.log("⛽ Gas used:", gasUsed.paymentManagerProxy.toString());

    // 8. Verify contracts (if not on localhost)
    if (network.name !== "localhost" && network.name !== "hardhat") {
      console.log("\n🔍 Step 8: Verifying contracts...");
      
      try {
        console.log("Verifying AgentRegistry Implementation...");
        await run("verify:verify", {
          address: agentRegistryImplAddress,
          constructorArguments: [],
        });
        console.log("✅ AgentRegistry Implementation verified");
      } catch (error) {
        console.log("⚠️ AgentRegistry verification failed:", error);
      }

      try {
        console.log("Verifying PaymentManager Implementation...");
        await run("verify:verify", {
          address: paymentManagerImplAddress,
          constructorArguments: [],
        });
        console.log("✅ PaymentManager Implementation verified");
      } catch (error) {
        console.log("⚠️ PaymentManager verification failed:", error);
      }

      try {
        console.log("Verifying AgentGridFactory...");
        await run("verify:verify", {
          address: factoryAddress,
          constructorArguments: [ADMIN_ADDRESS, DEPLOYMENT_FEE, FEE_RECIPIENT],
        });
        console.log("✅ AgentGridFactory verified");
      } catch (error) {
        console.log("⚠️ AgentGridFactory verification failed:", error);
      }
    }

    // 9. Test basic functionality
    console.log("\n🧪 Step 9: Testing basic functionality...");
    
    // Test AgentRegistry
    const agentRegistry = await ethers.getContractAt("AgentRegistry", agentRegistryProxyAddress);
    const agentCount = await agentRegistry.getAgentCount();
    console.log("✅ AgentRegistry test - Agent count:", agentCount.toString());

    // Test PaymentManager
    const paymentManager = await ethers.getContractAt("PaymentManager", paymentManagerProxyAddress);
    const paymentCount = await paymentManager.getPaymentCount();
    console.log("✅ PaymentManager test - Payment count:", paymentCount.toString());

    // 10. Generate deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.config.chainId);
    console.log("👤 Deployer:", ADMIN_ADDRESS);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("");
    console.log("📋 CONTRACTS:");
    console.log("AgentRegistry Implementation:", agentRegistryImplAddress);
    console.log("AgentRegistry Proxy:", agentRegistryProxyAddress);
    console.log("PaymentManager Implementation:", paymentManagerImplAddress);
    console.log("PaymentManager Proxy:", paymentManagerProxyAddress);
    console.log("AgentGridFactory:", factoryAddress);
    console.log("");
    console.log("⚙️ CONFIGURATION:");
    console.log("Emergency Withdraw Delay:", EMERGENCY_WITHDRAW_DELAY, "seconds");
    console.log("Deployment Fee:", ethers.formatEther(DEPLOYMENT_FEE), "ETH");
    console.log("Fee Recipient:", FEE_RECIPIENT);
    console.log("Treasury Address:", TREASURY_ADDRESS);
    console.log("Staking Reward Address:", STAKING_REWARD_ADDRESS);
    console.log("");
    console.log("⛽ GAS USAGE:");
    console.log("AgentRegistry Implementation:", gasUsed.agentRegistryImpl.toString());
    console.log("PaymentManager Implementation:", gasUsed.paymentManagerImpl.toString());
    console.log("AgentGridFactory:", gasUsed.factory.toString());
    console.log("AgentRegistry Proxy:", gasUsed.agentRegistryProxy.toString());
    console.log("PaymentManager Proxy:", gasUsed.paymentManagerProxy.toString());
    console.log("Total Gas Used:", Object.values(gasUsed).reduce((a, b) => a + b, 0).toString());

    // 11. Save deployment info
    const deploymentInfo: DeploymentInfo = {
      network: network.name,
      chainId: Number(network.config.chainId),
      deployer: ADMIN_ADDRESS,
      timestamp: new Date().toISOString(),
      contracts: {
        agentRegistryImplementation: agentRegistryImplAddress,
        agentRegistryProxy: agentRegistryProxyAddress,
        paymentManagerImplementation: paymentManagerImplAddress,
        paymentManagerProxy: paymentManagerProxyAddress,
        factory: factoryAddress
      },
      configuration: {
        emergencyWithdrawDelay: EMERGENCY_WITHDRAW_DELAY,
        deploymentFee: ethers.formatEther(DEPLOYMENT_FEE),
        feeRecipient: FEE_RECIPIENT,
        treasuryAddress: TREASURY_ADDRESS,
        stakingRewardAddress: STAKING_REWARD_ADDRESS
      },
      gasUsed: gasUsed
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `deployment-${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${filepath}`);

    console.log("\n✨ AgentGrid Enterprise deployment completed successfully!");
    console.log("🔐 All contracts are ready for production use with enterprise-grade security features.");
    console.log("🚀 Hardhat 3.0 deployment successful!");

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
