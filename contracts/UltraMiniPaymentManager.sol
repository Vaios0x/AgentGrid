// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraMiniPaymentManager is Ownable {
    IERC20 public token;
    address public feeRecipient;
    uint256 public paymentCount;
    
    event PaymentCreated(address indexed from, address indexed to, uint256 amount);
    
    constructor(address _token, address _feeRecipient) {
        token = IERC20(_token);
        feeRecipient = _feeRecipient;
    }
    
    function createPayment(address to, uint256 amount) external returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        paymentCount++;
        token.transferFrom(msg.sender, to, amount);
        
        emit PaymentCreated(msg.sender, to, amount);
        
        return paymentCount;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
}
