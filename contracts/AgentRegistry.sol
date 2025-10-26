// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AgentRegistry is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _agentIds;
    Counters.Counter private _taskIds;
    
    struct Agent {
        uint256 id;
        string name;
        string description;
        string category;
        address owner;
        uint256 price;
        uint256 reputation;
        uint256 totalTasks;
        uint256 successfulTasks;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
        string metadata;
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
        string result;
        bytes32 taskHash;
        bool isDisputed;
        address disputeResolver;
    }
    
    enum TaskStatus {
        Pending,
        InProgress,
        Completed,
        Failed,
        Cancelled,
        Disputed
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userAgents;
    mapping(address => uint256[]) public userTasks;
    mapping(address => uint256) public userReputation;
    mapping(bytes32 => uint256) public taskHashes;
    mapping(address => bool) public blacklistedAddresses;
    mapping(string => bool) public categoryExists;
    mapping(address => uint256) public lastActivity;
    
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
    
    event ReputationUpdated(
        address indexed user,
        uint256 oldReputation,
        uint256 newReputation,
        uint256 timestamp
    );
    
    event CircuitBreakerActivated(
        address indexed activator,
        uint256 timestamp
    );
    
    event BlacklistUpdated(
        address indexed account,
        bool isBlacklisted,
        uint256 timestamp
    );
    
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
    
    modifier validStringLength(string memory str, uint256 maxLength) {
        require(bytes(str).length > 0 && bytes(str).length <= maxLength, "AgentRegistry: Invalid string length");
        _;
    }
    
    modifier notExpired(uint256 deadline) {
        require(block.timestamp <= deadline, "AgentRegistry: Task expired");
        _;
    }
    
    constructor(uint256 _emergencyWithdrawDelay) {
        emergencyWithdrawDelay = _emergencyWithdrawDelay;
        circuitBreakerActive = false;
    }
    
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
        
        agents[agentId] = Agent({
            id: agentId,
            name: name,
            description: description,
            category: category,
            owner: msg.sender,
            price: price,
            reputation: INITIAL_REPUTATION,
            totalTasks: 0,
            successfulTasks: 0,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            metadata: metadata
        });
        
        userAgents[msg.sender].push(agentId);
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
        
        agents[agentId].name = name;
        agents[agentId].description = description;
        agents[agentId].price = price;
        agents[agentId].metadata = metadata;
        agents[agentId].updatedAt = block.timestamp;
        
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
        
        userTasks[msg.sender].push(taskId);
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
            agent.owner == msg.sender || task.client == msg.sender,
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
    
    // View functions
    function getAgent(uint256 agentId) external view agentExists(agentId) returns (Agent memory) {
        return agents[agentId];
    }
    
    function getTask(uint256 taskId) external view taskExists(taskId) returns (Task memory) {
        return tasks[taskId];
    }
    
    function getUserAgents(address user) external view returns (uint256[] memory) {
        return userAgents[user];
    }
    
    function getUserTasks(address user) external view returns (uint256[] memory) {
        return userTasks[user];
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
    
    function isTaskHashValid(bytes32 taskHash) external view returns (bool) {
        return taskHashes[taskHash] != 0;
    }
    
    // Admin functions
    function setEmergencyWithdrawDelay(uint256 newDelay) external onlyOwner {
        emergencyWithdrawDelay = newDelay;
    }
    
    function activateCircuitBreaker() external onlyOwner {
        circuitBreakerActive = true;
        emit CircuitBreakerActivated(msg.sender, block.timestamp);
    }
    
    function deactivateCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
    }
    
    function blacklistAddress(address account, bool isBlacklisted) external onlyOwner {
        blacklistedAddresses[account] = isBlacklisted;
        emit BlacklistUpdated(account, isBlacklisted, block.timestamp);
    }
    
    function emergencyWithdraw() external onlyOwner {
        require(circuitBreakerActive, "AgentRegistry: Circuit breaker not active");
        
        uint256 amount = address(this).balance;
        require(amount > 0, "AgentRegistry: No funds to withdraw");
        
        payable(owner()).transfer(amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    receive() external payable {
        // Allow contract to receive ETH for task payments
    }
}