// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SimplePaymentManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public token;
    address public feeRecipient;
    address public treasury;
    address public stakingReward;
    uint256 public emergencyWithdrawDelay;
    
    uint256 public paymentCount;
    uint256 public totalFeesCollected;
    
    struct Payment {
        address from;
        address to;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256) public userPaymentCount;
    
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 fee
    );
    
    event PaymentCompleted(
        uint256 indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    event EmergencyWithdraw(
        address indexed token,
        uint256 amount,
        address indexed to
    );
    
    constructor(
        address _token,
        address _feeRecipient,
        address _treasury,
        address _stakingReward,
        uint256 _emergencyWithdrawDelay
    ) {
        token = IERC20(_token);
        feeRecipient = _feeRecipient;
        treasury = _treasury;
        stakingReward = _stakingReward;
        emergencyWithdrawDelay = _emergencyWithdrawDelay;
    }
    
    function createPayment(
        address to,
        uint256 amount
    ) external nonReentrant returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        uint256 fee = (amount * 25) / 10000; // 0.25% fee
        uint256 totalAmount = amount + fee;
        
        require(token.balanceOf(msg.sender) >= totalAmount, "Insufficient balance");
        
        paymentCount++;
        uint256 paymentId = paymentCount;
        
        payments[paymentId] = Payment({
            from: msg.sender,
            to: to,
            amount: amount,
            fee: fee,
            timestamp: block.timestamp,
            completed: false
        });
        
        userPaymentCount[msg.sender]++;
        totalFeesCollected += fee;
        
        token.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        emit PaymentCreated(paymentId, msg.sender, to, amount, fee);
        
        return paymentId;
    }
    
    function completePayment(uint256 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.from == msg.sender, "Not payment creator");
        require(!payment.completed, "Payment already completed");
        
        payment.completed = true;
        
        // Transfer amount to recipient
        token.safeTransfer(payment.to, payment.amount);
        
        // Transfer fee to fee recipient
        if (feeRecipient != address(0)) {
            token.safeTransfer(feeRecipient, payment.fee);
        }
        
        emit PaymentCompleted(paymentId, payment.from, payment.to, payment.amount);
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        token.safeTransfer(owner(), balance);
        
        emit EmergencyWithdraw(address(token), balance, owner());
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }
    
    function setStakingReward(address _stakingReward) external onlyOwner {
        require(_stakingReward != address(0), "Invalid staking reward");
        stakingReward = _stakingReward;
    }
    
    function getUserPayments(address user) external view returns (uint256[] memory) {
        uint256 count = userPaymentCount[user];
        uint256[] memory userPayments = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= paymentCount; i++) {
            if (payments[i].from == user) {
                userPayments[index] = i;
                index++;
            }
        }
        
        return userPayments;
    }
    
    function getPaymentDetails(uint256 paymentId) external view returns (
        address from,
        address to,
        uint256 amount,
        uint256 fee,
        uint256 timestamp,
        bool completed
    ) {
        Payment memory payment = payments[paymentId];
        return (
            payment.from,
            payment.to,
            payment.amount,
            payment.fee,
            payment.timestamp,
            payment.completed
        );
    }
}
