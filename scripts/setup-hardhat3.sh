#!/bin/bash

# AgentGrid Hardhat 3.0 Setup Script
# This script sets up the project for Hardhat 3.0 deployment

echo "🚀 Setting up AgentGrid with Hardhat 3.0..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install Hardhat 3.0 and related packages
echo ""
echo "🔧 Installing Hardhat 3.0 and related packages..."
npm install --save-dev hardhat@^3.0.0
npm install --save-dev @nomicfoundation/hardhat-toolbox@^6.0.0
npm install --save-dev @nomicfoundation/hardhat-verify@^2.0.0
npm install --save-dev @openzeppelin/hardhat-upgrades@^1.35.0
npm install --save-dev hardhat-gas-reporter@^2.0.0
npm install --save-dev solidity-coverage@^0.8.0
npm install --save-dev typechain@^8.3.0
npm install --save-dev @types/chai@^4.3.0
npm install --save-dev @types/mocha@^10.0.0
npm install --save-dev chai@^4.3.0

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Create deployments directory
echo ""
echo "📁 Creating deployments directory..."
mkdir -p deployments
echo "✅ Deployments directory created."

# Compile contracts
echo ""
echo "🔨 Compiling contracts..."
npx hardhat compile

if [ $? -eq 0 ]; then
    echo "✅ Contracts compiled successfully."
else
    echo "❌ Contract compilation failed."
    exit 1
fi

# Run tests
echo ""
echo "🧪 Running tests..."
npx hardhat test

if [ $? -eq 0 ]; then
    echo "✅ Tests passed successfully."
else
    echo "⚠️ Some tests failed. Please check the output above."
fi

# Run security audit
echo ""
echo "🔒 Running security audit..."
npx hardhat run scripts/security-audit.ts

# Display available commands
echo ""
echo "🎉 Setup completed successfully!"
echo "=============================================="
echo ""
echo "Available commands:"
echo "  npm run contracts:compile          - Compile contracts"
echo "  npm run contracts:test             - Run tests"
echo "  npm run contracts:test:coverage    - Run tests with coverage"
echo "  npm run contracts:audit            - Run security audit"
echo "  npm run contracts:gas-report       - Generate gas report"
echo "  npm run contracts:deploy:hardhat3  - Deploy to Sepolia testnet"
echo "  npm run contracts:deploy:mainnet   - Deploy to Ethereum mainnet"
echo "  npm run contracts:deploy:arbitrum  - Deploy to Arbitrum"
echo "  npm run contracts:deploy:optimism  - Deploy to Optimism"
echo "  npm run contracts:deploy:base      - Deploy to Base"
echo "  npm run contracts:deploy:polygon   - Deploy to Polygon"
echo "  npm run contracts:verify           - Verify contracts on Sepolia"
echo "  npm run contracts:verify:mainnet   - Verify contracts on mainnet"
echo "  npm run contracts:node             - Start local Hardhat node"
echo "  npm run contracts:console          - Open Hardhat console"
echo "  npm run contracts:size             - Check contract sizes"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Fund your deployer account with ETH"
echo "3. Run: npm run contracts:deploy:hardhat3"
echo ""
echo "🔐 Security reminder:"
echo "- Never commit your private keys to version control"
echo "- Use environment variables for sensitive data"
echo "- Always test on testnets before mainnet deployment"
echo ""
echo "Happy coding! 🚀"
