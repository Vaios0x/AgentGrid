/**
 * Script de prueba para verificar la configuración de Hedera
 */

import { HederaAccountManager, displayAccountInfo } from './hedera-utils';
import { HEDERA_ACCOUNTS, HEDERA_NETWORKS } from '../config/hedera';

async function testHederaConfiguration() {
  console.log('🧪 Probando configuración de Hedera...\n');

  try {
    // 1. Probar conexión a testnet
    console.log('1️⃣ Probando conexión a Hedera Testnet...');
    const testnetManager = new HederaAccountManager('testnet');
    console.log('   ✅ Conexión establecida');

    // 2. Verificar cuentas
    console.log('\n2️⃣ Verificando cuentas...');
    const accountInfo = await testnetManager.getAllAccountInfo();
    
    if (accountInfo.length === 0) {
      throw new Error('No se encontraron cuentas configuradas');
    }

    console.log(`   ✅ ${accountInfo.length} cuentas encontradas`);
    accountInfo.forEach((info) => {
      console.log(`      - ${info.name}: ${info.accountId} (${info.balance} HBAR)`);
    });

    // 3. Probar operaciones básicas
    console.log('\n3️⃣ Probando operaciones básicas...');
    
    // Obtener balance de la cuenta ECDSA
    const ecdsaBalance = await testnetManager.getBalance('ecdsa');
    console.log(`   ✅ Balance ECDSA: ${ecdsaBalance} HBAR`);

    // Obtener balance de la cuenta ED25519
    const ed25519Balance = await testnetManager.getBalance('ed25519');
    console.log(`   ✅ Balance ED25519: ${ed25519Balance} HBAR`);

    // 4. Verificar configuración de red
    console.log('\n4️⃣ Verificando configuración de red...');
    console.log(`   Testnet URL: ${HEDERA_NETWORKS.testnet.url}`);
    console.log(`   Testnet Chain ID: ${HEDERA_NETWORKS.testnet.chainId}`);
    console.log(`   Mainnet URL: ${HEDERA_NETWORKS.mainnet.url}`);
    console.log(`   Mainnet Chain ID: ${HEDERA_NETWORKS.mainnet.chainId}`);

    // 5. Verificar cuentas individuales
    console.log('\n5️⃣ Verificando cuentas individuales...');
    
    const ecdsaAccount = testnetManager.getAccount('ecdsa');
    if (ecdsaAccount) {
      console.log(`   ✅ Cuenta ECDSA: ${ecdsaAccount.address}`);
    } else {
      throw new Error('No se pudo obtener cuenta ECDSA');
    }

    const ed25519Account = testnetManager.getAccount('ed25519');
    if (ed25519Account) {
      console.log(`   ✅ Cuenta ED25519: ${ed25519Account.address}`);
    } else {
      throw new Error('No se pudo obtener cuenta ED25519');
    }

    // 6. Verificar configuración de cuentas
    console.log('\n6️⃣ Verificando configuración de cuentas...');
    console.log(`   ECDSA Account ID: ${HEDERA_ACCOUNTS.ecdsa.accountId}`);
    console.log(`   ECDSA EVM Address: ${HEDERA_ACCOUNTS.ecdsa.evmAddress}`);
    console.log(`   ED25519 Account ID: ${HEDERA_ACCOUNTS.ed25519.accountId}`);

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📋 Resumen de configuración:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔗 Red: ${HEDERA_NETWORKS.testnet.name}`);
    console.log(`📡 URL: ${HEDERA_NETWORKS.testnet.url}`);
    console.log(`⛓️  Chain ID: ${HEDERA_NETWORKS.testnet.chainId}`);
    console.log(`💰 Balance ECDSA: ${ecdsaBalance} HBAR`);
    console.log(`💰 Balance ED25519: ${ed25519Balance} HBAR`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Mostrar información completa
    console.log('\n📊 Información completa de cuentas:');
    await displayAccountInfo('testnet');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testHederaConfiguration().catch(console.error);
}

export { testHederaConfiguration };
