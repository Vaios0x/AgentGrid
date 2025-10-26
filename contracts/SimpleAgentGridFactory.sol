// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentRegistry.sol";
import "./PaymentManager.sol";

contract SimpleAgentGridFactory is Ownable {
    address public agentRegistryImplementation;
    address public paymentManagerImplementation;
    address public feeRecipient;
    uint256 public deploymentFee = 0.01 ether;
    
    event ContractDeployed(
        address indexed contractAddress,
        string contractType,
        address indexed owner,
        uint256 timestamp
    );
    
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
    ) external payable returns (address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        
        AgentRegistry agentRegistry = new AgentRegistry(emergencyWithdrawDelay);
        address agentRegistryAddress = address(agentRegistry);
        
        agentRegistry.transferOwnership(admin);
        
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
    ) external payable returns (address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        
        PaymentManager paymentManager = new PaymentManager(
            address(0), // PYUSD token address - should be set after deployment
            _feeRecipient,
            treasuryAddress,
            stakingRewardAddress,
            emergencyWithdrawDelay
        );
        address paymentManagerAddress = address(paymentManager);
        
        paymentManager.transferOwnership(admin);
        
        if (feeRecipient != address(0)) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit ContractDeployed(paymentManagerAddress, "PaymentManager", admin, block.timestamp);
        
        return paymentManagerAddress;
    }
    
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newFeeRecipient;
    }
    
    function setDeploymentFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "Invalid fee");
        deploymentFee = newFee;
    }
    
    receive() external payable {
        // Allow contract to receive ETH for deployment fees
    }
}
