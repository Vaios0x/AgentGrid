# 🚀 AgentGrid Deployment Guide - Hardhat 3.0

Esta guía te ayudará a desplegar los contratos inteligentes de AgentGrid usando Hardhat 3.0 en diferentes redes de Ethereum.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- npm o pnpm
- Cuenta con ETH para gas fees
- Clave privada de despliegue
- (Opcional) API keys para verificación de contratos

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# O usar pnpm
pnpm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus valores
nano .env
```

**Variables importantes en .env:**
```env
# Tu clave privada (NUNCA la compartas)
PRIVATE_KEY=0xcdf3a5b835fbba21d85927c43246285f2cefdcf4d665c3cdc7335f1da05d2450

# RPC URLs (opcional, se usan valores por defecto)
ETH_RPC_URL=https://eth.llamarpc.com
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id

# API Keys para verificación (opcional)
ETHERSCAN_API_KEY=your_etherscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### 3. Compilar Contratos

```bash
npm run contracts:compile
```

## 🌐 Redes Soportadas

### Testnets
- **Sepolia** (Recomendado para testing)
- **Goerli** (Deprecated pero funcional)
- **Arbitrum Sepolia**
- **Optimism Sepolia**
- **Base Sepolia**

### Mainnets
- **Ethereum Mainnet**
- **Arbitrum One**
- **Optimism**
- **Base**
- **Polygon**

## 🚀 Comandos de Despliegue

### Despliegue Básico (Sepolia)
```bash
npm run contracts:deploy:hardhat3
```

### Despliegue en Mainnet
```bash
npm run contracts:deploy:mainnet
```

### Despliegue en L2s
```bash
# Arbitrum
npm run contracts:deploy:arbitrum

# Optimism
npm run contracts:deploy:optimism

# Base
npm run contracts:deploy:base

# Polygon
npm run contracts:deploy:polygon
```

### Despliegue Personalizado
```bash
# Usar script de red específica
npx hardhat run scripts/deploy-network.ts --network <network_name>
```

## 🧪 Testing y Verificación

### Ejecutar Tests
```bash
# Tests básicos
npm run contracts:test

# Tests con cobertura
npm run contracts:test:coverage

# Auditoría de seguridad
npm run contracts:audit
```

### Verificar Contratos
```bash
# Verificar en Sepolia
npm run contracts:verify

# Verificar en Mainnet
npm run contracts:verify:mainnet
```

## 📊 Monitoreo y Análisis

### Reporte de Gas
```bash
npm run contracts:gas-report
```

### Tamaño de Contratos
```bash
npm run contracts:size
```

### Consola de Hardhat
```bash
npm run contracts:console
```

## 🔍 Proceso de Despliegue Detallado

### Paso 1: Preparación
1. Verificar balance de ETH en la cuenta de despliegue
2. Configurar variables de entorno
3. Compilar contratos
4. Ejecutar tests

### Paso 2: Despliegue
1. **AgentRegistry Implementation** - Contrato principal
2. **PaymentManager Implementation** - Gestión de pagos
3. **AgentGridFactory** - Factory para proxies
4. **Inicialización** - Configurar implementaciones
5. **AgentRegistry Proxy** - Proxy upgradeable
6. **PaymentManager Proxy** - Proxy upgradeable

### Paso 3: Verificación
1. Verificar contratos en block explorer
2. Probar funcionalidad básica
3. Generar reportes de gas
4. Documentar direcciones

## 💰 Estimación de Costos

### Gas Fees Estimados (Ethereum Mainnet)
- **AgentRegistry Implementation**: ~2,500,000 gas
- **PaymentManager Implementation**: ~2,200,000 gas
- **AgentGridFactory**: ~1,800,000 gas
- **AgentRegistry Proxy**: ~800,000 gas
- **PaymentManager Proxy**: ~900,000 gas
- **Total**: ~8,200,000 gas

### Costos por Red (Gas Price 20 gwei)
- **Ethereum**: ~0.16 ETH (~$400)
- **Arbitrum**: ~0.008 ETH (~$20)
- **Optimism**: ~0.008 ETH (~$20)
- **Base**: ~0.008 ETH (~$20)
- **Polygon**: ~0.25 MATIC (~$0.25)

## 🛡️ Consideraciones de Seguridad

### Antes del Despliegue
- ✅ Ejecutar auditoría de seguridad
- ✅ Probar en testnets
- ✅ Verificar configuración de roles
- ✅ Revisar funciones de emergencia

### Después del Despliegue
- ✅ Verificar contratos en block explorer
- ✅ Probar todas las funciones
- ✅ Configurar monitoreo
- ✅ Documentar direcciones

## 🔧 Solución de Problemas

### Error: Insufficient Funds
```bash
# Verificar balance
npx hardhat run scripts/check-balance.js --network <network>

# Añadir más ETH a la cuenta
```

### Error: Gas Estimation Failed
```bash
# Aumentar gas limit
# Editar hardhat.config.ts
gas: 8000000
```

### Error: Contract Verification Failed
```bash
# Verificar manualmente
npx hardhat verify --network <network> <contract_address> <constructor_args>
```

## 📝 Post-Despliegue

### 1. Documentar Direcciones
Guardar las direcciones de los contratos desplegados:
- AgentRegistry Implementation
- AgentRegistry Proxy
- PaymentManager Implementation
- PaymentManager Proxy
- AgentGridFactory

### 2. Configurar Monitoreo
- Configurar alertas de gas
- Monitorear eventos importantes
- Configurar backup de claves

### 3. Testing en Producción
- Probar registro de agentes
- Probar creación de tareas
- Probar sistema de pagos
- Probar funciones de emergencia

## 🆘 Soporte

Si encuentras problemas durante el despliegue:

1. **Revisar logs** - Los logs contienen información detallada
2. **Verificar configuración** - Asegúrate de que las variables estén correctas
3. **Consultar documentación** - Revisa la documentación de Hardhat 3.0
4. **Contactar soporte** - security@agentgrid.io

## 📚 Recursos Adicionales

- [Hardhat 3.0 Documentation](https://hardhat.org/docs)
- [Ethereum Development Docs](https://ethereum.org/developers)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [AgentGrid Documentation](https://docs.agentgrid.io)

---

**⚠️ IMPORTANTE**: Siempre prueba en testnets antes de desplegar en mainnet. Los contratos desplegados son inmutables y no se pueden modificar.

**🔐 SEGURIDAD**: Nunca compartas tu clave privada y siempre usa wallets seguros para operaciones de administración.
