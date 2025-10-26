import { ethers, network } from "hardhat";

async function main() {
  console.log("💰 Desplegando SimplePaymentManager en Sepolia...");
  console.log("🌐 Red:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId);
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
  
  try {
    // Usar las direcciones de los contratos ya desplegados
    const mockTokenAddress = "0x1b43c611F3709e2372a108E3424a7C0D89724e93"; // MockERC20
    const feeRecipient = deployer.address;
    const treasuryAddress = deployer.address;
    const stakingRewardAddress = deployer.address;
    const emergencyWithdrawDelay = 86400; // 1 día
    
    console.log("\n📦 Desplegando SimplePaymentManager...");
    console.log("   MockERC20 Address:", mockTokenAddress);
    console.log("   Fee Recipient:", feeRecipient);
    console.log("   Treasury:", treasuryAddress);
    console.log("   Staking Reward:", stakingRewardAddress);
    console.log("   Emergency Withdraw Delay:", emergencyWithdrawDelay, "seconds");
    
    const SimplePaymentManager = await ethers.getContractFactory("SimplePaymentManager");
    const paymentManager = await SimplePaymentManager.deploy(
      mockTokenAddress,
      feeRecipient,
      treasuryAddress,
      stakingRewardAddress,
      emergencyWithdrawDelay,
      {
        gasLimit: 2000000, // Límite de gas optimizado
      }
    );
    
    await paymentManager.waitForDeployment();
    const paymentManagerAddress = await paymentManager.getAddress();
    console.log("✅ SimplePaymentManager desplegado en:", paymentManagerAddress);
    
    // Verificar el contrato
    console.log("\n🔍 Verificando SimplePaymentManager...");
    const paymentCount = await paymentManager.paymentCount();
    const tokenAddress = await paymentManager.token();
    const feeRecipientAddr = await paymentManager.feeRecipient();
    const totalFees = await paymentManager.totalFeesCollected();
    
    console.log("   Payment Count:", paymentCount.toString());
    console.log("   Token Address:", tokenAddress);
    console.log("   Fee Recipient:", feeRecipientAddr);
    console.log("   Total Fees Collected:", ethers.formatEther(totalFees), "tokens");
    
    console.log("\n🎉 ¡SimplePaymentManager desplegado exitosamente!");
    console.log("\n📋 RESUMEN COMPLETO DE CONTRATOS EN SEPOLIA:");
    console.log("   🌐 Red: Sepolia (Alchemy)");
    console.log("   🔗 Chain ID:", network.config.chainId);
    console.log("   👤 Deployer:", deployer.address);
    console.log("   📅 Timestamp:", new Date().toISOString());
    console.log("");
    console.log("   📦 CONTRATOS DESPLEGADOS:");
    console.log("   MockERC20 (PYUSD):", mockTokenAddress);
    console.log("   AgentRegistry: 0xc720245C9dbb2C17B2481f2DaDf0959F2379fdff");
    console.log("   SimplePaymentManager:", paymentManagerAddress);
    console.log("");
    console.log("   🔗 Explorador Sepolia:");
    console.log("   https://sepolia.etherscan.io/address/" + mockTokenAddress);
    console.log("   https://sepolia.etherscan.io/address/0xc720245C9dbb2C17B2481f2DaDf0959F2379fdff");
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
