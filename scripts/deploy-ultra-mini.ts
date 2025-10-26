import { ethers, network } from "hardhat";

async function main() {
  console.log("🚀 Desplegando contratos ultra mini en Sepolia...");
  console.log("🌐 Red:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId);
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
  
  try {
    // Usar las direcciones de los contratos ya desplegados
    const mockTokenAddress = "0x1b43c611F3709e2372a108E3424a7C0D89724e93"; // MockERC20
    
    console.log("\n📦 Desplegando UltraMiniPaymentManager...");
    console.log("   MockERC20 Address:", mockTokenAddress);
    console.log("   Fee Recipient:", deployer.address);
    
    const UltraMiniPaymentManager = await ethers.getContractFactory("UltraMiniPaymentManager");
    const ultraPaymentManager = await UltraMiniPaymentManager.deploy(
      mockTokenAddress,
      deployer.address,
      {
        gasLimit: 500000, // Límite de gas ultra bajo
      }
    );
    
    await ultraPaymentManager.waitForDeployment();
    const ultraPaymentManagerAddress = await ultraPaymentManager.getAddress();
    console.log("✅ UltraMiniPaymentManager desplegado en:", ultraPaymentManagerAddress);
    
    console.log("\n📦 Desplegando UltraMiniFactory...");
    console.log("   Fee Recipient:", deployer.address);
    
    const UltraMiniFactory = await ethers.getContractFactory("UltraMiniFactory");
    const ultraFactory = await UltraMiniFactory.deploy(
      deployer.address,
      {
        gasLimit: 800000, // Límite de gas bajo
      }
    );
    
    await ultraFactory.waitForDeployment();
    const ultraFactoryAddress = await ultraFactory.getAddress();
    console.log("✅ UltraMiniFactory desplegado en:", ultraFactoryAddress);
    
    // Verificar los contratos
    console.log("\n🔍 Verificando contratos...");
    
    const paymentCount = await ultraPaymentManager.paymentCount();
    const tokenAddr = await ultraPaymentManager.token();
    const feeRecipientAddr = await ultraPaymentManager.feeRecipient();
    
    console.log("   UltraMiniPaymentManager - Payment Count:", paymentCount.toString());
    console.log("   UltraMiniPaymentManager - Token Address:", tokenAddr);
    console.log("   UltraMiniPaymentManager - Fee Recipient:", feeRecipientAddr);
    
    const factoryFeeRecipient = await ultraFactory.feeRecipient();
    console.log("   UltraMiniFactory - Fee Recipient:", factoryFeeRecipient);
    
    console.log("\n🎉 ¡Todos los contratos ultra mini desplegados exitosamente!");
    console.log("\n📋 RESUMEN COMPLETO DE CONTRATOS EN SEPOLIA:");
    console.log("   🌐 Red: Sepolia (Alchemy)");
    console.log("   🔗 Chain ID:", network.config.chainId);
    console.log("   👤 Deployer:", deployer.address);
    console.log("   📅 Timestamp:", new Date().toISOString());
    console.log("");
    console.log("   📦 CONTRATOS DESPLEGADOS:");
    console.log("   MockERC20 (PYUSD):", mockTokenAddress);
    console.log("   AgentRegistry: 0xc720245C9dbb2C17B2481f2DaDf0959F2379fdff");
    console.log("   UltraMiniPaymentManager:", ultraPaymentManagerAddress);
    console.log("   UltraMiniFactory:", ultraFactoryAddress);
    console.log("");
    console.log("   🔗 Explorador Sepolia:");
    console.log("   https://sepolia.etherscan.io/address/" + mockTokenAddress);
    console.log("   https://sepolia.etherscan.io/address/0xc720245C9dbb2C17B2481f2DaDf0959F2379fdff");
    console.log("   https://sepolia.etherscan.io/address/" + ultraPaymentManagerAddress);
    console.log("   https://sepolia.etherscan.io/address/" + ultraFactoryAddress);
    
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
