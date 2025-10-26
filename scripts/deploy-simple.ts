import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Iniciando despliegue de contratos AgentGrid...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // 1. Desplegar MockERC20 (PYUSD)
  console.log("\n📦 Desplegando MockERC20 (PYUSD)...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const pyusd = await MockERC20.deploy("PayPal USD", "PYUSD");
  await pyusd.waitForDeployment();
  const pyusdAddress = await pyusd.getAddress();
  console.log("✅ MockERC20 desplegado en:", pyusdAddress);
  
  // 2. Desplegar AgentRegistry
  console.log("\n📦 Desplegando AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(7 * 24 * 60 * 60); // 7 días de delay
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("✅ AgentRegistry desplegado en:", agentRegistryAddress);
  
  // 3. Desplegar PaymentManager
  console.log("\n📦 Desplegando PaymentManager...");
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy(
    pyusdAddress,
    deployer.address, // feeRecipient
    deployer.address, // treasuryAddress
    deployer.address, // stakingRewardAddress
    7 * 24 * 60 * 60  // 7 días de delay
  );
  await paymentManager.waitForDeployment();
  const paymentManagerAddress = await paymentManager.getAddress();
  console.log("✅ PaymentManager desplegado en:", paymentManagerAddress);
  
  // 4. Desplegar AgentGridFactory
  console.log("\n📦 Desplegando AgentGridFactory...");
  const AgentGridFactory = await ethers.getContractFactory("AgentGridFactory");
  const factory = await AgentGridFactory.deploy(
    agentRegistryAddress,
    paymentManagerAddress,
    deployer.address // feeRecipient
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ AgentGridFactory desplegado en:", factoryAddress);
  
  // 5. Configurar roles y permisos
  console.log("\n🔧 Configurando roles y permisos...");
  
  // Transferir ownership de AgentRegistry a factory
  await agentRegistry.transferOwnership(factoryAddress);
  console.log("✅ Ownership de AgentRegistry transferido a Factory");
  
  // Transferir ownership de PaymentManager a factory
  await paymentManager.transferOwnership(factoryAddress);
  console.log("✅ Ownership de PaymentManager transferido a Factory");
  
  // 6. Verificar configuración
  console.log("\n🔍 Verificando configuración...");
  
  const agentRegistryOwner = await agentRegistry.owner();
  const paymentManagerOwner = await paymentManager.owner();
  const factoryOwner = await factory.owner();
  
  console.log("👤 AgentRegistry Owner:", agentRegistryOwner);
  console.log("👤 PaymentManager Owner:", paymentManagerOwner);
  console.log("👤 Factory Owner:", factoryOwner);
  
  // 7. Resumen del despliegue
  console.log("\n🎉 ¡Despliegue completado exitosamente!");
  console.log("=" * 60);
  console.log("📋 RESUMEN DEL DESPLIEGUE:");
  console.log("=" * 60);
  console.log("🌐 Red:", await ethers.provider.getNetwork());
  console.log("👤 Desplegador:", deployer.address);
  console.log("💰 Balance final:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");
  console.log("📦 CONTRATOS DESPLEGADOS:");
  console.log("├── MockERC20 (PYUSD):", pyusdAddress);
  console.log("├── AgentRegistry:", agentRegistryAddress);
  console.log("├── PaymentManager:", paymentManagerAddress);
  console.log("└── AgentGridFactory:", factoryAddress);
  console.log("");
  console.log("🔗 ENLACES DE VERIFICACIÓN:");
  console.log("├── MockERC20: https://etherscan.io/address/" + pyusdAddress);
  console.log("├── AgentRegistry: https://etherscan.io/address/" + agentRegistryAddress);
  console.log("├── PaymentManager: https://etherscan.io/address/" + paymentManagerAddress);
  console.log("└── AgentGridFactory: https://etherscan.io/address/" + factoryAddress);
  console.log("");
  console.log("🚀 ¡Los contratos están listos para usar!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });
