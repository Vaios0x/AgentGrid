// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentRegistry.sol";
import "./UltraMiniPaymentManager.sol";

contract UltraMiniFactory is Ownable {
    address public feeRecipient;
    
    event ContractDeployed(address indexed contractAddress, string contractType);
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    function deployAgentRegistry() external returns (address) {
        AgentRegistry agentRegistry = new AgentRegistry(86400);
        address agentRegistryAddress = address(agentRegistry);
        agentRegistry.transferOwnership(msg.sender);
        
        emit ContractDeployed(agentRegistryAddress, "AgentRegistry");
        
        return agentRegistryAddress;
    }
    
    function deployPaymentManager(address tokenAddress) external returns (address) {
        UltraMiniPaymentManager paymentManager = new UltraMiniPaymentManager(
            tokenAddress,
            feeRecipient
        );
        address paymentManagerAddress = address(paymentManager);
        paymentManager.transferOwnership(msg.sender);
        
        emit ContractDeployed(paymentManagerAddress, "PaymentManager");
        
        return paymentManagerAddress;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
}
