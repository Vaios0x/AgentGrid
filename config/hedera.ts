/**
 * Configuración de cuentas de Hedera para AgentGrid
 */

export interface HederaAccount {
  accountId: string;
  evmAddress?: string;
  privateKey: string;
  type: 'ecdsa' | 'ed25519';
}

export const HEDERA_ACCOUNTS: Record<string, HederaAccount> = {
  ecdsa: {
    accountId: '0.0.7134182',
    evmAddress: '0x8f3ca977c94f5c8d03397bbdb3a7f4b9ca5048a2',
    privateKey: '0x6f74b3941cd81f2033ce7b67b864d8a964b846f37d8fd19e83ef840cf99c238c',
    type: 'ecdsa'
  },
  ed25519: {
    accountId: '0.0.7134356',
    privateKey: '0x89f3391c6706dc613e15c391161808f880a03ea13efeeec090a8ca6b527e2b67',
    type: 'ed25519'
  }
};

export const HEDERA_NETWORKS = {
  testnet: {
    url: 'https://testnet.hashio.io/api',
    chainId: 296, // Hedera Testnet Chain ID
    name: 'Hedera Testnet'
  },
  mainnet: {
    url: 'https://mainnet.hashio.io/api',
    chainId: 295, // Hedera Mainnet Chain ID
    name: 'Hedera Mainnet'
  }
};

export const HEDERA_CONFIG = {
  // Configuración de gas para Hedera
  gasPrice: 1, // 1 tinybar (mínimo en Hedera)
  gasLimit: 1000000, // Límite de gas por defecto
  
  // Configuración de cuentas
  defaultAccount: 'ecdsa' as keyof typeof HEDERA_ACCOUNTS,
  
  // Configuración de red
  defaultNetwork: 'testnet' as keyof typeof HEDERA_NETWORKS
};
