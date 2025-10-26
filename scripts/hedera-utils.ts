/**
 * Utilidades para trabajar con cuentas de Hedera
 */

import { HEDERA_ACCOUNTS, HEDERA_NETWORKS, HEDERA_CONFIG } from '../config/hedera';
import { ethers } from 'ethers';

export class HederaAccountManager {
  private provider: ethers.Provider;
  private accounts: Map<string, ethers.Wallet> = new Map();

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    const networkConfig = HEDERA_NETWORKS[network];
    this.provider = new ethers.JsonRpcProvider(networkConfig.url);
    this.initializeAccounts();
  }

  private initializeAccounts(): void {
    Object.entries(HEDERA_ACCOUNTS).forEach(([name, account]) => {
      try {
        const wallet = new ethers.Wallet(account.privateKey, this.provider);
        this.accounts.set(name, wallet);
        console.log(`✅ Cuenta ${name} inicializada: ${account.accountId}`);
      } catch (error) {
        console.error(`❌ Error inicializando cuenta ${name}:`, error);
      }
    });
  }

  /**
   * Obtiene una cuenta por nombre
   */
  getAccount(name: keyof typeof HEDERA_ACCOUNTS): ethers.Wallet | undefined {
    return this.accounts.get(name);
  }

  /**
   * Obtiene la cuenta por defecto
   */
  getDefaultAccount(): ethers.Wallet | undefined {
    return this.getAccount(HEDERA_CONFIG.defaultAccount);
  }

  /**
   * Obtiene el balance de una cuenta
   */
  async getBalance(accountName: keyof typeof HEDERA_ACCOUNTS): Promise<string> {
    const account = this.getAccount(accountName);
    if (!account) {
      throw new Error(`Cuenta ${accountName} no encontrada`);
    }

    const balance = await this.provider.getBalance(account.address);
    return ethers.formatEther(balance);
  }

  /**
   * Obtiene información de todas las cuentas
   */
  async getAllAccountInfo(): Promise<Array<{
    name: string;
    accountId: string;
    evmAddress: string;
    balance: string;
    type: string;
  }>> {
    const accountInfo = [];

    for (const [name, account] of Object.entries(HEDERA_ACCOUNTS)) {
      try {
        const wallet = this.getAccount(name as keyof typeof HEDERA_ACCOUNTS);
        if (wallet) {
          const balance = await this.getBalance(name as keyof typeof HEDERA_ACCOUNTS);
          accountInfo.push({
            name,
            accountId: account.accountId,
            evmAddress: wallet.address,
            balance,
            type: account.type
          });
        }
      } catch (error) {
        console.error(`Error obteniendo información de cuenta ${name}:`, error);
      }
    }

    return accountInfo;
  }

  /**
   * Envía una transacción usando una cuenta específica
   */
  async sendTransaction(
    fromAccount: keyof typeof HEDERA_ACCOUNTS,
    to: string,
    value: string,
    data?: string
  ): Promise<ethers.TransactionResponse> {
    const account = this.getAccount(fromAccount);
    if (!account) {
      throw new Error(`Cuenta ${fromAccount} no encontrada`);
    }

    const tx = {
      to,
      value: ethers.parseEther(value),
      data: data || '0x',
      gasPrice: HEDERA_CONFIG.gasPrice,
      gasLimit: HEDERA_CONFIG.gasLimit
    };

    return await account.sendTransaction(tx);
  }

  /**
   * Despliega un contrato usando una cuenta específica
   */
  async deployContract(
    fromAccount: keyof typeof HEDERA_ACCOUNTS,
    bytecode: string,
    constructorArgs: any[] = []
  ): Promise<ethers.BaseContract> {
    const account = this.getAccount(fromAccount);
    if (!account) {
      throw new Error(`Cuenta ${fromAccount} no encontrada`);
    }

    const factory = new ethers.ContractFactory(
      [], // ABI vacío para deployment
      bytecode,
      account
    );

    return await factory.deploy(...constructorArgs);
  }
}

/**
 * Función de utilidad para mostrar información de las cuentas
 */
export async function displayAccountInfo(network: 'testnet' | 'mainnet' = 'testnet'): Promise<void> {
  console.log(`\n🔗 Red: ${HEDERA_NETWORKS[network].name}`);
  console.log(`📡 URL: ${HEDERA_NETWORKS[network].url}`);
  console.log(`⛓️  Chain ID: ${HEDERA_NETWORKS[network].chainId}\n`);

  const manager = new HederaAccountManager(network);
  const accountInfo = await manager.getAllAccountInfo();

  accountInfo.forEach((info) => {
    console.log(`📋 ${info.name.toUpperCase()} Account:`);
    console.log(`   Account ID: ${info.accountId}`);
    console.log(`   EVM Address: ${info.evmAddress}`);
    console.log(`   Balance: ${info.balance} HBAR`);
    console.log(`   Type: ${info.type}`);
    console.log('');
  });
}

// Script ejecutable
if (require.main === module) {
  displayAccountInfo('testnet').catch(console.error);
}
