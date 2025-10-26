// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentRegistry.sol";
import "./MiniPaymentManager.sol";

contract MiniAgentGridFactory is Ownable {
    address public agentRegistryImplementation;
    address public paymentManagerImplementation;
    address public feeRecipient;
    
    event ContractDeployed(
        address indexed contractAddress,
        string contractType,
        address indexed owner
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
    
    function deployAgentRegistry(address admin) external returns (address) {
        AgentRegistry agentRegistry = new AgentRegistry(86400); // 1 día
        address agentRegistryAddress = address(agentRegistry);
        
        agentRegistry.transferOwnership(admin);
        
        emit ContractDeployed(agentRegistryAddress, "AgentRegistry", admin);
        
        return agentRegistryAddress;
    }
    
    function deployPaymentManager(
        address admin,
        address tokenAddress
    ) external returns (address) {
        MiniPaymentManager paymentManager = new MiniPaymentManager(
            tokenAddress,
            feeRecipient
        );
        address paymentManagerAddress = address(paymentManager);
        
        paymentManager.transferOwnership(admin);
        
        emit ContractDeployed(paymentManagerAddress, "PaymentManager", admin);
        
        return paymentManagerAddress;
    }
    
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newFeeRecipient;
    }
}
