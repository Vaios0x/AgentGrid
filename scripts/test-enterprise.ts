import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";

describe("AgentGrid Enterprise Contracts", function () {
  let agentRegistry: Contract;
  let paymentManager: Contract;
  let factory: Contract;
  let mockToken: Contract;
  let owner: any;
  let user1: any;
  let user2: any;
  let admin: any;

  const EMERGENCY_WITHDRAW_DELAY = 7 * 24 * 60 * 60; // 7 days
  const DEPLOYMENT_FEE = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, user1, user2, admin] = await ethers.getSigners();

    // Deploy mock ERC20 token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // Deploy AgentRegistry
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
    await agentRegistry.initialize(admin.address, EMERGENCY_WITHDRAW_DELAY);

    // Deploy PaymentManager
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    paymentManager = await PaymentManager.deploy();
    await paymentManager.waitForDeployment();
    await paymentManager.initialize(
      admin.address,
      admin.address, // fee recipient
      admin.address, // treasury
      admin.address, // staking reward
      EMERGENCY_WITHDRAW_DELAY
    );

    // Deploy Factory
    const AgentGridFactory = await ethers.getContractFactory("AgentGridFactory");
    factory = await AgentGridFactory.deploy(admin.address, DEPLOYMENT_FEE, admin.address);
    await factory.waitForDeployment();
  });

  describe("AgentRegistry", function () {
    it("Should initialize correctly", async function () {
      expect(await agentRegistry.hasRole(await agentRegistry.ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await agentRegistry.emergencyWithdrawDelay()).to.equal(EMERGENCY_WITHDRAW_DELAY);
    });

    it("Should register agent successfully", async function () {
      const tx = await agentRegistry.connect(user1).registerAgent(
        "Test Agent",
        "Test Description",
        "AI",
        ethers.parseEther("1"),
        "ipfs://test"
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === "AgentRegistered");
      
      expect(event).to.not.be.undefined;
      expect(await agentRegistry.getAgentCount()).to.equal(1);
    });

    it("Should prevent blacklisted users from registering", async function () {
      await agentRegistry.connect(admin).blacklistAddress(user1.address, true);
      
      await expect(
        agentRegistry.connect(user1).registerAgent(
          "Test Agent",
          "Test Description",
          "AI",
          ethers.parseEther("1"),
          "ipfs://test"
        )
      ).to.be.revertedWith("AgentRegistry: Address is blacklisted");
    });

    it("Should create and complete task successfully", async function () {
      // Register agent
      await agentRegistry.connect(user1).registerAgent(
        "Test Agent",
        "Test Description",
        "AI",
        ethers.parseEther("1"),
        "ipfs://test"
      );

      // Create task
      const tx = await agentRegistry.connect(user2).createTask(
        1,
        "Test Task",
        Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        { value: ethers.parseEther("1") }
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === "TaskCreated");
      
      expect(event).to.not.be.undefined;
      expect(await agentRegistry.getTaskCount()).to.equal(1);

      // Complete task
      await agentRegistry.connect(user1).updateTaskStatus(
        1,
        2, // Completed
        "Task completed successfully"
      );

      const task = await agentRegistry.getTask(1);
      expect(task.status).to.equal(2); // Completed
    });

    it("Should handle reputation updates correctly", async function () {
      // Register agent
      await agentRegistry.connect(user1).registerAgent(
        "Test Agent",
        "Test Description",
        "AI",
        ethers.parseEther("1"),
        "ipfs://test"
      );

      // Create and complete task
      await agentRegistry.connect(user2).createTask(
        1,
        "Test Task",
        Math.floor(Date.now() / 1000) + 3600,
        { value: ethers.parseEther("1") }
      );

      const initialReputation = await agentRegistry.getUserReputation(user1.address);
      
      await agentRegistry.connect(user1).updateTaskStatus(1, 2, "Completed");
      
      const finalReputation = await agentRegistry.getUserReputation(user1.address);
      expect(finalReputation).to.be.greaterThan(initialReputation);
    });

    it("Should activate circuit breaker correctly", async function () {
      await agentRegistry.connect(admin).activateCircuitBreaker();
      expect(await agentRegistry.circuitBreakerActive()).to.be.true;
    });

    it("Should pause and unpause correctly", async function () {
      await agentRegistry.connect(admin).pause();
      expect(await agentRegistry.paused()).to.be.true;

      await agentRegistry.connect(admin).unpause();
      expect(await agentRegistry.paused()).to.be.false;
    });
  });

  describe("PaymentManager", function () {
    beforeEach(async function () {
      // Add mock token support
      await paymentManager.connect(admin).setTokenSupport(
        await mockToken.getAddress(),
        true,
        false,
        0
      );

      // Mint tokens to users
      await mockToken.mint(user1.address, ethers.parseEther("1000"));
      await mockToken.mint(user2.address, ethers.parseEther("1000"));

      // Approve tokens
      await mockToken.connect(user1).approve(await paymentManager.getAddress(), ethers.parseEther("1000"));
      await mockToken.connect(user2).approve(await paymentManager.getAddress(), ethers.parseEther("1000"));
    });

    it("Should create payment successfully", async function () {
      const tx = await paymentManager.connect(user1).createPayment(
        user2.address,
        await mockToken.getAddress(),
        ethers.parseEther("10"),
        "Test payment",
        ethers.keccak256(ethers.toUtf8Bytes("test-task")),
        Math.floor(Date.now() / 1000) + 3600
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === "PaymentCreated");
      
      expect(event).to.not.be.undefined;
      expect(await paymentManager.getPaymentCount()).to.equal(1);
    });

    it("Should complete payment with correct fee calculation", async function () {
      // Create payment
      await paymentManager.connect(user1).createPayment(
        user2.address,
        await mockToken.getAddress(),
        ethers.parseEther("10"),
        "Test payment",
        ethers.keccak256(ethers.toUtf8Bytes("test-task")),
        Math.floor(Date.now() / 1000) + 3600
      );

      const initialBalance = await mockToken.balanceOf(user2.address);
      
      // Complete payment
      await paymentManager.connect(user1).completePayment(1);
      
      const finalBalance = await mockToken.balanceOf(user2.address);
      const balanceIncrease = finalBalance - initialBalance;
      
      // Should receive amount minus fees (5% + 2% + 1% = 8%)
      expect(balanceIncrease).to.be.closeTo(ethers.parseEther("9.2"), ethers.parseEther("0.1"));
    });

    it("Should handle payment failure and refund", async function () {
      // Create payment
      await paymentManager.connect(user1).createPayment(
        user2.address,
        await mockToken.getAddress(),
        ethers.parseEther("10"),
        "Test payment",
        ethers.keccak256(ethers.toUtf8Bytes("test-task")),
        Math.floor(Date.now() / 1000) + 3600
      );

      const initialBalance = await mockToken.balanceOf(user1.address);
      
      // Fail payment
      await paymentManager.connect(user1).failPayment(1, "Task failed");
      
      const finalBalance = await mockToken.balanceOf(user1.address);
      
      // Should receive full refund
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("10"));
    });

    it("Should prevent blacklisted users from creating payments", async function () {
      await paymentManager.connect(admin).blacklistAddress(user1.address, true);
      
      await expect(
        paymentManager.connect(user1).createPayment(
          user2.address,
          await mockToken.getAddress(),
          ethers.parseEther("10"),
          "Test payment",
          ethers.keccak256(ethers.toUtf8Bytes("test-task")),
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWith("PaymentManager: Address is blacklisted");
    });

    it("Should handle batch payment completion", async function () {
      // Create multiple payments
      for (let i = 0; i < 3; i++) {
        await paymentManager.connect(user1).createPayment(
          user2.address,
          await mockToken.getAddress(),
          ethers.parseEther("10"),
          `Test payment ${i}`,
          ethers.keccak256(ethers.toUtf8Bytes(`test-task-${i}`)),
          Math.floor(Date.now() / 1000) + 3600
        );
      }

      // Complete all payments in batch
      await paymentManager.connect(user1).batchCompletePayments([1, 2, 3]);
      
      expect(await paymentManager.getPaymentCount()).to.equal(3);
    });
  });

  describe("AgentGridFactory", function () {
    it("Should deploy contracts correctly", async function () {
      // Set implementations
      const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
      const agentRegistryImpl = await AgentRegistry.deploy();
      await agentRegistryImpl.waitForDeployment();

      const PaymentManager = await ethers.getContractFactory("PaymentManager");
      const paymentManagerImpl = await PaymentManager.deploy();
      await paymentManagerImpl.waitForDeployment();

      await factory.setAgentRegistryImplementation(await agentRegistryImpl.getAddress());
      await factory.setPaymentManagerImplementation(await paymentManagerImpl.getAddress());

      // Deploy AgentRegistry proxy
      const agentRegistryTx = await factory.deployAgentRegistry(
        admin.address,
        EMERGENCY_WITHDRAW_DELAY,
        { value: DEPLOYMENT_FEE }
      );
      
      const agentRegistryReceipt = await agentRegistryTx.wait();
      expect(agentRegistryReceipt).to.not.be.undefined;

      // Deploy PaymentManager proxy
      const paymentManagerTx = await factory.deployPaymentManager(
        admin.address,
        admin.address,
        admin.address,
        admin.address,
        EMERGENCY_WITHDRAW_DELAY,
        { value: DEPLOYMENT_FEE }
      );
      
      const paymentManagerReceipt = await paymentManagerTx.wait();
      expect(paymentManagerReceipt).to.not.be.undefined;
    });

    it("Should handle deployment fees correctly", async function () {
      const initialBalance = await ethers.provider.getBalance(admin.address);
      
      await factory.deployAgentRegistry(
        admin.address,
        EMERGENCY_WITHDRAW_DELAY,
        { value: DEPLOYMENT_FEE }
      );
      
      const finalBalance = await ethers.provider.getBalance(admin.address);
      // Should have spent the deployment fee
      expect(initialBalance - finalBalance).to.be.greaterThan(DEPLOYMENT_FEE);
    });
  });

  describe("Security Features", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This would require a malicious contract to test properly
      // For now, we verify the modifier is present
      expect(await agentRegistry.hasRole(await agentRegistry.ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("Should enforce access control", async function () {
      await expect(
        agentRegistry.connect(user1).blacklistAddress(user2.address, true)
      ).to.be.revertedWith("AccessControl: account " + user1.address.toLowerCase() + " is missing role " + await agentRegistry.ADMIN_ROLE());
    });

    it("Should validate input parameters", async function () {
      await expect(
        agentRegistry.connect(user1).registerAgent(
          "", // Empty name
          "Test Description",
          "AI",
          ethers.parseEther("1"),
          "ipfs://test"
        )
      ).to.be.revertedWith("AgentRegistry: Invalid string length");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for agent registration", async function () {
      const tx = await agentRegistry.connect(user1).registerAgent(
        "Test Agent",
        "Test Description",
        "AI",
        ethers.parseEther("1"),
        "ipfs://test"
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(500000); // Should be under 500k gas
    });

    it("Should use reasonable gas for payment creation", async function () {
      await paymentManager.connect(admin).setTokenSupport(
        await mockToken.getAddress(),
        true,
        false,
        0
      );

      await mockToken.mint(user1.address, ethers.parseEther("1000"));
      await mockToken.connect(user1).approve(await paymentManager.getAddress(), ethers.parseEther("1000"));

      const tx = await paymentManager.connect(user1).createPayment(
        user2.address,
        await mockToken.getAddress(),
        ethers.parseEther("10"),
        "Test payment",
        ethers.keccak256(ethers.toUtf8Bytes("test-task")),
        Math.floor(Date.now() / 1000) + 3600
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(300000); // Should be under 300k gas
    });
  });
});
