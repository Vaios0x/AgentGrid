// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

/**
 * @title PaymentManager
 * @dev Enterprise-grade Payment Management System with multi-token support
 * @author AgentGrid Team
 * @notice This contract handles all payments, fees, and financial operations
 * @custom:security-contact security@agentgrid.io
 */
contract PaymentManager is 
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    using StringsUpgradeable for uint256;
    
    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAYMENT_MANAGER_ROLE = keccak256("PAYMENT_MANAGER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // ============ STATE VARIABLES ============
    CountersUpgradeable.Counter private _paymentIds;
    
    // Platform configuration
    uint256 public constant MAX_FEE_PERCENTAGE = 1000; // 10% max
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_PAYMENT_AMOUNT = 1e15; // 0.001 tokens
    uint256 public constant MAX_PAYMENT_AMOUNT = 1e30; // 1 billion tokens
    uint256 public constant PAYMENT_TIMEOUT = 7 days;
    uint256 public constant REFUND_TIMEOUT = 30 days;
    
    // Fee structure
    uint256 public platformFeePercentage;
    uint256 public treasuryFeePercentage;
    uint256 public stakingRewardPercentage;
    
    // Addresses
    address public feeRecipient;
    address public treasuryAddress;
    address public stakingRewardAddress;
    
    // Circuit breaker
    bool public circuitBreakerActive;
    uint256 public emergencyWithdrawDelay;
    mapping(address => uint256) public emergencyWithdrawTimestamps;
    
    // ============ STRUCTS ============
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
    
    struct TokenInfo {
        bool isSupported;
        bool isPaused;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 customFeePercentage;
    }
    
    struct FeeBreakdown {
        uint256 platformFee;
        uint256 treasuryFee;
        uint256 stakingReward;
        uint256 recipientAmount;
    }
    
    // ============ ENUMS ============
    enum PaymentStatus {
        Pending,
        Completed,
        Failed,
        Refunded,
        Disputed,
        Expired
    }
    
    // ============ MAPPINGS ============
    mapping(uint256 => Payment) public payments;
    mapping(address => EnumerableSetUpgradeable.UintSet) private userPayments;
    mapping(bytes32 => uint256) public taskPayments;
    mapping(bytes32 => uint256) public paymentHashes;
    mapping(address => TokenInfo) public supportedTokens;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => uint256) public totalVolume;
    mapping(address => uint256) public totalFees;
    mapping(address => uint256) public lastActivity;
    
    // ============ EVENTS ============
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
        FeeBreakdown fees,
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
    
    event PaymentDisputed(
        uint256 indexed paymentId,
        address indexed disputer,
        address indexed resolver,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );
    
    event FeeRecipientUpdated(
        address oldRecipient,
        address newRecipient,
        uint256 timestamp
    );
    
    event TokenSupportUpdated(
        address indexed token,
        bool isSupported,
        bool isPaused,
        uint256 customFee,
        uint256 timestamp
    );
    
    event EmergencyWithdrawInitiated(
        address indexed token,
        uint256 amount,
        address indexed recipient,
        uint256 timestamp
    );
    
    event CircuitBreakerActivated(
        address indexed activator,
        uint256 timestamp
    );
    
    event CircuitBreakerDeactivated(
        address indexed deactivator,
        uint256 timestamp
    );
    
    event BlacklistUpdated(
        address indexed account,
        bool isBlacklisted,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
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
        require(supportedTokens[token].isSupported, "PaymentManager: Token not supported");
        require(!supportedTokens[token].isPaused, "PaymentManager: Token paused");
        _;
    }
    
    modifier notExpired(uint256 deadline) {
        require(block.timestamp <= deadline, "PaymentManager: Payment expired");
        _;
    }
    
    // ============ INITIALIZATION ============
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address admin,
        address _feeRecipient,
        address _treasuryAddress,
        address _stakingRewardAddress,
        uint256 _emergencyWithdrawDelay
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(PAYMENT_MANAGER_ROLE, admin);
        _grantRole(FEE_MANAGER_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        
        feeRecipient = _feeRecipient;
        treasuryAddress = _treasuryAddress;
        stakingRewardAddress = _stakingRewardAddress;
        emergencyWithdrawDelay = _emergencyWithdrawDelay;
        
        // Default fee structure
        platformFeePercentage = 500; // 5%
        treasuryFeePercentage = 200; // 2%
        stakingRewardPercentage = 100; // 1%
        
        circuitBreakerActive = false;
    }
    
    // ============ PAYMENT FUNCTIONS ============
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
        
        IERC20Upgradeable tokenContract = IERC20Upgradeable(token);
        
        require(
            tokenContract.balanceOf(msg.sender) >= amount,
            "PaymentManager: Insufficient balance"
        );
        require(
            tokenContract.allowance(msg.sender, address(this)) >= amount,
            "PaymentManager: Insufficient allowance"
        );
        
        _paymentIds.increment();
        uint256 paymentId = _paymentIds.current();
        
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
        
        userPayments[msg.sender].add(paymentId);
        userPayments[to].add(paymentId);
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
            msg.sender == payment.from || hasRole(PAYMENT_MANAGER_ROLE, msg.sender),
            "PaymentManager: Not authorized"
        );
        require(block.timestamp <= payment.deadline, "PaymentManager: Payment expired");
        
        IERC20Upgradeable tokenContract = IERC20Upgradeable(payment.token);
        
        // Calculate fees
        FeeBreakdown memory fees = _calculateFees(payment.amount, payment.token);
        
        // Update payment
        payment.status = PaymentStatus.Completed;
        payment.completedAt = block.timestamp;
        payment.fee = fees.platformFee + fees.treasuryFee + fees.stakingReward;
        
        // Transfer tokens to recipient
        tokenContract.safeTransfer(payment.to, fees.recipientAmount);
        
        // Transfer fees
        if (fees.platformFee > 0) {
            tokenContract.safeTransfer(feeRecipient, fees.platformFee);
        }
        if (fees.treasuryFee > 0) {
            tokenContract.safeTransfer(treasuryAddress, fees.treasuryFee);
        }
        if (fees.stakingReward > 0) {
            tokenContract.safeTransfer(stakingRewardAddress, fees.stakingReward);
        }
        
        totalFees[payment.token] += payment.fee;
        lastActivity[msg.sender] = block.timestamp;
        
        emit PaymentCompleted(paymentId, payment.to, payment.token, payment.amount, fees, block.timestamp);
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
            msg.sender == payment.to || 
            hasRole(PAYMENT_MANAGER_ROLE, msg.sender),
            "PaymentManager: Not authorized"
        );
        
        IERC20Upgradeable tokenContract = IERC20Upgradeable(payment.token);
        
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
            msg.sender == payment.to || 
            hasRole(ADMIN_ROLE, msg.sender),
            "PaymentManager: Not authorized to refund"
        );
        require(
            block.timestamp <= payment.completedAt + REFUND_TIMEOUT,
            "PaymentManager: Refund timeout exceeded"
        );
        
        IERC20Upgradeable tokenContract = IERC20Upgradeable(payment.token);
        
        // Refund full amount to sender
        tokenContract.safeTransfer(payment.from, payment.amount);
        
        payment.status = PaymentStatus.Refunded;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit PaymentRefunded(paymentId, payment.from, payment.token, payment.amount, block.timestamp);
    }
    
    function batchCompletePayments(uint256[] calldata paymentIds) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(paymentIds.length > 0 && paymentIds.length <= 50, "PaymentManager: Invalid batch size");
        
        for (uint256 i = 0; i < paymentIds.length; i++) {
            uint256 paymentId = paymentIds[i];
            Payment storage payment = payments[paymentId];
            
            require(payment.status == PaymentStatus.Pending, "PaymentManager: Payment not pending");
            require(
                msg.sender == payment.from || hasRole(PAYMENT_MANAGER_ROLE, msg.sender),
                "PaymentManager: Not authorized"
            );
            require(block.timestamp <= payment.deadline, "PaymentManager: Payment expired");
            
            IERC20Upgradeable tokenContract = IERC20Upgradeable(payment.token);
            
            // Calculate fees
            FeeBreakdown memory fees = _calculateFees(payment.amount, payment.token);
            
            // Update payment
            payment.status = PaymentStatus.Completed;
            payment.completedAt = block.timestamp;
            payment.fee = fees.platformFee + fees.treasuryFee + fees.stakingReward;
            
            // Transfer tokens to recipient
            tokenContract.safeTransfer(payment.to, fees.recipientAmount);
            
            // Transfer fees
            if (fees.platformFee > 0) {
                tokenContract.safeTransfer(feeRecipient, fees.platformFee);
            }
            if (fees.treasuryFee > 0) {
                tokenContract.safeTransfer(treasuryAddress, fees.treasuryFee);
            }
            if (fees.stakingReward > 0) {
                tokenContract.safeTransfer(stakingRewardAddress, fees.stakingReward);
            }
            
            totalFees[payment.token] += payment.fee;
            
            emit PaymentCompleted(paymentId, payment.to, payment.token, payment.amount, fees, block.timestamp);
        }
        
        lastActivity[msg.sender] = block.timestamp;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    function _calculateFees(uint256 amount, address token) internal view returns (FeeBreakdown memory) {
        TokenInfo memory tokenInfo = supportedTokens[token];
        uint256 effectivePlatformFee = tokenInfo.customFeePercentage > 0 ? 
            tokenInfo.customFeePercentage : platformFeePercentage;
        
        uint256 platformFee = (amount * effectivePlatformFee) / BASIS_POINTS;
        uint256 treasuryFee = (amount * treasuryFeePercentage) / BASIS_POINTS;
        uint256 stakingReward = (amount * stakingRewardPercentage) / BASIS_POINTS;
        uint256 totalFees = platformFee + treasuryFee + stakingReward;
        uint256 recipientAmount = amount - totalFees;
        
        return FeeBreakdown({
            platformFee: platformFee,
            treasuryFee: treasuryFee,
            stakingReward: stakingReward,
            recipientAmount: recipientAmount
        });
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
    
    // ============ VIEW FUNCTIONS ============
    function getPayment(uint256 paymentId) external view validPayment(paymentId) returns (Payment memory) {
        return payments[paymentId];
    }
    
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user].values();
    }
    
    function getTaskPayment(bytes32 taskHash) external view returns (uint256) {
        return taskPayments[taskHash];
    }
    
    function getPaymentCount() external view returns (uint256) {
        return _paymentIds.current();
    }
    
    function calculateFees(uint256 amount, address token) external view returns (FeeBreakdown memory) {
        return _calculateFees(amount, token);
    }
    
    function getContractBalance(address token) external view returns (uint256) {
        return IERC20Upgradeable(token).balanceOf(address(this));
    }
    
    function getTokenInfo(address token) external view returns (TokenInfo memory) {
        return supportedTokens[token];
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
    
    // ============ ADMIN FUNCTIONS ============
    function setPlatformFee(uint256 newFeePercentage) external onlyRole(FEE_MANAGER_ROLE) {
        require(newFeePercentage <= MAX_FEE_PERCENTAGE, "PaymentManager: Fee too high");
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage, block.timestamp);
    }
    
    function setFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        require(newRecipient != address(0), "PaymentManager: Invalid recipient");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient, block.timestamp);
    }
    
    function setTreasuryAddress(address newTreasury) external onlyRole(ADMIN_ROLE) {
        require(newTreasury != address(0), "PaymentManager: Invalid treasury address");
        treasuryAddress = newTreasury;
    }
    
    function setStakingRewardAddress(address newStakingReward) external onlyRole(ADMIN_ROLE) {
        require(newStakingReward != address(0), "PaymentManager: Invalid staking reward address");
        stakingRewardAddress = newStakingReward;
    }
    
    function setTokenSupport(
        address token,
        bool isSupported,
        bool isPaused,
        uint256 customFeePercentage
    ) external onlyRole(ADMIN_ROLE) {
        require(token != address(0), "PaymentManager: Invalid token address");
        require(customFeePercentage <= MAX_FEE_PERCENTAGE, "PaymentManager: Custom fee too high");
        
        supportedTokens[token] = TokenInfo({
            isSupported: isSupported,
            isPaused: isPaused,
            minAmount: MIN_PAYMENT_AMOUNT,
            maxAmount: MAX_PAYMENT_AMOUNT,
            customFeePercentage: customFeePercentage
        });
        
        emit TokenSupportUpdated(token, isSupported, isPaused, customFeePercentage, block.timestamp);
    }
    
    function setEmergencyWithdrawDelay(uint256 newDelay) external onlyRole(ADMIN_ROLE) {
        emergencyWithdrawDelay = newDelay;
    }
    
    function activateCircuitBreaker() external onlyRole(EMERGENCY_ROLE) {
        circuitBreakerActive = true;
        emit CircuitBreakerActivated(msg.sender, block.timestamp);
    }
    
    function deactivateCircuitBreaker() external onlyRole(EMERGENCY_ROLE) {
        circuitBreakerActive = false;
        emit CircuitBreakerDeactivated(msg.sender, block.timestamp);
    }
    
    function blacklistAddress(address account, bool isBlacklisted) external onlyRole(ADMIN_ROLE) {
        blacklistedAddresses[account] = isBlacklisted;
        emit BlacklistUpdated(account, isBlacklisted, block.timestamp);
    }
    
    function emergencyWithdraw(address token) external onlyRole(EMERGENCY_ROLE) {
        require(circuitBreakerActive, "PaymentManager: Circuit breaker not active");
        
        IERC20Upgradeable tokenContract = IERC20Upgradeable(token);
        uint256 amount = tokenContract.balanceOf(address(this));
        require(amount > 0, "PaymentManager: No tokens to withdraw");
        
        tokenContract.safeTransfer(msg.sender, amount);
        
        emit EmergencyWithdrawInitiated(token, amount, msg.sender, block.timestamp);
    }
    
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
}