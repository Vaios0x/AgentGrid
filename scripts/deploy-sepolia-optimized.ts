import { ethers, network } from "hardhat";

async function main() {
  console.log("🚀 Desplegando contratos AgentGrid en Sepolia con Alchemy...");
  console.log("🌐 Red:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId);
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️ Balance insuficiente para deployment. Necesitas al menos 0.01 ETH");
    console.log("💡 Puedes obtener ETH de testnet en: https://sepoliafaucet.com/");
    return;
  }
  
  try {
    // 1. Deploy MockERC20
    console.log("\n📦 Desplegando MockERC20 (PYUSD)...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("PyUSD", "PYUSD", {
      gasLimit: 1000000, // Límite de gas optimizado
    });
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("✅ MockERC20 desplegado en:", mockTokenAddress);
    
    // 2. Deploy AgentRegistry
    console.log("\n📦 Desplegando AgentRegistry...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy(7 * 24 * 60 * 60, { // 7 días
      gasLimit: 2000000, // Límite de gas optimizado
    });
    await agentRegistry.waitForDeployment();
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log("✅ AgentRegistry desplegado en:", agentRegistryAddress);
    
    // 3. Deploy PaymentManager (con configuración optimizada)
    console.log("\n📦 Desplegando PaymentManager...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(
      mockTokenAddress, // PYUSD token
      deployer.address, // Fee recipient
      deployer.address, // Treasury
      deployer.address, // Staking reward
      7 * 24 * 60 * 60, // Emergency withdraw delay
      {
        gasLimit: 3000000, // Límite de gas optimizado
      }
    );
    await paymentManager.waitForDeployment();
    const paymentManagerAddress = await paymentManager.getAddress();
    console.log("✅ PaymentManager desplegado en:", paymentManagerAddress);
    
    // 4. Verificar contratos
    console.log("\n🔍 Verificando contratos...");
    
    // Verificar MockERC20
    const tokenName = await mockToken.name();
    const tokenSymbol = await mockToken.symbol();
    console.log("   MockERC20 - Nombre:", tokenName, "Símbolo:", tokenSymbol);
    
    // Verificar AgentRegistry
    const agentCount = await agentRegistry.getAgentCount();
    console.log("   AgentRegistry - Número de agentes:", agentCount.toString());
    
    // Verificar PaymentManager
    const paymentCount = await paymentManager.getPaymentCount();
    console.log("   PaymentManager - Número de pagos:", paymentCount.toString());
    
    console.log("\n🎉 ¡Despliegue completado exitosamente en Sepolia!");
    console.log("\n📋 RESUMEN DE CONTRATOS DESPLEGADOS:");
    console.log("   🌐 Red: Sepolia (Alchemy)");
    console.log("   🔗 Chain ID:", network.config.chainId);
    console.log("   👤 Deployer:", deployer.address);
    console.log("   📅 Timestamp:", new Date().toISOString());
    console.log("");
    console.log("   📦 CONTRATOS:");
    console.log("   MockERC20 (PYUSD):", mockTokenAddress);
    console.log("   AgentRegistry:", agentRegistryAddress);
    console.log("   PaymentManager:", paymentManagerAddress);
    console.log("");
    console.log("   🔗 Explorador Sepolia:");
    console.log("   https://sepolia.etherscan.io/address/" + mockTokenAddress);
    console.log("   https://sepolia.etherscan.io/address/" + agentRegistryAddress);
    console.log("   https://sepolia.etherscan.io/address/" + paymentManagerAddress);
    
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
