@echo off
REM AgentGrid Hardhat 3.0 Setup Script for Windows
REM This script sets up the project for Hardhat 3.0 deployment

echo 🚀 Setting up AgentGrid with Hardhat 3.0...
echo ==============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

REM Install Hardhat 3.0 and related packages
echo.
echo 🔧 Installing Hardhat 3.0 and related packages...
call npm install --save-dev hardhat@^3.0.0
call npm install --save-dev @nomicfoundation/hardhat-toolbox@^6.0.0
call npm install --save-dev @nomicfoundation/hardhat-verify@^2.0.0
call npm install --save-dev @openzeppelin/hardhat-upgrades@^1.35.0
call npm install --save-dev hardhat-gas-reporter@^2.0.0
call npm install --save-dev solidity-coverage@^0.8.0
call npm install --save-dev typechain@^8.3.0
call npm install --save-dev @types/chai@^4.3.0
call npm install --save-dev @types/mocha@^10.0.0
call npm install --save-dev chai@^4.3.0

REM Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo 📝 Creating .env file...
    copy env.example .env
    echo ✅ .env file created. Please update it with your configuration.
) else (
    echo ✅ .env file already exists.
)

REM Create deployments directory
echo.
echo 📁 Creating deployments directory...
if not exist deployments mkdir deployments
echo ✅ Deployments directory created.

REM Compile contracts
echo.
echo 🔨 Compiling contracts...
call npx hardhat compile

if %errorlevel% equ 0 (
    echo ✅ Contracts compiled successfully.
) else (
    echo ❌ Contract compilation failed.
    pause
    exit /b 1
)

REM Run tests
echo.
echo 🧪 Running tests...
call npx hardhat test

if %errorlevel% equ 0 (
    echo ✅ Tests passed successfully.
) else (
    echo ⚠️ Some tests failed. Please check the output above.
)

REM Run security audit
echo.
echo 🔒 Running security audit...
call npx hardhat run scripts/security-audit.ts

REM Display available commands
echo.
echo 🎉 Setup completed successfully!
echo ==============================================
echo.
echo Available commands:
echo   npm run contracts:compile          - Compile contracts
echo   npm run contracts:test             - Run tests
echo   npm run contracts:test:coverage    - Run tests with coverage
echo   npm run contracts:audit            - Run security audit
echo   npm run contracts:gas-report       - Generate gas report
echo   npm run contracts:deploy:hardhat3  - Deploy to Sepolia testnet
echo   npm run contracts:deploy:mainnet   - Deploy to Ethereum mainnet
echo   npm run contracts:deploy:arbitrum  - Deploy to Arbitrum
echo   npm run contracts:deploy:optimism  - Deploy to Optimism
echo   npm run contracts:deploy:base      - Deploy to Base
echo   npm run contracts:deploy:polygon   - Deploy to Polygon
echo   npm run contracts:verify           - Verify contracts on Sepolia
echo   npm run contracts:verify:mainnet   - Verify contracts on mainnet
echo   npm run contracts:node             - Start local Hardhat node
echo   npm run contracts:console          - Open Hardhat console
echo   npm run contracts:size             - Check contract sizes
echo.
echo Next steps:
echo 1. Update .env file with your configuration
echo 2. Fund your deployer account with ETH
echo 3. Run: npm run contracts:deploy:hardhat3
echo.
echo 🔐 Security reminder:
echo - Never commit your private keys to version control
echo - Use environment variables for sensitive data
echo - Always test on testnets before mainnet deployment
echo.
echo Happy coding! 🚀
pause
