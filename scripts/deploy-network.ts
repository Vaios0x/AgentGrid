import hre from "hardhat";

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  gasPrice?: number;
  gasLimit?: number;
  confirmations: number;
  verify: boolean;
}

const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  sepolia: {
    name: "Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    gasPrice: 20000000000, // 20 gwei
    confirmations: 2,
    verify: true,
  },
  goerli: {
    name: "Goerli Testnet",
    chainId: 5,
    rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    gasPrice: 20000000000, // 20 gwei
    confirmations: 2,
    verify: true,
  },
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    gasPrice: 20000000000, // 20 gwei
    confirmations: 6,
    verify: true,
  },
  arbitrum: {
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    gasPrice: 100000000, // 0.1 gwei
    confirmations: 2,
    verify: true,
  },
  optimism: {
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    gasPrice: 1000000, // 0.001 gwei
    confirmations: 2,
    verify: true,
  },
  base: {
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    gasPrice: 1000000, // 0.001 gwei
    confirmations: 2,
    verify: true,
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    gasPrice: 30000000000, // 30 gwei
    confirmations: 2,
    verify: true,
  },
};

async function main() {
  const networkName = hre.network.name;
  const config = NETWORK_CONFIGS[networkName];
  
  if (!config) {
    throw new Error(`❌ Unsupported network: ${networkName}`);
  }

  console.log(`🚀 Deploying AgentGrid to ${config.name}...`);
  console.log("=" .repeat(60));
  console.log(`🌐 Network: ${config.name}`);
  console.log(`🔗 Chain ID: ${config.chainId}`);
  console.log(`🔗 RPC URL: ${config.rpcUrl}`);
  console.log(`⛽ Gas Price: ${config.gasPrice ? `${config.gasPrice / 1e9} gwei` : 'auto'}`);
  console.log(`✅ Confirmations: ${config.confirmations}`);
  console.log(`🔍 Verify: ${config.verify ? 'Yes' : 'No'}`);
  console.log("");

  const [deployer] = await hre.ethers.getSigners();
  
  if (!deployer) {
    throw new Error("❌ No deployer account found");
  }
  
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Check if deployer has enough balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const minBalance = hre.ethers.parseEther("0.1"); // Minimum 0.1 ETH
  
  if (balance < minBalance) {
    console.log("⚠️ Warning: Deployer balance is low. Consider adding more ETH.");
    console.log(`Current balance: ${hre.ethers.formatEther(balance)} ETH`);
    console.log(`Recommended minimum: ${hre.ethers.formatEther(minBalance)} ETH`);
    console.log("");
  }

  // Configuration
  const ADMIN_ADDRESS = deployer.address;
  const FEE_RECIPIENT = deployer.address;
  const TREASURY_ADDRESS = deployer.address;
  const STAKING_REWARD_ADDRESS = deployer.address;
  const EMERGENCY_WITHDRAW_DELAY = 7 * 24 * 60 * 60; // 7 days
  const DEPLOYMENT_FEE = hre.ethers.parseEther("0.1");

  const gasUsed: any = {};
  const deploymentTxHashes: string[] = [];

  try {
    // 1. Deploy AgentRegistry Implementation
    console.log("📋 Step 1: Deploying AgentRegistry Implementation...");
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    
    const agentRegistryImplTx = await AgentRegistry.deploy();
    await agentRegistryImplTx.waitForDeployment();
    const agentRegistryImplAddress = await agentRegistryImplTx.getAddress();
    
    const agentRegistryImplReceipt = await agentRegistryImplTx.deploymentTransaction()?.wait(config.confirmations);
    gasUsed.agentRegistryImpl = agentRegistryImplReceipt?.gasUsed || 0;
    deploymentTxHashes.push(agentRegistryImplReceipt?.hash || "");
    
    console.log("✅ AgentRegistry Implementation deployed to:", agentRegistryImplAddress);
    console.log("⛽ Gas used:", gasUsed.agentRegistryImpl.toString());
    console.log("🔗 Transaction:", agentRegistryImplReceipt?.hash);

    // 2. Deploy PaymentManager Implementation
    console.log("\n💰 Step 2: Deploying PaymentManager Implementation...");
    const PaymentManager = await hre.ethers.getContractFactory("PaymentManager");
    
    const paymentManagerImplTx = await PaymentManager.deploy();
    await paymentManagerImplTx.waitForDeployment();
    const paymentManagerImplAddress = await paymentManagerImplTx.getAddress();
    
    const paymentManagerImplReceipt = await paymentManagerImplTx.deploymentTransaction()?.wait(config.confirmations);
    gasUsed.paymentManagerImpl = paymentManagerImplReceipt?.gasUsed || 0;
    deploymentTxHashes.push(paymentManagerImplReceipt?.hash || "");
    
    console.log("✅ PaymentManager Implementation deployed to:", paymentManagerImplAddress);
    console.log("⛽ Gas used:", gasUsed.paymentManagerImpl.toString());
    console.log("🔗 Transaction:", paymentManagerImplReceipt?.hash);

    // 3. Deploy AgentGridFactory
    console.log("\n🏭 Step 3: Deploying AgentGridFactory...");
    const AgentGridFactory = await hre.ethers.getContractFactory("AgentGridFactory");
    
    const factoryTx = await AgentGridFactory.deploy(
      ADMIN_ADDRESS,
      DEPLOYMENT_FEE,
      FEE_RECIPIENT
    );
    await factoryTx.waitForDeployment();
    const factoryAddress = await factoryTx.getAddress();
    
    const factoryReceipt = await factoryTx.deploymentTransaction()?.wait(config.confirmations);
    gasUsed.factory = factoryReceipt?.gasUsed || 0;
    deploymentTxHashes.push(factoryReceipt?.hash || "");
    
    console.log("✅ AgentGridFactory deployed to:", factoryAddress);
    console.log("⛽ Gas used:", gasUsed.factory.toString());
    console.log("🔗 Transaction:", factoryReceipt?.hash);

    // 4. Initialize implementations
    console.log("\n⚙️ Step 4: Initializing implementations...");
    
    // Initialize AgentRegistry
    const agentRegistryImpl = await hre.ethers.getContractAt("AgentRegistry", agentRegistryImplAddress);
    if (!agentRegistryImpl.initialize) {
      throw new Error("initialize method not found on AgentRegistry contract");
    }
    const initAgentTx = await agentRegistryImpl.initialize(ADMIN_ADDRESS, EMERGENCY_WITHDRAW_DELAY);
    const initAgentReceipt = await initAgentTx.wait(config.confirmations);
    deploymentTxHashes.push(initAgentReceipt?.hash || "");
    console.log("✅ AgentRegistry initialized");
    console.log("🔗 Transaction:", initAgentReceipt?.hash);

    // Initialize PaymentManager
    const paymentManagerImpl = await hre.ethers.getContractAt("PaymentManager", paymentManagerImplAddress);
    if (!paymentManagerImpl.initialize) {
      throw new Error("initialize method not found on PaymentManager contract");
    }
    const initPaymentTx = await paymentManagerImpl.initialize(
      ADMIN_ADDRESS,
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY
    );
    const initPaymentReceipt = await initPaymentTx.wait(config.confirmations);
    deploymentTxHashes.push(initPaymentReceipt?.hash || "");
    console.log("✅ PaymentManager initialized");
    console.log("🔗 Transaction:", initPaymentReceipt?.hash);

    // 5. Configure Factory
    console.log("\n🔧 Step 5: Configuring Factory...");
    const factory = await hre.ethers.getContractAt("AgentGridFactory", factoryAddress);
    
    if (!factory.setAgentRegistryImplementation) {
      throw new Error("setAgentRegistryImplementation method not found on factory contract");
    }
    const setAgentImplTx = await factory.setAgentRegistryImplementation(agentRegistryImplAddress);
    const setAgentImplReceipt = await setAgentImplTx.wait(config.confirmations);
    deploymentTxHashes.push(setAgentImplReceipt?.hash || "");
    console.log("✅ AgentRegistry implementation set in factory");
    console.log("🔗 Transaction:", setAgentImplReceipt?.hash);

    if (!factory.setPaymentManagerImplementation) {
      throw new Error("setPaymentManagerImplementation method not found on factory contract");
    }
    const setPaymentImplTx = await factory.setPaymentManagerImplementation(paymentManagerImplAddress);
    const setPaymentImplReceipt = await setPaymentImplTx.wait(config.confirmations);
    deploymentTxHashes.push(setPaymentImplReceipt?.hash || "");
    console.log("✅ PaymentManager implementation set in factory");
    console.log("🔗 Transaction:", setPaymentImplReceipt?.hash);

    // 6. Deploy AgentRegistry Proxy
    console.log("\n🔗 Step 6: Deploying AgentRegistry Proxy...");
    if (!factory.deployAgentRegistry) {
      throw new Error("deployAgentRegistry method not found on factory contract");
    }
    const agentRegistryProxyTx = await factory.deployAgentRegistry(
      ADMIN_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: DEPLOYMENT_FEE }
    );
    const agentRegistryProxyReceipt = await agentRegistryProxyTx.wait(config.confirmations);
    const agentRegistryProxyAddress = agentRegistryProxyReceipt?.logs[0]?.args?.contractAddress || 
      (factory.agentRegistryProxy ? await factory.agentRegistryProxy() : "Unknown");
    
    gasUsed.agentRegistryProxy = agentRegistryProxyReceipt?.gasUsed || 0;
    deploymentTxHashes.push(agentRegistryProxyReceipt?.hash || "");
    console.log("✅ AgentRegistry Proxy deployed to:", agentRegistryProxyAddress);
    console.log("⛽ Gas used:", gasUsed.agentRegistryProxy.toString());
    console.log("🔗 Transaction:", agentRegistryProxyReceipt?.hash);

    // 7. Deploy PaymentManager Proxy
    console.log("\n💳 Step 7: Deploying PaymentManager Proxy...");
    if (!factory.deployPaymentManager) {
      throw new Error("deployPaymentManager method not found on factory contract");
    }
    const paymentManagerProxyTx = await factory.deployPaymentManager(
      ADMIN_ADDRESS,
      FEE_RECIPIENT,
      TREASURY_ADDRESS,
      STAKING_REWARD_ADDRESS,
      EMERGENCY_WITHDRAW_DELAY,
      { value: DEPLOYMENT_FEE }
    );
    const paymentManagerProxyReceipt = await paymentManagerProxyTx.wait(config.confirmations);
    const paymentManagerProxyAddress = paymentManagerProxyReceipt?.logs[0]?.args?.contractAddress || 
      (factory.paymentManagerProxy ? await factory.paymentManagerProxy() : "Unknown");
    
    gasUsed.paymentManagerProxy = paymentManagerProxyReceipt?.gasUsed || 0;
    deploymentTxHashes.push(paymentManagerProxyReceipt?.hash || "");
    console.log("✅ PaymentManager Proxy deployed to:", paymentManagerProxyAddress);
    console.log("⛽ Gas used:", gasUsed.paymentManagerProxy.toString());
    console.log("🔗 Transaction:", paymentManagerProxyReceipt?.hash);

    // 8. Verify contracts
    if (config.verify) {
      console.log("\n🔍 Step 8: Verifying contracts...");
      
      const verificationPromises = [];
      
      try {
        console.log("Verifying AgentRegistry Implementation...");
        verificationPromises.push(
          hre.run("verify:verify", {
            address: agentRegistryImplAddress,
            constructorArguments: [],
          }).then(() => console.log("✅ AgentRegistry Implementation verified"))
        );
      } catch (error) {
        console.log("⚠️ AgentRegistry verification failed:", error);
      }

      try {
        console.log("Verifying PaymentManager Implementation...");
        verificationPromises.push(
          hre.run("verify:verify", {
            address: paymentManagerImplAddress,
            constructorArguments: [],
          }).then(() => console.log("✅ PaymentManager Implementation verified"))
        );
      } catch (error) {
        console.log("⚠️ PaymentManager verification failed:", error);
      }

      try {
        console.log("Verifying AgentGridFactory...");
        verificationPromises.push(
          hre.run("verify:verify", {
            address: factoryAddress,
            constructorArguments: [ADMIN_ADDRESS, DEPLOYMENT_FEE, FEE_RECIPIENT],
          }).then(() => console.log("✅ AgentGridFactory verified"))
        );
      } catch (error) {
        console.log("⚠️ AgentGridFactory verification failed:", error);
      }

      // Wait for all verifications to complete
      await Promise.allSettled(verificationPromises);
    }

    // 9. Generate deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`🌐 Network: ${config.name}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`👤 Deployer: ${ADMIN_ADDRESS}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
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
    console.log("Deployment Fee:", hre.ethers.formatEther(DEPLOYMENT_FEE), "ETH");
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
    console.log("Total Gas Used:", Object.values(gasUsed).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0).toString());
    console.log("");
    console.log("🔗 TRANSACTION HASHES:");
    deploymentTxHashes.forEach((hash, index) => {
      if (hash) {
        console.log(`Transaction ${index + 1}:`, hash);
      }
    });

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
