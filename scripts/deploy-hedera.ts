/**
 * Script de deployment para Hedera Testnet
 */

import { ethers } from 'hardhat';
import { HederaAccountManager } from './hedera-utils';
import { HEDERA_ACCOUNTS } from '../config/hedera';

async function main() {
  console.log('🚀 Iniciando deployment en Hedera Testnet...\n');

  // Inicializar el manager de cuentas
  const accountManager = new HederaAccountManager('testnet');

  // Mostrar información de las cuentas
  console.log('📋 Información de cuentas:');
  const accountInfo = await accountManager.getAllAccountInfo();
  accountInfo.forEach((info) => {
    console.log(`   ${info.name}: ${info.accountId} (${info.balance} HBAR)`);
  });
  console.log('');

  // Obtener la cuenta por defecto
  const deployer = accountManager.getDefaultAccount();
  if (!deployer) {
    throw new Error('No se pudo obtener la cuenta de deployment');
  }

  console.log(`🔑 Usando cuenta: ${HEDERA_ACCOUNTS.ecdsa.accountId}`);
  console.log(`📍 Dirección EVM: ${deployer.address}\n`);

  // Verificar balance antes del deployment
  const balance = await accountManager.getBalance('ecdsa');
  console.log(`💰 Balance actual: ${balance} HBAR`);

  if (parseFloat(balance) < 1) {
    console.warn('⚠️  Balance bajo. Asegúrate de tener suficiente HBAR para el deployment.');
  }

  // Deployment de contratos
  console.log('\n📦 Desplegando contratos...\n');

  try {
    // 1. MockERC20
    console.log('1️⃣ Desplegando MockERC20...');
    const MockERC20 = await ethers.getContractFactory('MockERC20');
    const mockERC20 = await MockERC20.connect(deployer).deploy(
      'AgentGrid Token',
      'AGT',
      ethers.parseEther('1000000') // 1M tokens
    );
    await mockERC20.waitForDeployment();
    const mockERC20Address = await mockERC20.getAddress();
    console.log(`   ✅ MockERC20 desplegado en: ${mockERC20Address}`);

    // 2. AgentRegistry
    console.log('2️⃣ Desplegando AgentRegistry...');
    const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
    const agentRegistry = await AgentRegistry.connect(deployer).deploy();
    await agentRegistry.waitForDeployment();
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log(`   ✅ AgentRegistry desplegado en: ${agentRegistryAddress}`);

    // 3. PaymentManager
    console.log('3️⃣ Desplegando PaymentManager...');
    const PaymentManager = await ethers.getContractFactory('PaymentManager');
    const paymentManager = await PaymentManager.connect(deployer).deploy(
      mockERC20Address,
      agentRegistryAddress
    );
    await paymentManager.waitForDeployment();
    const paymentManagerAddress = await paymentManager.getAddress();
    console.log(`   ✅ PaymentManager desplegado en: ${paymentManagerAddress}`);

    // 4. AgentGridFactory
    console.log('4️⃣ Desplegando AgentGridFactory...');
    const AgentGridFactory = await ethers.getContractFactory('AgentGridFactory');
    const agentGridFactory = await AgentGridFactory.connect(deployer).deploy(
      agentRegistryAddress,
      paymentManagerAddress
    );
    await agentGridFactory.waitForDeployment();
    const agentGridFactoryAddress = await agentGridFactory.getAddress();
    console.log(`   ✅ AgentGridFactory desplegado en: ${agentGridFactoryAddress}`);

    // Configurar permisos
    console.log('\n🔧 Configurando permisos...');
    
    // Dar permisos de minter al PaymentManager
    const mintTx = await mockERC20.connect(deployer).grantRole(
      await mockERC20.MINTER_ROLE(),
      paymentManagerAddress
    );
    await mintTx.wait();
    console.log('   ✅ Permisos de minter configurados');

    // Configurar el factory en el registry
    const factoryTx = await agentRegistry.connect(deployer).setFactory(agentGridFactoryAddress);
    await factoryTx.wait();
    console.log('   ✅ Factory configurado en el registry');

    // Resumen del deployment
    console.log('\n🎉 Deployment completado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Direcciones de contratos:');
    console.log(`   MockERC20:      ${mockERC20Address}`);
    console.log(`   AgentRegistry:  ${agentRegistryAddress}`);
    console.log(`   PaymentManager: ${paymentManagerAddress}`);
    console.log(`   AgentGridFactory: ${agentGridFactoryAddress}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Verificar balance final
    const finalBalance = await accountManager.getBalance('ecdsa');
    console.log(`\n💰 Balance final: ${finalBalance} HBAR`);

    // Guardar direcciones en archivo
    const deploymentInfo = {
      network: 'hedera_testnet',
      chainId: 296,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        MockERC20: mockERC20Address,
        AgentRegistry: agentRegistryAddress,
        PaymentManager: paymentManagerAddress,
        AgentGridFactory: agentGridFactoryAddress
      }
    };

    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, 'hedera-testnet.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Información de deployment guardada en: ${deploymentFile}`);

  } catch (error) {
    console.error('❌ Error durante el deployment:', error);
    process.exit(1);
  }
}

// Ejecutar el script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
