// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PaymentManager is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    IERC20 public pyusdToken;
    
    struct Payment {
        uint256 id;
        address from;
        address to;
        address token;
        uint256 amount;
        uint256 fee;
        string description;
        PaymentStatus status;
        uint256 createdAt;
        uint256 completedAt;
        uint256 deadline;
        bytes32 taskHash;
        bytes32 paymentHash;
        bool isRefundable;
        address disputeResolver;
    }
    
    enum PaymentStatus {
        Pending,
        Completed,
        Failed,
        Refunded,
        Disputed,
        Expired
    }
    
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public userPayments;
    mapping(bytes32 => uint256) public taskPayments;
    mapping(bytes32 => uint256) public paymentHashes;
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => uint256) public totalVolume;
    mapping(address => uint256) public totalFees;
    mapping(address => uint256) public lastActivity;
    
    uint256 private _paymentIds;
    uint256 public platformFeePercentage = 500; // 5% (500 basis points)
    address public feeRecipient;
    address public treasuryAddress;
    address public stakingRewardAddress;
    
    // Circuit breaker
    bool public circuitBreakerActive;
    uint256 public emergencyWithdrawDelay;
    
    // Constants
    uint256 public constant MAX_FEE_PERCENTAGE = 1000; // 10% max
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_PAYMENT_AMOUNT = 1e15; // 0.001 tokens
    uint256 public constant MAX_PAYMENT_AMOUNT = 1e30; // 1 billion tokens
    uint256 public constant PAYMENT_TIMEOUT = 7 days;
    uint256 public constant REFUND_TIMEOUT = 30 days;
    
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed from,
        address indexed to,
        address token,
        uint256 amount,
        bytes32 taskHash,
        uint256 deadline,
        uint256 timestamp
    );
    
    event PaymentCompleted(
        uint256 indexed paymentId,
        address indexed to,
        address token,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    
    event PaymentFailed(
        uint256 indexed paymentId,
        string reason,
        uint256 timestamp
    );
    
    event PaymentRefunded(
        uint256 indexed paymentId,
        address indexed to,
        address token,
        uint256 amount,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );
    
    event TokenSupportUpdated(
        address indexed token,
        bool isSupported,
        uint256 timestamp
    );
    
    event BlacklistUpdated(
        address indexed account,
        bool isBlacklisted,
        uint256 timestamp
    );
    
    modifier validPayment(uint256 paymentId) {
        require(payments[paymentId].id != 0, "PaymentManager: Payment does not exist");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklistedAddresses[account], "PaymentManager: Address is blacklisted");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount >= MIN_PAYMENT_AMOUNT && amount <= MAX_PAYMENT_AMOUNT, "PaymentManager: Invalid amount");
        _;
    }
    
    modifier tokenSupported(address token) {
        require(supportedTokens[token], "PaymentManager: Token not supported");
        _;
    }
    
    modifier notExpired(uint256 deadline) {
        require(block.timestamp <= deadline, "PaymentManager: Payment expired");
        _;
    }
    
    constructor(
        address _pyusdToken,
        address _feeRecipient,
        address _treasuryAddress,
        address _stakingRewardAddress,
        uint256 _emergencyWithdrawDelay
    ) {
        pyusdToken = IERC20(_pyusdToken);
        feeRecipient = _feeRecipient;
        treasuryAddress = _treasuryAddress;
        stakingRewardAddress = _stakingRewardAddress;
        emergencyWithdrawDelay = _emergencyWithdrawDelay;
        circuitBreakerActive = false;
        
        // Support PYUSD by default
        supportedTokens[_pyusdToken] = true;
    }
    
    function createPayment(
        address to,
        address token,
        uint256 amount,
        string memory description,
        bytes32 taskHash,
        uint256 deadline
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        notBlacklisted(msg.sender)
        notBlacklisted(to)
        tokenSupported(token)
        validAmount(amount)
        notExpired(deadline)
        returns (uint256) 
    {
        require(to != address(0), "PaymentManager: Invalid recipient");
        require(bytes(description).length > 0, "PaymentManager: Description required");
        require(deadline > block.timestamp, "PaymentManager: Invalid deadline");
        
        IERC20 tokenContract = IERC20(token);
        
        require(
            tokenContract.balanceOf(msg.sender) >= amount,
            "PaymentManager: Insufficient balance"
        );
        require(
            tokenContract.allowance(msg.sender, address(this)) >= amount,
            "PaymentManager: Insufficient allowance"
        );
        
        _paymentIds++;
        uint256 paymentId = _paymentIds;
        
        bytes32 paymentHash = keccak256(abi.encodePacked(
            paymentId,
            msg.sender,
            to,
            token,
            amount,
            taskHash,
            block.timestamp,
            block.number
        ));
        
        payments[paymentId] = Payment({
            id: paymentId,
            from: msg.sender,
            to: to,
            token: token,
            amount: amount,
            fee: 0, // Will be calculated on completion
            description: description,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            deadline: deadline,
            taskHash: taskHash,
            paymentHash: paymentHash,
            isRefundable: true,
            disputeResolver: address(0)
        });
        
        userPayments[msg.sender].push(paymentId);
        userPayments[to].push(paymentId);
        taskPayments[taskHash] = paymentId;
        paymentHashes[paymentHash] = paymentId;
        
        // Transfer tokens from sender to contract
        tokenContract.safeTransferFrom(msg.sender, address(this), amount);
        
        lastActivity[msg.sender] = block.timestamp;
        totalVolume[token] += amount;
        
        emit PaymentCreated(paymentId, msg.sender, to, token, amount, taskHash, deadline, block.timestamp);
        
        return paymentId;
    }
    
    function completePayment(uint256 paymentId) 
        external 
        validPayment(paymentId) 
        nonReentrant 
        whenNotPaused 
    {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Pending, "PaymentManager: Payment not pending");
        require(
            msg.sender == payment.from,
            "PaymentManager: Not authorized"
        );
        require(block.timestamp <= payment.deadline, "PaymentManager: Payment expired");
        
        IERC20 tokenContract = IERC20(payment.token);
        
        // Calculate fees
        uint256 platformFee = (payment.amount * platformFeePercentage) / BASIS_POINTS;
        uint256 treasuryFee = (payment.amount * 200) / BASIS_POINTS; // 2%
        uint256 stakingReward = (payment.amount * 100) / BASIS_POINTS; // 1%
        uint256 totalFeesAmount = platformFee + treasuryFee + stakingReward;
        uint256 recipientAmount = payment.amount - totalFeesAmount;
        
        // Update payment
        payment.status = PaymentStatus.Completed;
        payment.completedAt = block.timestamp;
        payment.fee = totalFeesAmount;
        
        // Transfer tokens to recipient
        tokenContract.safeTransfer(payment.to, recipientAmount);
        
        // Transfer fees
        if (platformFee > 0) {
            tokenContract.safeTransfer(feeRecipient, platformFee);
        }
        if (treasuryFee > 0) {
            tokenContract.safeTransfer(treasuryAddress, treasuryFee);
        }
        if (stakingReward > 0) {
            tokenContract.safeTransfer(stakingRewardAddress, stakingReward);
        }
        
        totalFees[payment.token] += totalFeesAmount;
        lastActivity[msg.sender] = block.timestamp;
        
        emit PaymentCompleted(paymentId, payment.to, payment.token, recipientAmount, totalFeesAmount, block.timestamp);
    }
    
    function failPayment(uint256 paymentId, string memory reason) 
        external 
        validPayment(paymentId) 
        nonReentrant 
        whenNotPaused 
    {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Pending, "PaymentManager: Payment not pending");
        require(
            msg.sender == payment.from || 
            msg.sender == payment.to,
            "PaymentManager: Not authorized"
        );
        
        IERC20 tokenContract = IERC20(payment.token);
        
        // Refund tokens to sender
        tokenContract.safeTransfer(payment.from, payment.amount);
        
        payment.status = PaymentStatus.Failed;
        payment.completedAt = block.timestamp;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit PaymentFailed(paymentId, reason, block.timestamp);
    }
    
    function refundPayment(uint256 paymentId) 
        external 
        validPayment(paymentId) 
        nonReentrant 
        whenNotPaused 
    {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Completed, "PaymentManager: Payment not completed");
        require(payment.isRefundable, "PaymentManager: Payment not refundable");
        require(
            msg.sender == payment.from || 
            msg.sender == owner(),
            "PaymentManager: Not authorized to refund"
        );
        require(
            block.timestamp <= payment.completedAt + REFUND_TIMEOUT,
            "PaymentManager: Refund timeout exceeded"
        );
        
        IERC20 tokenContract = IERC20(payment.token);
        
        // Refund full amount to sender
        tokenContract.safeTransfer(payment.from, payment.amount);
        
        payment.status = PaymentStatus.Refunded;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit PaymentRefunded(paymentId, payment.from, payment.token, payment.amount, block.timestamp);
    }
    
    // View functions
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
    
    function getContractBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    function getTotalVolume(address token) external view returns (uint256) {
        return totalVolume[token];
    }
    
    function getTotalFees(address token) external view returns (uint256) {
        return totalFees[token];
    }
    
    function isPaymentHashValid(bytes32 paymentHash) external view returns (bool) {
        return paymentHashes[paymentHash] != 0;
    }
    
    // Admin functions
    function setPlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= MAX_FEE_PERCENTAGE, "PaymentManager: Fee too high");
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage, block.timestamp);
    }
    
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "PaymentManager: Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    function setTreasuryAddress(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "PaymentManager: Invalid treasury address");
        treasuryAddress = newTreasury;
    }
    
    function setStakingRewardAddress(address newStakingReward) external onlyOwner {
        require(newStakingReward != address(0), "PaymentManager: Invalid staking reward address");
        stakingRewardAddress = newStakingReward;
    }
    
    function setTokenSupport(address token, bool isSupported) external onlyOwner {
        require(token != address(0), "PaymentManager: Invalid token address");
        supportedTokens[token] = isSupported;
        emit TokenSupportUpdated(token, isSupported, block.timestamp);
    }
    
    function setEmergencyWithdrawDelay(uint256 newDelay) external onlyOwner {
        emergencyWithdrawDelay = newDelay;
    }
    
    function activateCircuitBreaker() external onlyOwner {
        circuitBreakerActive = true;
    }
    
    function deactivateCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
    }
    
    function blacklistAddress(address account, bool isBlacklisted) external onlyOwner {
        blacklistedAddresses[account] = isBlacklisted;
        emit BlacklistUpdated(account, isBlacklisted, block.timestamp);
    }
    
    function emergencyWithdraw(address token) external onlyOwner {
        require(circuitBreakerActive, "PaymentManager: Circuit breaker not active");
        
        IERC20 tokenContract = IERC20(token);
        uint256 amount = tokenContract.balanceOf(address(this));
        require(amount > 0, "PaymentManager: No tokens to withdraw");
        
        tokenContract.safeTransfer(owner(), amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}