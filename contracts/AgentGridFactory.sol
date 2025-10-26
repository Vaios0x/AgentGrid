// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./AgentRegistry.sol";
import "./PaymentManager.sol";
import "./AgentRegistryProxy.sol";
import "./PaymentManagerProxy.sol";

/**
 * @title AgentGridFactory
 * @dev Factory contract for deploying AgentGrid ecosystem contracts
 * @author AgentGrid Team
 * @notice This contract manages the deployment and configuration of all AgentGrid contracts
 */
contract AgentGridFactory is AccessControl, ReentrancyGuard, Pausable {
    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    
    // ============ STATE VARIABLES ============
    address public agentRegistryImplementation;
    address public paymentManagerImplementation;
    address public agentRegistryProxy;
    address public paymentManagerProxy;
    
    mapping(address => bool) public deployedContracts;
    mapping(address => address) public contractOwners;
    
    uint256 public deploymentFee;
    address public feeRecipient;
    
    // ============ EVENTS ============
    event ContractDeployed(
        address indexed contractAddress,
        string contractType,
        address indexed owner,
        uint256 timestamp
    );
    
    event ImplementationUpdated(
        string contractType,
        address oldImplementation,
        address newImplementation,
        uint256 timestamp
    );
    
    event DeploymentFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    modifier onlyDeployer() {
        require(hasRole(DEPLOYER_ROLE, msg.sender), "AgentGridFactory: Not deployer");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    constructor(
        address admin,
        uint256 _deploymentFee,
        address _feeRecipient
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(DEPLOYER_ROLE, admin);
        
        deploymentFee = _deploymentFee;
        feeRecipient = _feeRecipient;
    }
    
    // ============ DEPLOYMENT FUNCTIONS ============
    function deployAgentRegistry(
        address admin,
        uint256 emergencyWithdrawDelay
    ) external payable onlyDeployer whenNotPaused nonReentrant returns (address) {
        require(msg.value >= deploymentFee, "AgentGridFactory: Insufficient deployment fee");
        require(agentRegistryImplementation != address(0), "AgentGridFactory: Implementation not set");
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            AgentRegistry.initialize.selector,
            admin,
            emergencyWithdrawDelay
        );
        
        AgentRegistryProxy proxy = new AgentRegistryProxy(agentRegistryImplementation, initData);
        agentRegistryProxy = address(proxy);
        
        deployedContracts[agentRegistryProxy] = true;
        contractOwners[agentRegistryProxy] = admin;
        
        // Transfer deployment fee
        if (deploymentFee > 0) {
            payable(feeRecipient).transfer(deploymentFee);
        }
        
        // Refund excess
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }
        
        emit ContractDeployed(agentRegistryProxy, "AgentRegistry", admin, block.timestamp);
        
        return agentRegistryProxy;
    }
    
    function deployPaymentManager(
        address admin,
        address feeRecipient,
        address treasuryAddress,
        address stakingRewardAddress,
        uint256 emergencyWithdrawDelay
    ) external payable onlyDeployer whenNotPaused nonReentrant returns (address) {
        require(msg.value >= deploymentFee, "AgentGridFactory: Insufficient deployment fee");
        require(paymentManagerImplementation != address(0), "AgentGridFactory: Implementation not set");
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            PaymentManager.initialize.selector,
            admin,
            feeRecipient,
            treasuryAddress,
            stakingRewardAddress,
            emergencyWithdrawDelay
        );
        
        PaymentManagerProxy proxy = new PaymentManagerProxy(paymentManagerImplementation, initData);
        paymentManagerProxy = address(proxy);
        
        deployedContracts[paymentManagerProxy] = true;
        contractOwners[paymentManagerProxy] = admin;
        
        // Transfer deployment fee
        if (deploymentFee > 0) {
            payable(feeRecipient).transfer(deploymentFee);
        }
        
        // Refund excess
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }
        
        emit ContractDeployed(paymentManagerProxy, "PaymentManager", admin, block.timestamp);
        
        return paymentManagerProxy;
    }
    
    function deployFullEcosystem(
        address admin,
        address _feeRecipient,
        address treasuryAddress,
        address stakingRewardAddress,
        uint256 emergencyWithdrawDelay
    ) external payable onlyDeployer whenNotPaused nonReentrant returns (address, address) {
        require(msg.value >= deploymentFee * 2, "AgentGridFactory: Insufficient deployment fee");
        
        address agentRegistry = deployAgentRegistry(admin, emergencyWithdrawDelay);
        address paymentManager = deployPaymentManager(
            admin,
            _feeRecipient,
            treasuryAddress,
            stakingRewardAddress,
            emergencyWithdrawDelay
        );
        
        return (agentRegistry, paymentManager);
    }
    
    // ============ ADMIN FUNCTIONS ============
    function setAgentRegistryImplementation(address implementation) external onlyRole(ADMIN_ROLE) {
        require(implementation != address(0), "AgentGridFactory: Invalid implementation");
        
        address oldImplementation = agentRegistryImplementation;
        agentRegistryImplementation = implementation;
        
        emit ImplementationUpdated("AgentRegistry", oldImplementation, implementation, block.timestamp);
    }
    
    function setPaymentManagerImplementation(address implementation) external onlyRole(ADMIN_ROLE) {
        require(implementation != address(0), "AgentGridFactory: Invalid implementation");
        
        address oldImplementation = paymentManagerImplementation;
        paymentManagerImplementation = implementation;
        
        emit ImplementationUpdated("PaymentManager", oldImplementation, implementation, block.timestamp);
    }
    
    function setDeploymentFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        uint256 oldFee = deploymentFee;
        deploymentFee = newFee;
        
        emit DeploymentFeeUpdated(oldFee, newFee, block.timestamp);
    }
    
    function setFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        require(newRecipient != address(0), "AgentGridFactory: Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    function isContractDeployed(address contractAddress) external view returns (bool) {
        return deployedContracts[contractAddress];
    }
    
    function getContractOwner(address contractAddress) external view returns (address) {
        return contractOwners[contractAddress];
    }
    
    function getDeploymentInfo() external view returns (
        address,
        address,
        address,
        address,
        uint256
    ) {
        return (
            agentRegistryImplementation,
            paymentManagerImplementation,
            agentRegistryProxy,
            paymentManagerProxy,
            deploymentFee
        );
    }
    
    // ============ RECEIVE FUNCTION ============
    receive() external payable {
        // Allow contract to receive ETH for deployment fees
    }
}
