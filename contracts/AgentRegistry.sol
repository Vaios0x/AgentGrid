// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

/**
 * @title AgentRegistry
 * @dev Enterprise-grade AI Agent Registry with comprehensive security features
 * @author AgentGrid Team
 * @notice This contract manages AI agents, tasks, and reputation in a decentralized marketplace
 * @custom:security-contact security@agentgrid.io
 */
contract AgentRegistry is 
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    using AddressUpgradeable for address;
    using StringsUpgradeable for uint256;
    
    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_MANAGER_ROLE = keccak256("AGENT_MANAGER_ROLE");
    bytes32 public constant TASK_MANAGER_ROLE = keccak256("TASK_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // ============ STATE VARIABLES ============
    CountersUpgradeable.Counter private _agentIds;
    CountersUpgradeable.Counter private _taskIds;
    
    // Platform configuration
    uint256 public constant MAX_REPUTATION = 10000;
    uint256 public constant MIN_REPUTATION = 0;
    uint256 public constant INITIAL_REPUTATION = 1000;
    uint256 public constant REPUTATION_CHANGE = 50;
    uint256 public constant MAX_AGENT_NAME_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 1000;
    uint256 public constant MAX_METADATA_LENGTH = 2000;
    
    // Circuit breaker
    bool public circuitBreakerActive;
    uint256 public emergencyWithdrawDelay;
    mapping(address => uint256) public emergencyWithdrawTimestamps;
    
    // ============ STRUCTS ============
    struct Agent {
        uint256 id;
        string name;
        string description;
        string category;
        address owner;
        uint256 price; // Price in wei (PYUSD)
        uint256 reputation;
        uint256 totalTasks;
        uint256 successfulTasks;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
        string metadata; // IPFS hash for additional data
        EnumerableSetUpgradeable.AddressSet verifiedClients;
    }
    
    struct Task {
        uint256 id;
        uint256 agentId;
        address client;
        string description;
        uint256 price;
        TaskStatus status;
        uint256 createdAt;
        uint256 completedAt;
        uint256 deadline;
        string result; // IPFS hash for task result
        bytes32 taskHash; // Hash for verification
        bool isDisputed;
        address disputeResolver;
    }
    
    struct ReputationData {
        uint256 totalRating;
        uint256 ratingCount;
        uint256 lastUpdated;
        mapping(address => uint256) clientRatings;
    }
    
    // ============ ENUMS ============
    enum TaskStatus {
        Pending,
        InProgress,
        Completed,
        Failed,
        Cancelled,
        Disputed
    }
    
    // ============ MAPPINGS ============
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Task) public tasks;
    mapping(address => EnumerableSetUpgradeable.UintSet) private userAgents;
    mapping(address => EnumerableSetUpgradeable.UintSet) private userTasks;
    mapping(address => uint256) public userReputation;
    mapping(address => ReputationData) public reputationData;
    mapping(bytes32 => uint256) public taskHashes;
    mapping(address => bool) public blacklistedAddresses;
    mapping(string => bool) public categoryExists;
    mapping(address => uint256) public lastActivity;
    
    // ============ EVENTS ============
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        string category,
        uint256 price,
        uint256 timestamp
    );
    
    event AgentUpdated(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        uint256 price,
        uint256 timestamp
    );
    
    event AgentDeactivated(
        uint256 indexed agentId,
        address indexed owner,
        uint256 timestamp
    );
    
    event AgentReactivated(
        uint256 indexed agentId,
        address indexed owner,
        uint256 timestamp
    );
    
    event TaskCreated(
        uint256 indexed taskId,
        uint256 indexed agentId,
        address indexed client,
        uint256 price,
        uint256 deadline,
        bytes32 taskHash,
        uint256 timestamp
    );
    
    event TaskStatusUpdated(
        uint256 indexed taskId,
        TaskStatus oldStatus,
        TaskStatus newStatus,
        address indexed updater,
        uint256 timestamp
    );
    
    event TaskCompleted(
        uint256 indexed taskId,
        uint256 indexed agentId,
        address indexed client,
        string result,
        uint256 timestamp
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 oldReputation,
        uint256 newReputation,
        uint256 timestamp
    );
    
    event AgentRated(
        address indexed agent,
        address indexed client,
        uint256 rating,
        string feedback,
        uint256 timestamp
    );
    
    event EmergencyWithdrawInitiated(
        address indexed user,
        uint256 amount,
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
    modifier onlyAgentOwner(uint256 agentId) {
        require(agents[agentId].owner == msg.sender, "AgentRegistry: Not agent owner");
        _;
    }
    
    modifier agentExists(uint256 agentId) {
        require(agents[agentId].id != 0, "AgentRegistry: Agent does not exist");
        _;
    }
    
    modifier taskExists(uint256 taskId) {
        require(tasks[taskId].id != 0, "AgentRegistry: Task does not exist");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklistedAddresses[account], "AgentRegistry: Address is blacklisted");
        _;
    }
    
    modifier validReputation(uint256 reputation) {
        require(reputation >= MIN_REPUTATION && reputation <= MAX_REPUTATION, "AgentRegistry: Invalid reputation");
        _;
    }
    
    modifier validStringLength(string memory str, uint256 maxLength) {
        require(bytes(str).length > 0 && bytes(str).length <= maxLength, "AgentRegistry: Invalid string length");
        _;
    }
    
    modifier notExpired(uint256 deadline) {
        require(block.timestamp <= deadline, "AgentRegistry: Task expired");
        _;
    }
    
    // ============ INITIALIZATION ============
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address admin,
        uint256 _emergencyWithdrawDelay
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(AGENT_MANAGER_ROLE, admin);
        _grantRole(TASK_MANAGER_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        
        emergencyWithdrawDelay = _emergencyWithdrawDelay;
        circuitBreakerActive = false;
    }
    
    // ============ AGENT FUNCTIONS ============
    function registerAgent(
        string memory name,
        string memory description,
        string memory category,
        uint256 price,
        string memory metadata
    ) 
        external 
        whenNotPaused 
        notBlacklisted(msg.sender)
        validStringLength(name, MAX_AGENT_NAME_LENGTH)
        validStringLength(description, MAX_DESCRIPTION_LENGTH)
        validStringLength(metadata, MAX_METADATA_LENGTH)
        returns (uint256) 
    {
        require(price > 0, "AgentRegistry: Price must be greater than 0");
        require(bytes(category).length > 0, "AgentRegistry: Category cannot be empty");
        
        _agentIds.increment();
        uint256 agentId = _agentIds.current();
        
        Agent storage newAgent = agents[agentId];
        newAgent.id = agentId;
        newAgent.name = name;
        newAgent.description = description;
        newAgent.category = category;
        newAgent.owner = msg.sender;
        newAgent.price = price;
        newAgent.reputation = INITIAL_REPUTATION;
        newAgent.totalTasks = 0;
        newAgent.successfulTasks = 0;
        newAgent.isActive = true;
        newAgent.createdAt = block.timestamp;
        newAgent.updatedAt = block.timestamp;
        newAgent.metadata = metadata;
        
        userAgents[msg.sender].add(agentId);
        categoryExists[category] = true;
        lastActivity[msg.sender] = block.timestamp;
        
        emit AgentRegistered(agentId, msg.sender, name, category, price, block.timestamp);
        
        return agentId;
    }
    
    function updateAgent(
        uint256 agentId,
        string memory name,
        string memory description,
        uint256 price,
        string memory metadata
    ) 
        external 
        onlyAgentOwner(agentId) 
        agentExists(agentId) 
        whenNotPaused 
        validStringLength(name, MAX_AGENT_NAME_LENGTH)
        validStringLength(description, MAX_DESCRIPTION_LENGTH)
        validStringLength(metadata, MAX_METADATA_LENGTH)
    {
        require(price > 0, "AgentRegistry: Price must be greater than 0");
        
        Agent storage agent = agents[agentId];
        agent.name = name;
        agent.description = description;
        agent.price = price;
        agent.metadata = metadata;
        agent.updatedAt = block.timestamp;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit AgentUpdated(agentId, msg.sender, name, price, block.timestamp);
    }
    
    function deactivateAgent(uint256 agentId) 
        external 
        onlyAgentOwner(agentId) 
        agentExists(agentId) 
        whenNotPaused 
    {
        agents[agentId].isActive = false;
        agents[agentId].updatedAt = block.timestamp;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit AgentDeactivated(agentId, msg.sender, block.timestamp);
    }
    
    function reactivateAgent(uint256 agentId) 
        external 
        onlyAgentOwner(agentId) 
        agentExists(agentId) 
        whenNotPaused 
    {
        agents[agentId].isActive = true;
        agents[agentId].updatedAt = block.timestamp;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit AgentReactivated(agentId, msg.sender, block.timestamp);
    }
    
    // ============ TASK FUNCTIONS ============
    function createTask(
        uint256 agentId,
        string memory description,
        uint256 deadline
    ) 
        external 
        payable 
        agentExists(agentId) 
        whenNotPaused 
        nonReentrant 
        notBlacklisted(msg.sender)
        validStringLength(description, MAX_DESCRIPTION_LENGTH)
        notExpired(deadline)
        returns (uint256) 
    {
        Agent storage agent = agents[agentId];
        require(agent.isActive, "AgentRegistry: Agent is not active");
        require(msg.value >= agent.price, "AgentRegistry: Insufficient payment");
        require(deadline > block.timestamp, "AgentRegistry: Invalid deadline");
        
        _taskIds.increment();
        uint256 taskId = _taskIds.current();
        
        bytes32 taskHash = keccak256(abi.encodePacked(
            agentId,
            msg.sender,
            description,
            msg.value,
            block.timestamp,
            block.number
        ));
        
        tasks[taskId] = Task({
            id: taskId,
            agentId: agentId,
            client: msg.sender,
            description: description,
            price: agent.price,
            status: TaskStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            deadline: deadline,
            result: "",
            taskHash: taskHash,
            isDisputed: false,
            disputeResolver: address(0)
        });
        
        userTasks[msg.sender].add(taskId);
        taskHashes[taskHash] = taskId;
        agent.totalTasks++;
        lastActivity[msg.sender] = block.timestamp;
        
        emit TaskCreated(taskId, agentId, msg.sender, agent.price, deadline, taskHash, block.timestamp);
        
        return taskId;
    }
    
    function updateTaskStatus(
        uint256 taskId,
        TaskStatus status,
        string memory result
    ) 
        external 
        taskExists(taskId) 
        whenNotPaused 
        nonReentrant 
    {
        Task storage task = tasks[taskId];
        Agent storage agent = agents[task.agentId];
        
        require(
            agent.owner == msg.sender || task.client == msg.sender || hasRole(TASK_MANAGER_ROLE, msg.sender),
            "AgentRegistry: Not authorized to update task"
        );
        
        TaskStatus oldStatus = task.status;
        task.status = status;
        
        if (status == TaskStatus.Completed) {
            require(bytes(result).length > 0, "AgentRegistry: Result cannot be empty");
            task.completedAt = block.timestamp;
            task.result = result;
            agent.successfulTasks++;
            
            // Update reputation based on success
            _updateReputation(agent.owner, true);
            
            emit TaskCompleted(taskId, task.agentId, task.client, result, block.timestamp);
        } else if (status == TaskStatus.Failed) {
            // Refund client
            if (address(this).balance >= task.price) {
                payable(task.client).transfer(task.price);
            }
            
            // Update reputation based on failure
            _updateReputation(agent.owner, false);
        }
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit TaskStatusUpdated(taskId, oldStatus, status, msg.sender, block.timestamp);
    }
    
    function rateAgent(
        uint256 taskId,
        uint256 rating,
        string memory feedback
    ) 
        external 
        taskExists(taskId) 
        whenNotPaused 
    {
        Task storage task = tasks[taskId];
        require(task.client == msg.sender, "AgentRegistry: Not task client");
        require(task.status == TaskStatus.Completed, "AgentRegistry: Task not completed");
        require(rating >= 1 && rating <= 5, "AgentRegistry: Invalid rating");
        
        Agent storage agent = agents[task.agentId];
        ReputationData storage repData = reputationData[agent.owner];
        
        // Check if already rated
        require(repData.clientRatings[msg.sender] == 0, "AgentRegistry: Already rated");
        
        repData.clientRatings[msg.sender] = rating;
        repData.totalRating += rating;
        repData.ratingCount++;
        repData.lastUpdated = block.timestamp;
        
        // Update agent's verified clients
        agent.verifiedClients.add(msg.sender);
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit AgentRated(agent.owner, msg.sender, rating, feedback, block.timestamp);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    function _updateReputation(address user, bool success) internal {
        uint256 oldReputation = userReputation[user];
        uint256 newReputation;
        
        if (success) {
            newReputation = oldReputation + REPUTATION_CHANGE;
            if (newReputation > MAX_REPUTATION) {
                newReputation = MAX_REPUTATION;
            }
        } else {
            if (oldReputation > REPUTATION_CHANGE) {
                newReputation = oldReputation - REPUTATION_CHANGE;
            } else {
                newReputation = MIN_REPUTATION;
            }
        }
        
        userReputation[user] = newReputation;
        
        emit ReputationUpdated(user, oldReputation, newReputation, block.timestamp);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
    
    // ============ VIEW FUNCTIONS ============
    function getAgent(uint256 agentId) external view agentExists(agentId) returns (Agent memory) {
        return agents[agentId];
    }
    
    function getTask(uint256 taskId) external view taskExists(taskId) returns (Task memory) {
        return tasks[taskId];
    }
    
    function getUserAgents(address user) external view returns (uint256[] memory) {
        return userAgents[user].values();
    }
    
    function getUserTasks(address user) external view returns (uint256[] memory) {
        return userTasks[user].values();
    }
    
    function getAgentCount() external view returns (uint256) {
        return _agentIds.current();
    }
    
    function getTaskCount() external view returns (uint256) {
        return _taskIds.current();
    }
    
    function getUserReputation(address user) external view returns (uint256) {
        return userReputation[user];
    }
    
    function getAgentReputationData(address agent) external view returns (
        uint256 totalRating,
        uint256 ratingCount,
        uint256 lastUpdated
    ) {
        ReputationData storage repData = reputationData[agent];
        return (repData.totalRating, repData.ratingCount, repData.lastUpdated);
    }
    
    function getVerifiedClients(uint256 agentId) external view agentExists(agentId) returns (address[] memory) {
        return agents[agentId].verifiedClients.values();
    }
    
    function isTaskHashValid(bytes32 taskHash) external view returns (bool) {
        return taskHashes[taskHash] != 0;
    }
    
    // ============ ADMIN FUNCTIONS ============
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
    
    function emergencyWithdraw() external onlyRole(EMERGENCY_ROLE) {
        require(circuitBreakerActive, "AgentRegistry: Circuit breaker not active");
        
        uint256 amount = address(this).balance;
        require(amount > 0, "AgentRegistry: No funds to withdraw");
        
        payable(msg.sender).transfer(amount);
        
        emit EmergencyWithdrawInitiated(msg.sender, amount, block.timestamp);
    }
    
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
    
    // ============ RECEIVE FUNCTION ============
    receive() external payable {
        // Allow contract to receive ETH for task payments
    }
}