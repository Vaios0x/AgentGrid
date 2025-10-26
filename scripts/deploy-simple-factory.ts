import { ethers, network } from "hardhat";

async function main() {
  console.log("🏭 Desplegando SimpleAgentGridFactory...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Direcciones de los contratos ya desplegados
  const agentRegistryImpl = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const paymentManagerImpl = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const feeRecipient = deployer.address;
  
  console.log("📦 Desplegando SimpleAgentGridFactory...");
  console.log("   AgentRegistry Implementation:", agentRegistryImpl);
  console.log("   PaymentManager Implementation:", paymentManagerImpl);
  console.log("   Fee Recipient:", feeRecipient);
  
  try {
    const SimpleAgentGridFactory = await ethers.getContractFactory("SimpleAgentGridFactory");
    
    const factory = await SimpleAgentGridFactory.deploy(
      agentRegistryImpl,
      paymentManagerImpl,
      feeRecipient
    );
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log("✅ SimpleAgentGridFactory desplegado en:", factoryAddress);
    
    // Verificar que el contrato funciona
    const agentRegistryImplAddr = await factory.agentRegistryImplementation();
    const paymentManagerImplAddr = await factory.paymentManagerImplementation();
    const feeRecipientAddr = await factory.feeRecipient();
    const deploymentFee = await factory.deploymentFee();
    
    console.log("🔍 Verificación:");
    console.log("   AgentRegistry Implementation:", agentRegistryImplAddr);
    console.log("   PaymentManager Implementation:", paymentManagerImplAddr);
    console.log("   Fee Recipient:", feeRecipientAddr);
    console.log("   Deployment Fee:", ethers.formatEther(deploymentFee), "ETH");
    
    console.log("\n🎉 ¡Despliegue completado exitosamente!");
    console.log("\n📋 RESUMEN DE CONTRATOS DESPLEGADOS:");
    console.log("   MockERC20 (PYUSD): 0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log("   AgentRegistry: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    console.log("   PaymentManager: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    console.log("   SimpleAgentGridFactory:", factoryAddress);
    
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
