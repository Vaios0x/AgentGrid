// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PaymentManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public pyusdToken;
    
    struct Payment {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        string description;
        PaymentStatus status;
        uint256 createdAt;
        uint256 completedAt;
        bytes32 taskHash; // Hash of the task this payment is for
    }
    
    enum PaymentStatus {
        Pending,
        Completed,
        Failed,
        Refunded
    }
    
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public userPayments;
    mapping(bytes32 => uint256) public taskPayments;
    
    uint256 private _paymentIds;
    uint256 public platformFeePercentage = 500; // 5% (500 basis points)
    address public feeRecipient;
    
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 taskHash
    );
    
    event PaymentCompleted(
        uint256 indexed paymentId,
        address indexed to,
        uint256 amount,
        uint256 fee
    );
    
    event PaymentFailed(
        uint256 indexed paymentId,
        string reason
    );
    
    event PaymentRefunded(
        uint256 indexed paymentId,
        address indexed to,
        uint256 amount
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    event FeeRecipientUpdated(
        address oldRecipient,
        address newRecipient
    );
    
    modifier validPayment(uint256 paymentId) {
        require(payments[paymentId].id != 0, "Payment does not exist");
        _;
    }
    
    constructor(address _pyusdToken, address _feeRecipient) {
        pyusdToken = IERC20(_pyusdToken);
        feeRecipient = _feeRecipient;
    }
    
    function createPayment(
        address to,
        uint256 amount,
        string memory description,
        bytes32 taskHash
    ) external nonReentrant returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(
            pyusdToken.balanceOf(msg.sender) >= amount,
            "Insufficient PYUSD balance"
        );
        require(
            pyusdToken.allowance(msg.sender, address(this)) >= amount,
            "Insufficient PYUSD allowance"
        );
        
        _paymentIds++;
        uint256 paymentId = _paymentIds;
        
        payments[paymentId] = Payment({
            id: paymentId,
            from: msg.sender,
            to: to,
            amount: amount,
            description: description,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            taskHash: taskHash
        });
        
        userPayments[msg.sender].push(paymentId);
        userPayments[to].push(paymentId);
        taskPayments[taskHash] = paymentId;
        
        // Transfer PYUSD from sender to contract
        pyusdToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit PaymentCreated(paymentId, msg.sender, to, amount, taskHash);
        
        return paymentId;
    }
    
    function completePayment(uint256 paymentId) 
        external 
        validPayment(paymentId) 
        nonReentrant 
    {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Pending, "Payment not pending");
        require(msg.sender == payment.from, "Not payment sender");
        
        uint256 fee = (payment.amount * platformFeePercentage) / 10000;
        uint256 recipientAmount = payment.amount - fee;
        
        // Transfer PYUSD to recipient
        pyusdToken.safeTransfer(payment.to, recipientAmount);
        
        // Transfer fee to platform
        if (fee > 0) {
            pyusdToken.safeTransfer(feeRecipient, fee);
        }
        
        payment.status = PaymentStatus.Completed;
        payment.completedAt = block.timestamp;
        
        emit PaymentCompleted(paymentId, payment.to, recipientAmount, fee);
    }
    
    function failPayment(uint256 paymentId, string memory reason) 
        external 
        validPayment(paymentId) 
        nonReentrant 
    {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Pending, "Payment not pending");
        require(
            msg.sender == payment.from || msg.sender == payment.to,
            "Not authorized"
        );
        
        // Refund PYUSD to sender
        pyusdToken.safeTransfer(payment.from, payment.amount);
        
        payment.status = PaymentStatus.Failed;
        payment.completedAt = block.timestamp;
        
        emit PaymentFailed(paymentId, reason);
    }
    
    function refundPayment(uint256 paymentId) 
        external 
        validPayment(paymentId) 
        nonReentrant 
    {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Completed, "Payment not completed");
        require(
            msg.sender == payment.from || msg.sender == owner(),
            "Not authorized to refund"
        );
        
        // Refund PYUSD to sender
        pyusdToken.safeTransfer(payment.from, payment.amount);
        
        payment.status = PaymentStatus.Refunded;
        
        emit PaymentRefunded(paymentId, payment.from, payment.amount);
    }
    
    function batchCompletePayments(uint256[] calldata paymentIds) 
        external 
        nonReentrant 
    {
        for (uint256 i = 0; i < paymentIds.length; i++) {
            uint256 paymentId = paymentIds[i];
            Payment storage payment = payments[paymentId];
            
            require(payment.status == PaymentStatus.Pending, "Payment not pending");
            require(msg.sender == payment.from, "Not payment sender");
            
            uint256 fee = (payment.amount * platformFeePercentage) / 10000;
            uint256 recipientAmount = payment.amount - fee;
            
            // Transfer PYUSD to recipient
            pyusdToken.safeTransfer(payment.to, recipientAmount);
            
            // Transfer fee to platform
            if (fee > 0) {
                pyusdToken.safeTransfer(feeRecipient, fee);
            }
            
            payment.status = PaymentStatus.Completed;
            payment.completedAt = block.timestamp;
            
            emit PaymentCompleted(paymentId, payment.to, recipientAmount, fee);
        }
    }
    
    function setPlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }
    
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }
    
    function getPayment(uint256 paymentId) external view validPayment(paymentId) returns (Payment memory) {
        return payments[paymentId];
    }
    
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }
    
    function getTaskPayment(bytes32 taskHash) external view returns (uint256) {
        return taskPayments[taskHash];
    }
    
    function getPaymentCount() external view returns (uint256) {
        return _paymentIds;
    }
    
    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * platformFeePercentage) / 10000;
    }
    
    function getContractBalance() external view returns (uint256) {
        return pyusdToken.balanceOf(address(this));
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = pyusdToken.balanceOf(address(this));
        pyusdToken.safeTransfer(owner(), balance);
    }
    
    function pauseContract() external onlyOwner {
        // Implementation for pausing contract
    }
    
    function unpauseContract() external onlyOwner {
        // Implementation for unpausing contract
    }
}
