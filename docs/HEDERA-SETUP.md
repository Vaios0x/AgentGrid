# Configuración de Hedera para AgentGrid

Este documento describe cómo configurar y usar las cuentas de Hedera en el proyecto AgentGrid.

## 📋 Cuentas Configuradas

### Cuenta ECDSA
- **Account ID**: `0.0.7134182`
- **EVM Address**: `0x8f3ca977c94f5c8d03397bbdb3a7f4b9ca5048a2`
- **Private Key**: `0x6f74b3941cd81f2033ce7b67b864d8a964b846f37d8fd19e83ef840cf99c238c`
- **Tipo**: ECDSA (compatible con Ethereum)

### Cuenta ED25519
- **Account ID**: `0.0.7134356`
- **Private Key**: `0x89f3391c6706dc613e15c391161808f880a03ea13efeeec090a8ca6b527e2b67`
- **Tipo**: ED25519 (nativo de Hedera)

## 🚀 Uso

### 1. Verificar Información de Cuentas

```bash
npm run contracts:hedera:info
```

Este comando mostrará:
- Información de red (testnet/mainnet)
- Balance de cada cuenta
- Direcciones EVM
- Tipos de cuenta

### 2. Desplegar Contratos en Hedera Testnet

```bash
npm run contracts:deploy:hedera
```

### 3. Desplegar Contratos en Hedera Mainnet

```bash
npm run contracts:deploy:hedera:mainnet
```

## 🔧 Configuración Técnica

### Redes Configuradas

#### Hedera Testnet
- **URL**: `https://testnet.hashio.io/api`
- **Chain ID**: `296`
- **Gas Price**: `1 tinybar` (mínimo)
- **Gas Limit**: `1,000,000`

#### Hedera Mainnet
- **URL**: `https://mainnet.hashio.io/api`
- **Chain ID**: `295`
- **Gas Price**: `1 tinybar` (mínimo)
- **Gas Limit**: `1,000,000`

### Archivos de Configuración

- `config/hedera.ts` - Configuración principal de cuentas y redes
- `scripts/hedera-utils.ts` - Utilidades para manejo de cuentas
- `scripts/deploy-hedera.ts` - Script de deployment específico para Hedera

## 💰 Gestión de Balance

### Verificar Balance

```typescript
import { HederaAccountManager } from './scripts/hedera-utils';

const manager = new HederaAccountManager('testnet');
const balance = await manager.getBalance('ecdsa');
console.log(`Balance: ${balance} HBAR`);
```

### Enviar Transacciones

```typescript
const manager = new HederaAccountManager('testnet');
const tx = await manager.sendTransaction(
  'ecdsa',
  '0x...', // dirección destino
  '1.0'    // cantidad en HBAR
);
```

## 🔐 Seguridad

### Consideraciones Importantes

1. **Claves Privadas**: Las claves están hardcodeadas para desarrollo. En producción, usar variables de entorno.

2. **Balance Mínimo**: Mantener al menos 1 HBAR en cada cuenta para operaciones.

3. **Gas**: Hedera usa un modelo de gas fijo (1 tinybar), muy económico.

4. **Límites**: Hedera tiene límites de transacciones por segundo, considerar esto en deployments masivos.

## 📊 Monitoreo

### Logs de Deployment

Los deployments generan logs detallados incluyendo:
- Direcciones de contratos desplegados
- Balance antes y después del deployment
- Errores y advertencias
- Información guardada en `deployments/hedera-testnet.json`

### Verificación de Contratos

```bash
# Verificar en testnet
npx hardhat verify --network hedera_testnet <CONTRACT_ADDRESS>

# Verificar en mainnet
npx hardhat verify --network hedera_mainnet <CONTRACT_ADDRESS>
```

## 🛠️ Desarrollo

### Estructura de Archivos

```
config/
├── hedera.ts              # Configuración de cuentas y redes

scripts/
├── hedera-utils.ts        # Utilidades para manejo de cuentas
├── deploy-hedera.ts       # Script de deployment

deployments/
└── hedera-testnet.json    # Información de deployment
```

### Personalización

Para agregar nuevas cuentas, editar `config/hedera.ts`:

```typescript
export const HEDERA_ACCOUNTS: Record<string, HederaAccount> = {
  // ... cuentas existentes
  nueva_cuenta: {
    accountId: '0.0.XXXXXXX',
    evmAddress: '0x...',
    privateKey: '0x...',
    type: 'ecdsa'
  }
};
```

## 📞 Soporte

Para problemas específicos de Hedera:
- [Documentación oficial de Hedera](https://docs.hedera.com/)
- [Hedera Discord](https://discord.gg/hedera)
- [Hashio API](https://hashio.io/)

## ⚠️ Notas Importantes

1. **Testnet vs Mainnet**: Usar testnet para desarrollo, mainnet solo para producción.

2. **Costos**: Hedera es muy económico, pero las cuentas necesitan HBAR para operar.

3. **Compatibilidad**: Las cuentas ECDSA son compatibles con herramientas de Ethereum.

4. **Límites**: Hedera tiene límites de transacciones por segundo, planificar deployments grandes.
