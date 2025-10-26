import { ethers, network } from "hardhat";

async function main() {
  console.log("🏭 Desplegando solo AgentGridFactory...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Direcciones de los contratos ya desplegados
  const agentRegistryImpl = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const paymentManagerImpl = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const feeRecipient = deployer.address;
  
  console.log("📦 Desplegando AgentGridFactory...");
  console.log("   AgentRegistry Implementation:", agentRegistryImpl);
  console.log("   PaymentManager Implementation:", paymentManagerImpl);
  console.log("   Fee Recipient:", feeRecipient);
  
  try {
    const AgentGridFactory = await ethers.getContractFactory("AgentGridFactory");
    
    // Desplegar con configuración de gas optimizada
    const factory = await AgentGridFactory.deploy(
      agentRegistryImpl,
      paymentManagerImpl,
      feeRecipient,
      {
        gasLimit: 8000000, // Límite de gas más alto
      }
    );
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log("✅ AgentGridFactory desplegado en:", factoryAddress);
    
    // Verificar que el contrato funciona
    const agentRegistryImplAddr = await factory.agentRegistryImplementation();
    const paymentManagerImplAddr = await factory.paymentManagerImplementation();
    const feeRecipientAddr = await factory.feeRecipient();
    
    console.log("🔍 Verificación:");
    console.log("   AgentRegistry Implementation:", agentRegistryImplAddr);
    console.log("   PaymentManager Implementation:", paymentManagerImplAddr);
    console.log("   Fee Recipient:", feeRecipientAddr);
    
    console.log("\n🎉 ¡Despliegue completado exitosamente!");
    
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
