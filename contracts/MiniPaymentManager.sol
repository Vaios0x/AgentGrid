// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MiniPaymentManager is Ownable {
    IERC20 public token;
    address public feeRecipient;
    uint256 public paymentCount;
    
    struct Payment {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(uint256 => Payment) public payments;
    
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    constructor(address _token, address _feeRecipient) {
        token = IERC20(_token);
        feeRecipient = _feeRecipient;
    }
    
    function createPayment(address to, uint256 amount) external returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        paymentCount++;
        uint256 paymentId = paymentCount;
        
        payments[paymentId] = Payment({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        });
        
        token.transferFrom(msg.sender, to, amount);
        
        emit PaymentCreated(paymentId, msg.sender, to, amount);
        
        return paymentId;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
}
