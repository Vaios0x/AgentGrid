import { ethers, network } from "hardhat";

async function main() {
  console.log("🚀 Desplegando contratos mini en Sepolia...");
  console.log("🌐 Red:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId);
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.001")) {
    console.log("⚠️ Balance insuficiente para deployment. Necesitas al menos 0.001 ETH");
    return;
  }
  
  try {
    // Usar las direcciones de los contratos ya desplegados
    const mockTokenAddress = "0x1b43c611F3709e2372a108E3424a7C0D89724e93"; // MockERC20
    const agentRegistryAddress = "0xc720245C9dbb2C17B2481f2DaDf0959F2379fdff"; // AgentRegistry
    
    console.log("\n📦 Desplegando MiniPaymentManager...");
    console.log("   MockERC20 Address:", mockTokenAddress);
    console.log("   Fee Recipient:", deployer.address);
    
    const MiniPaymentManager = await ethers.getContractFactory("MiniPaymentManager");
    const miniPaymentManager = await MiniPaymentManager.deploy(
      mockTokenAddress,
      deployer.address,
      {
        gasLimit: 1000000, // Límite de gas muy bajo
      }
    );
    
    await miniPaymentManager.waitForDeployment();
    const miniPaymentManagerAddress = await miniPaymentManager.getAddress();
    console.log("✅ MiniPaymentManager desplegado en:", miniPaymentManagerAddress);
    
    console.log("\n📦 Desplegando MiniAgentGridFactory...");
    console.log("   AgentRegistry Implementation:", agentRegistryAddress);
    console.log("   PaymentManager Implementation:", miniPaymentManagerAddress);
    console.log("   Fee Recipient:", deployer.address);
    
    const MiniAgentGridFactory = await ethers.getContractFactory("MiniAgentGridFactory");
    const miniFactory = await MiniAgentGridFactory.deploy(
      agentRegistryAddress,
      miniPaymentManagerAddress,
      deployer.address,
      {
        gasLimit: 1500000, // Límite de gas bajo
      }
    );
    
    await miniFactory.waitForDeployment();
    const miniFactoryAddress = await miniFactory.getAddress();
    console.log("✅ MiniAgentGridFactory desplegado en:", miniFactoryAddress);
    
    // Verificar los contratos
    console.log("\n🔍 Verificando contratos...");
    
    const paymentCount = await miniPaymentManager.paymentCount();
    const tokenAddr = await miniPaymentManager.token();
    const feeRecipientAddr = await miniPaymentManager.feeRecipient();
    
    console.log("   MiniPaymentManager - Payment Count:", paymentCount.toString());
    console.log("   MiniPaymentManager - Token Address:", tokenAddr);
    console.log("   MiniPaymentManager - Fee Recipient:", feeRecipientAddr);
    
    const agentRegistryImpl = await miniFactory.agentRegistryImplementation();
    const paymentManagerImpl = await miniFactory.paymentManagerImplementation();
    const factoryFeeRecipient = await miniFactory.feeRecipient();
    
    console.log("   MiniAgentGridFactory - AgentRegistry Impl:", agentRegistryImpl);
    console.log("   MiniAgentGridFactory - PaymentManager Impl:", paymentManagerImpl);
    console.log("   MiniAgentGridFactory - Fee Recipient:", factoryFeeRecipient);
    
    console.log("\n🎉 ¡Todos los contratos mini desplegados exitosamente!");
    console.log("\n📋 RESUMEN COMPLETO DE CONTRATOS EN SEPOLIA:");
    console.log("   🌐 Red: Sepolia (Alchemy)");
    console.log("   🔗 Chain ID:", network.config.chainId);
    console.log("   👤 Deployer:", deployer.address);
    console.log("   📅 Timestamp:", new Date().toISOString());
    console.log("");
    console.log("   📦 CONTRATOS DESPLEGADOS:");
    console.log("   MockERC20 (PYUSD):", mockTokenAddress);
    console.log("   AgentRegistry:", agentRegistryAddress);
    console.log("   MiniPaymentManager:", miniPaymentManagerAddress);
    console.log("   MiniAgentGridFactory:", miniFactoryAddress);
    console.log("");
    console.log("   🔗 Explorador Sepolia:");
    console.log("   https://sepolia.etherscan.io/address/" + mockTokenAddress);
    console.log("   https://sepolia.etherscan.io/address/" + agentRegistryAddress);
    console.log("   https://sepolia.etherscan.io/address/" + miniPaymentManagerAddress);
    console.log("   https://sepolia.etherscan.io/address/" + miniFactoryAddress);
    
  } catch (error) {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
