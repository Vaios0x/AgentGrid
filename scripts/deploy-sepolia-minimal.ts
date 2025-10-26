import { ethers, network } from "hardhat";

async function main() {
  console.log("🚀 Desplegando contratos básicos en Sepolia...");
  console.log("🌐 Red:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId);
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
  
  try {
    // 1. Deploy MockERC20 (ya desplegado)
    console.log("\n📦 Verificando MockERC20...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("PyUSD", "PYUSD");
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("✅ MockERC20 desplegado en:", mockTokenAddress);
    
    // 2. Deploy AgentRegistry con configuración mínima
    console.log("\n📦 Desplegando AgentRegistry...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy(86400); // 1 día en lugar de 7
    await agentRegistry.waitForDeployment();
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log("✅ AgentRegistry desplegado en:", agentRegistryAddress);
    
    // 3. Verificar contratos
    console.log("\n🔍 Verificando contratos...");
    
    const tokenName = await mockToken.name();
    const tokenSymbol = await mockToken.symbol();
    console.log("   MockERC20 - Nombre:", tokenName, "Símbolo:", tokenSymbol);
    
    const agentCount = await agentRegistry.getAgentCount();
    console.log("   AgentRegistry - Número de agentes:", agentCount.toString());
    
    console.log("\n🎉 ¡Despliegue básico completado en Sepolia!");
    console.log("\n📋 CONTRATOS DESPLEGADOS:");
    console.log("   MockERC20 (PYUSD):", mockTokenAddress);
    console.log("   AgentRegistry:", agentRegistryAddress);
    console.log("\n🔗 Explorador Sepolia:");
    console.log("   https://sepolia.etherscan.io/address/" + mockTokenAddress);
    console.log("   https://sepolia.etherscan.io/address/" + agentRegistryAddress);
    
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
