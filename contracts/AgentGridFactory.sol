// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./AgentRegistry.sol";
import "./PaymentManager.sol";

contract AgentGridFactory is Ownable, ReentrancyGuard, Pausable {
    address public agentRegistryImplementation;
    address public paymentManagerImplementation;
    address public feeRecipient;
    uint256 public deploymentFee = 0.01 ether;
    
    mapping(address => bool) public deployedContracts;
    mapping(address => address) public contractOwners;
    mapping(address => uint256) public deploymentTimestamps;
    
    event ContractDeployed(
        address indexed contractAddress,
        string contractType,
        address indexed owner,
        uint256 timestamp
    );
    
    event ImplementationUpdated(
        string contractType,
        address indexed oldImplementation,
        address indexed newImplementation,
        uint256 timestamp
    );
    
    event DeploymentFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );
    
    modifier onlyDeployer() {
        require(msg.sender == owner(), "AgentGridFactory: Not authorized");
        _;
    }
    
    constructor(
        address _agentRegistryImplementation,
        address _paymentManagerImplementation,
        address _feeRecipient
    ) {
        agentRegistryImplementation = _agentRegistryImplementation;
        paymentManagerImplementation = _paymentManagerImplementation;
        feeRecipient = _feeRecipient;
    }
    
    function deployAgentRegistry(
        address admin,
        uint256 emergencyWithdrawDelay
    ) external payable onlyDeployer whenNotPaused nonReentrant returns (address) {
        require(msg.value >= deploymentFee, "AgentGridFactory: Insufficient deployment fee");
        require(agentRegistryImplementation != address(0), "AgentGridFactory: Implementation not set");
        
        // Deploy new AgentRegistry
        AgentRegistry agentRegistry = new AgentRegistry(emergencyWithdrawDelay);
        address agentRegistryAddress = address(agentRegistry);
        
        // Transfer ownership to admin
        agentRegistry.transferOwnership(admin);
        
        deployedContracts[agentRegistryAddress] = true;
        contractOwners[agentRegistryAddress] = admin;
        deploymentTimestamps[agentRegistryAddress] = block.timestamp;
        
        // Transfer deployment fee to fee recipient
        if (feeRecipient != address(0)) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit ContractDeployed(agentRegistryAddress, "AgentRegistry", admin, block.timestamp);
        
        return agentRegistryAddress;
    }
    
    function deployPaymentManager(
        address admin,
        address _feeRecipient,
        address treasuryAddress,
        address stakingRewardAddress,
        uint256 emergencyWithdrawDelay
    ) external payable onlyDeployer whenNotPaused nonReentrant returns (address) {
        require(msg.value >= deploymentFee, "AgentGridFactory: Insufficient deployment fee");
        require(paymentManagerImplementation != address(0), "AgentGridFactory: Implementation not set");
        
        // Deploy new PaymentManager
        PaymentManager paymentManager = new PaymentManager(
            address(0), // PYUSD token address - should be set after deployment
            _feeRecipient,
            treasuryAddress,
            stakingRewardAddress,
            emergencyWithdrawDelay
        );
        address paymentManagerAddress = address(paymentManager);
        
        // Transfer ownership to admin
        paymentManager.transferOwnership(admin);
        
        deployedContracts[paymentManagerAddress] = true;
        contractOwners[paymentManagerAddress] = admin;
        deploymentTimestamps[paymentManagerAddress] = block.timestamp;
        
        // Transfer deployment fee to fee recipient
        if (feeRecipient != address(0)) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit ContractDeployed(paymentManagerAddress, "PaymentManager", admin, block.timestamp);
        
        return paymentManagerAddress;
    }
    
    function deployFullEcosystem(
        address admin,
        address _feeRecipient,
        address treasuryAddress,
        address stakingRewardAddress,
        uint256 emergencyWithdrawDelay
    ) external payable onlyDeployer whenNotPaused nonReentrant returns (address, address) {
        require(msg.value >= deploymentFee * 2, "AgentGridFactory: Insufficient deployment fee");
        
        address agentRegistry = this.deployAgentRegistry(admin, emergencyWithdrawDelay);
        address paymentManager = this.deployPaymentManager(
            admin,
            _feeRecipient,
            treasuryAddress,
            stakingRewardAddress,
            emergencyWithdrawDelay
        );
        
        return (agentRegistry, paymentManager);
    }
    
    // Admin functions
    function setAgentRegistryImplementation(address implementation) external onlyOwner {
        require(implementation != address(0), "AgentGridFactory: Invalid implementation");
        
        address oldImplementation = agentRegistryImplementation;
        agentRegistryImplementation = implementation;
        
        emit ImplementationUpdated("AgentRegistry", oldImplementation, implementation, block.timestamp);
    }
    
    function setPaymentManagerImplementation(address implementation) external onlyOwner {
        require(implementation != address(0), "AgentGridFactory: Invalid implementation");
        
        address oldImplementation = paymentManagerImplementation;
        paymentManagerImplementation = implementation;
        
        emit ImplementationUpdated("PaymentManager", oldImplementation, implementation, block.timestamp);
    }
    
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "AgentGridFactory: Invalid fee recipient");
        feeRecipient = newFeeRecipient;
    }
    
    function setDeploymentFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "AgentGridFactory: Invalid fee");
        
        uint256 oldFee = deploymentFee;
        deploymentFee = newFee;
        
        emit DeploymentFeeUpdated(oldFee, newFee, block.timestamp);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "AgentGridFactory: No funds to withdraw");
        
        payable(owner()).transfer(amount);
    }
    
    // View functions
    function isContractDeployed(address contractAddress) external view returns (bool) {
        return deployedContracts[contractAddress];
    }
    
    function getContractOwner(address contractAddress) external view returns (address) {
        return contractOwners[contractAddress];
    }
    
    function getDeploymentTimestamp(address contractAddress) external view returns (uint256) {
        return deploymentTimestamps[contractAddress];
    }
    
    receive() external payable {
        // Allow contract to receive ETH for deployment fees
    }
}