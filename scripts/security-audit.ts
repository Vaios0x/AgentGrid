import { ethers } from "hardhat";
import { Contract } from "ethers";

/**
 * Security Audit Script for AgentGrid Enterprise Contracts
 * This script performs automated security checks and validations
 */

interface SecurityCheck {
  name: string;
  description: string;
  passed: boolean;
  details: string;
}

class SecurityAuditor {
  private checks: SecurityCheck[] = [];

  addCheck(name: string, description: string, passed: boolean, details: string) {
    this.checks.push({ name, description, passed, details });
  }

  async runAudit() {
    console.log("🔒 Starting AgentGrid Security Audit...\n");

    // Deploy contracts for testing
    const [owner, user1, user2, admin] = await ethers.getSigners();

    // Deploy AgentRegistry
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
    await agentRegistry.initialize(admin.address, 7 * 24 * 60 * 60);

    // Deploy PaymentManager
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy();
    await paymentManager.waitForDeployment();
    await paymentManager.initialize(
      admin.address,
      admin.address,
      admin.address,
      admin.address,
      7 * 24 * 60 * 60
    );

    // Deploy Mock Token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // Run security checks
    await this.checkAccessControl(agentRegistry, paymentManager, admin, user1);
    await this.checkReentrancyProtection(agentRegistry, paymentManager, user1, user2);
    await this.checkInputValidation(agentRegistry, paymentManager, user1);
    await this.checkEmergencyFunctions(agentRegistry, paymentManager, admin);
    await this.checkUpgradeability(agentRegistry, paymentManager, admin);
    await this.checkGasOptimization(agentRegistry, paymentManager, user1);
    await this.checkEventLogging(agentRegistry, paymentManager, user1);
    await this.checkCircuitBreaker(agentRegistry, paymentManager, admin);
    await this.checkBlacklistFunctionality(agentRegistry, paymentManager, admin, user1);
    await this.checkFeeCalculation(paymentManager, mockToken, user1, user2);

    // Generate report
    this.generateReport();
  }

  private async checkAccessControl(agentRegistry: Contract, paymentManager: Contract, admin: any, user1: any) {
    console.log("🔐 Checking Access Control...");

    try {
      // Test admin-only functions
      await agentRegistry.connect(admin).blacklistAddress(user1.address, true);
      this.addCheck(
        "Admin Access Control",
        "Admin can execute admin-only functions",
        true,
        "Admin successfully executed blacklistAddress function"
      );
    } catch (error) {
      this.addCheck(
        "Admin Access Control",
        "Admin can execute admin-only functions",
        false,
        `Error: ${error}`
      );
    }

    try {
      // Test user cannot execute admin functions
      await agentRegistry.connect(user1).blacklistAddress(user1.address, true);
      this.addCheck(
        "User Access Control",
        "Regular users cannot execute admin functions",
        false,
        "User was able to execute admin function - SECURITY ISSUE"
      );
    } catch (error) {
      this.addCheck(
        "User Access Control",
        "Regular users cannot execute admin functions",
        true,
        "User correctly blocked from admin function"
      );
    }
  }

  private async checkReentrancyProtection(agentRegistry: Contract, paymentManager: Contract, user1: any, user2: any) {
    console.log("🔄 Checking Reentrancy Protection...");

    try {
      // Test that contracts have reentrancy guard
      const agentRegistryCode = await ethers.provider.getCode(await agentRegistry.getAddress());
      const hasReentrancyGuard = agentRegistryCode.includes("ReentrancyGuard");
      
      this.addCheck(
        "Reentrancy Guard - AgentRegistry",
        "Contract has reentrancy protection",
        hasReentrancyGuard,
        hasReentrancyGuard ? "ReentrancyGuard found in bytecode" : "ReentrancyGuard not found"
      );
    } catch (error) {
      this.addCheck(
        "Reentrancy Guard - AgentRegistry",
        "Contract has reentrancy protection",
        false,
        `Error checking bytecode: ${error}`
      );
    }
  }

  private async checkInputValidation(agentRegistry: Contract, paymentManager: Contract, user1: any) {
    console.log("✅ Checking Input Validation...");

    try {
      // Test empty string validation
      await agentRegistry.connect(user1).registerAgent(
        "", // Empty name
        "Test Description",
        "AI",
        ethers.parseEther("1"),
        "ipfs://test"
      );
      this.addCheck(
        "Input Validation - Empty Name",
        "Contract rejects empty agent names",
        false,
        "Contract accepted empty name - SECURITY ISSUE"
      );
    } catch (error) {
      this.addCheck(
        "Input Validation - Empty Name",
        "Contract rejects empty agent names",
        true,
        "Contract correctly rejected empty name"
      );
    }

    try {
      // Test zero amount validation
      await agentRegistry.connect(user1).registerAgent(
        "Test Agent",
        "Test Description",
        "AI",
        0, // Zero price
        "ipfs://test"
      );
      this.addCheck(
        "Input Validation - Zero Price",
        "Contract rejects zero prices",
        false,
        "Contract accepted zero price - SECURITY ISSUE"
      );
    } catch (error) {
      this.addCheck(
        "Input Validation - Zero Price",
        "Contract rejects zero prices",
        true,
        "Contract correctly rejected zero price"
      );
    }
  }

  private async checkEmergencyFunctions(agentRegistry: Contract, paymentManager: Contract, admin: any) {
    console.log("🚨 Checking Emergency Functions...");

    try {
      // Test pause functionality
      await agentRegistry.connect(admin).pause();
      const isPaused = await agentRegistry.paused();
      
      this.addCheck(
        "Emergency Pause",
        "Contract can be paused by admin",
        isPaused,
        isPaused ? "Contract successfully paused" : "Contract pause failed"
      );

      // Test unpause
      await agentRegistry.connect(admin).unpause();
      const isUnpaused = !(await agentRegistry.paused());
      
      this.addCheck(
        "Emergency Unpause",
        "Contract can be unpaused by admin",
        isUnpaused,
        isUnpaused ? "Contract successfully unpaused" : "Contract unpause failed"
      );
    } catch (error) {
      this.addCheck(
        "Emergency Functions",
        "Emergency pause/unpause functionality",
        false,
        `Error: ${error}`
      );
    }
  }

  private async checkUpgradeability(agentRegistry: Contract, paymentManager: Contract, admin: any) {
    console.log("⬆️ Checking Upgradeability...");

    try {
      // Check if contracts are upgradeable
      const agentRegistryCode = await ethers.provider.getCode(await agentRegistry.getAddress());
      const hasUpgradeable = agentRegistryCode.includes("UUPSUpgradeable") || agentRegistryCode.includes("Initializable");
      
      this.addCheck(
        "Upgradeability - AgentRegistry",
        "Contract supports upgrades",
        hasUpgradeable,
        hasUpgradeable ? "Upgradeable pattern found" : "Not upgradeable"
      );
    } catch (error) {
      this.addCheck(
        "Upgradeability - AgentRegistry",
        "Contract supports upgrades",
        false,
        `Error: ${error}`
      );
    }
  }

  private async checkGasOptimization(agentRegistry: Contract, paymentManager: Contract, user1: any) {
    console.log("⛽ Checking Gas Optimization...");

    try {
      // Test agent registration gas usage
      const tx = await agentRegistry.connect(user1).registerAgent(
        "Test Agent",
        "Test Description",
        "AI",
        ethers.parseEther("1"),
        "ipfs://test"
      );
      
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      
      this.addCheck(
        "Gas Optimization - Agent Registration",
        "Agent registration uses reasonable gas",
        gasUsed < 500000n,
        `Gas used: ${gasUsed.toString()} (${gasUsed < 500000n ? 'Good' : 'High'})`
      );
    } catch (error) {
      this.addCheck(
        "Gas Optimization - Agent Registration",
        "Agent registration uses reasonable gas",
        false,
        `Error: ${error}`
      );
    }
  }

  private async checkEventLogging(agentRegistry: Contract, paymentManager: Contract, user1: any) {
    console.log("📝 Checking Event Logging...");

    try {
      // Test that events are emitted
      const tx = await agentRegistry.connect(user1).registerAgent(
        "Test Agent",
        "Test Description",
        "AI",
        ethers.parseEther("1"),
        "ipfs://test"
      );
      
      const receipt = await tx.wait();
      const events = receipt.logs;
      
      this.addCheck(
        "Event Logging - Agent Registration",
        "Events are properly emitted",
        events.length > 0,
        `Events emitted: ${events.length}`
      );
    } catch (error) {
      this.addCheck(
        "Event Logging - Agent Registration",
        "Events are properly emitted",
        false,
        `Error: ${error}`
      );
    }
  }

  private async checkCircuitBreaker(agentRegistry: Contract, paymentManager: Contract, admin: any) {
    console.log("🔌 Checking Circuit Breaker...");

    try {
      // Test circuit breaker activation
      await agentRegistry.connect(admin).activateCircuitBreaker();
      const isActive = await agentRegistry.circuitBreakerActive();
      
      this.addCheck(
        "Circuit Breaker - Activation",
        "Circuit breaker can be activated",
        isActive,
        isActive ? "Circuit breaker activated successfully" : "Circuit breaker activation failed"
      );
    } catch (error) {
      this.addCheck(
        "Circuit Breaker - Activation",
        "Circuit breaker can be activated",
        false,
        `Error: ${error}`
      );
    }
  }

  private async checkBlacklistFunctionality(agentRegistry: Contract, paymentManager: Contract, admin: any, user1: any) {
    console.log("🚫 Checking Blacklist Functionality...");

    try {
      // Test blacklisting
      await agentRegistry.connect(admin).blacklistAddress(user1.address, true);
      const isBlacklisted = await agentRegistry.blacklistedAddresses(user1.address);
      
      this.addCheck(
        "Blacklist - Address Blacklisting",
        "Addresses can be blacklisted",
        isBlacklisted,
        isBlacklisted ? "Address successfully blacklisted" : "Blacklisting failed"
      );

      // Test blacklisted user cannot register agent
      try {
        await agentRegistry.connect(user1).registerAgent(
          "Test Agent",
          "Test Description",
          "AI",
          ethers.parseEther("1"),
          "ipfs://test"
        );
        this.addCheck(
          "Blacklist - Prevention",
          "Blacklisted users cannot register agents",
          false,
          "Blacklisted user was able to register agent - SECURITY ISSUE"
        );
      } catch (error) {
        this.addCheck(
          "Blacklist - Prevention",
          "Blacklisted users cannot register agents",
          true,
          "Blacklisted user correctly blocked"
        );
      }
    } catch (error) {
      this.addCheck(
        "Blacklist Functionality",
        "Blacklist functionality works correctly",
        false,
        `Error: ${error}`
      );
    }
  }

  private async checkFeeCalculation(paymentManager: Contract, mockToken: Contract, user1: any, user2: any) {
    console.log("💰 Checking Fee Calculation...");

    try {
      // Set up token support
      await paymentManager.connect(await ethers.getSigners()).then(signers => signers[0]).then(admin => 
        paymentManager.connect(admin).setTokenSupport(await mockToken.getAddress(), true, false, 0)
      );

      // Mint and approve tokens
      await mockToken.mint(user1.address, ethers.parseEther("1000"));
      await mockToken.connect(user1).approve(await paymentManager.getAddress(), ethers.parseEther("1000"));

      // Create payment
      await paymentManager.connect(user1).createPayment(
        user2.address,
        await mockToken.getAddress(),
        ethers.parseEther("100"),
        "Test payment",
        ethers.keccak256(ethers.toUtf8Bytes("test-task")),
        Math.floor(Date.now() / 1000) + 3600
      );

      // Calculate expected fees
      const expectedPlatformFee = (ethers.parseEther("100") * 500n) / 10000n; // 5%
      const expectedTreasuryFee = (ethers.parseEther("100") * 200n) / 10000n; // 2%
      const expectedStakingReward = (ethers.parseEther("100") * 100n) / 10000n; // 1%
      const expectedTotalFees = expectedPlatformFee + expectedTreasuryFee + expectedStakingReward;

      // Complete payment
      await paymentManager.connect(user1).completePayment(1);

      // Check fee calculation
      const payment = await paymentManager.getPayment(1);
      const calculatedFees = payment.fee;
      
      this.addCheck(
        "Fee Calculation - Accuracy",
        "Fees are calculated correctly",
        calculatedFees === expectedTotalFees,
        `Expected: ${expectedTotalFees.toString()}, Got: ${calculatedFees.toString()}`
      );
    } catch (error) {
      this.addCheck(
        "Fee Calculation",
        "Fees are calculated correctly",
        false,
        `Error: ${error}`
      );
    }
  }

  private generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("🔒 AGENTGRID SECURITY AUDIT REPORT");
    console.log("=".repeat(60));

    const passedChecks = this.checks.filter(check => check.passed).length;
    const totalChecks = this.checks.length;
    const securityScore = (passedChecks / totalChecks) * 100;

    console.log(`\n📊 Security Score: ${securityScore.toFixed(1)}% (${passedChecks}/${totalChecks})`);
    console.log(`\n✅ Passed: ${passedChecks}`);
    console.log(`❌ Failed: ${totalChecks - passedChecks}`);

    console.log("\n📋 Detailed Results:");
    console.log("-".repeat(60));

    this.checks.forEach((check, index) => {
      const status = check.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`\n${index + 1}. ${check.name} - ${status}`);
      console.log(`   Description: ${check.description}`);
      console.log(`   Details: ${check.details}`);
    });

    console.log("\n" + "=".repeat(60));
    
    if (securityScore >= 90) {
      console.log("🎉 EXCELLENT! Contract is ready for production.");
    } else if (securityScore >= 80) {
      console.log("⚠️  GOOD! Minor issues need to be addressed.");
    } else if (securityScore >= 70) {
      console.log("⚠️  FAIR! Several issues need attention.");
    } else {
      console.log("🚨 POOR! Major security issues detected. Do not deploy!");
    }

    console.log("=".repeat(60) + "\n");
  }
}

async function main() {
  const auditor = new SecurityAuditor();
  await auditor.runAudit();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Security audit failed:", error);
    process.exit(1);
  });
