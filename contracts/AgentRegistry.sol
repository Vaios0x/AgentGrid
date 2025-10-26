// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AgentRegistry is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _agentIds;
    
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
        string metadata; // IPFS hash for additional data
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
        string result; // IPFS hash for task result
    }
    
    enum TaskStatus {
        Pending,
        InProgress,
        Completed,
        Failed,
        Cancelled
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userAgents;
    mapping(address => uint256[]) public userTasks;
    mapping(address => uint256) public userReputation;
    
    Counters.Counter private _taskIds;
    
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        string category,
        uint256 price
    );
    
    event AgentUpdated(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        uint256 price
    );
    
    event AgentDeactivated(
        uint256 indexed agentId,
        address indexed owner
    );
    
    event TaskCreated(
        uint256 indexed taskId,
        uint256 indexed agentId,
        address indexed client,
        uint256 price
    );
    
    event TaskStatusUpdated(
        uint256 indexed taskId,
        TaskStatus status,
        address indexed updater
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 newReputation
    );
    
    modifier onlyAgentOwner(uint256 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }
    
    modifier agentExists(uint256 agentId) {
        require(agents[agentId].id != 0, "Agent does not exist");
        _;
    }
    
    modifier taskExists(uint256 taskId) {
        require(tasks[taskId].id != 0, "Task does not exist");
        _;
    }
    
    function registerAgent(
        string memory name,
        string memory description,
        string memory category,
        uint256 price,
        string memory metadata
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(price > 0, "Price must be greater than 0");
        
        _agentIds.increment();
        uint256 agentId = _agentIds.current();
        
        agents[agentId] = Agent({
            id: agentId,
            name: name,
            description: description,
            category: category,
            owner: msg.sender,
            price: price,
            reputation: 1000, // Initial reputation
            totalTasks: 0,
            successfulTasks: 0,
            isActive: true,
            createdAt: block.timestamp,
            metadata: metadata
        });
        
        userAgents[msg.sender].push(agentId);
        
        emit AgentRegistered(agentId, msg.sender, name, category, price);
        
        return agentId;
    }
    
    function updateAgent(
        uint256 agentId,
        string memory name,
        string memory description,
        uint256 price,
        string memory metadata
    ) external onlyAgentOwner(agentId) agentExists(agentId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(price > 0, "Price must be greater than 0");
        
        agents[agentId].name = name;
        agents[agentId].description = description;
        agents[agentId].price = price;
        agents[agentId].metadata = metadata;
        
        emit AgentUpdated(agentId, msg.sender, name, price);
    }
    
    function deactivateAgent(uint256 agentId) 
        external 
        onlyAgentOwner(agentId) 
        agentExists(agentId) 
    {
        agents[agentId].isActive = false;
        emit AgentDeactivated(agentId, msg.sender);
    }
    
    function createTask(
        uint256 agentId,
        string memory description
    ) external payable agentExists(agentId) nonReentrant returns (uint256) {
        Agent storage agent = agents[agentId];
        require(agent.isActive, "Agent is not active");
        require(msg.value >= agent.price, "Insufficient payment");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        _taskIds.increment();
        uint256 taskId = _taskIds.current();
        
        tasks[taskId] = Task({
            id: taskId,
            agentId: agentId,
            client: msg.sender,
            description: description,
            price: agent.price,
            status: TaskStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            result: ""
        });
        
        userTasks[msg.sender].push(taskId);
        agent.totalTasks++;
        
        emit TaskCreated(taskId, agentId, msg.sender, agent.price);
        
        return taskId;
    }
    
    function updateTaskStatus(
        uint256 taskId,
        TaskStatus status,
        string memory result
    ) external taskExists(taskId) {
        Task storage task = tasks[taskId];
        Agent storage agent = agents[task.agentId];
        
        require(
            agent.owner == msg.sender || task.client == msg.sender,
            "Not authorized to update task"
        );
        
        task.status = status;
        
        if (status == TaskStatus.Completed) {
            task.completedAt = block.timestamp;
            task.result = result;
            agent.successfulTasks++;
            
            // Update reputation based on success
            _updateReputation(agent.owner, true);
        } else if (status == TaskStatus.Failed) {
            // Refund client
            payable(task.client).transfer(task.price);
            
            // Update reputation based on failure
            _updateReputation(agent.owner, false);
        }
        
        emit TaskStatusUpdated(taskId, status, msg.sender);
    }
    
    function _updateReputation(address user, bool success) internal {
        if (success) {
            userReputation[user] += 10;
        } else {
            if (userReputation[user] > 10) {
                userReputation[user] -= 10;
            }
        }
        
        emit ReputationUpdated(user, userReputation[user]);
    }
    
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
    
    // Emergency functions for owner
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pauseContract() external onlyOwner {
        // Implementation for pausing contract
    }
    
    function unpauseContract() external onlyOwner {
        // Implementation for unpausing contract
    }
}
