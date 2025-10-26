from uagents import Agent, Context, Model, Protocol
from typing import List, Dict, Optional, Any
import asyncio
import json
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(str, Enum):
    TRADE = "trade"
    STAKE = "stake"
    UNSTAKE = "unstake"
    SWAP = "swap"
    BRIDGE = "bridge"
    CUSTOM = "custom"

class ExecutionTask(Model):
    task_id: str
    task_type: TaskType
    user_address: str
    parameters: Dict[str, Any]
    priority: int = 1
    deadline: Optional[str] = None

class TaskResult(Model):
    task_id: str
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    gas_used: Optional[int] = None
    transaction_hash: Optional[str] = None
    timestamp: str

class TaskUpdate(Model):
    task_id: str
    status: TaskStatus
    progress: float  # 0.0 to 1.0
    message: str
    timestamp: str

# Initialize the executor agent
executor_agent = Agent(
    name="executor",
    seed="executor_seed_phrase_12345",
    port=8003,
    endpoint=["http://127.0.0.1:8003/submit"]
)

executor_protocol = Protocol("Task Execution")

# Task queue and tracking
TASK_QUEUE = []
ACTIVE_TASKS = {}
TASK_HISTORY = {}

async def execute_trade_task(task: ExecutionTask) -> TaskResult:
    """Execute a trading task"""
    try:
        # Simulate trade execution
        await asyncio.sleep(2)  # Simulate network delay
        
        # Mock trade result
        result = {
            'symbol': task.parameters.get('symbol', 'BTC'),
            'amount': task.parameters.get('amount', 0.1),
            'price': task.parameters.get('price', 45000),
            'side': task.parameters.get('side', 'buy'),
            'fees': 0.001,  # 0.1% fee
        }
        
        return TaskResult(
            task_id=task.task_id,
            status=TaskStatus.COMPLETED,
            result=result,
            gas_used=21000,
            transaction_hash=f"0x{''.join([f'{i:02x}' for i in range(32)])}",
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        return TaskResult(
            task_id=task.task_id,
            status=TaskStatus.FAILED,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )

async def execute_stake_task(task: ExecutionTask) -> TaskResult:
    """Execute a staking task"""
    try:
        # Simulate staking execution
        await asyncio.sleep(3)  # Simulate network delay
        
        result = {
            'validator': task.parameters.get('validator', 'default'),
            'amount': task.parameters.get('amount', 1.0),
            'reward_rate': 0.05,  # 5% APY
            'unlock_period': 30,  # 30 days
        }
        
        return TaskResult(
            task_id=task.task_id,
            status=TaskStatus.COMPLETED,
            result=result,
            gas_used=50000,
            transaction_hash=f"0x{''.join([f'{i:02x}' for i in range(32)])}",
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        return TaskResult(
            task_id=task.task_id,
            status=TaskStatus.FAILED,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )

async def execute_swap_task(task: ExecutionTask) -> TaskResult:
    """Execute a token swap task"""
    try:
        # Simulate swap execution
        await asyncio.sleep(2.5)  # Simulate network delay
        
        result = {
            'from_token': task.parameters.get('from_token', 'USDC'),
            'to_token': task.parameters.get('to_token', 'ETH'),
            'amount_in': task.parameters.get('amount_in', 1000),
            'amount_out': task.parameters.get('amount_out', 0.33),
            'slippage': task.parameters.get('slippage', 0.5),
            'route': ['USDC', 'WETH', 'ETH'],
        }
        
        return TaskResult(
            task_id=task.task_id,
            status=TaskStatus.COMPLETED,
            result=result,
            gas_used=150000,
            transaction_hash=f"0x{''.join([f'{i:02x}' for i in range(32)])}",
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        return TaskResult(
            task_id=task.task_id,
            status=TaskStatus.FAILED,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )

async def execute_task(task: ExecutionTask) -> TaskResult:
    """Execute a task based on its type"""
    # Update task status to in progress
    ACTIVE_TASKS[task.task_id] = task
    
    # Send progress update
    progress_update = TaskUpdate(
        task_id=task.task_id,
        status=TaskStatus.IN_PROGRESS,
        progress=0.1,
        message=f"Starting {task.task_type.value} task",
        timestamp=datetime.now().isoformat()
    )
    
    try:
        if task.task_type == TaskType.TRADE:
            result = await execute_trade_task(task)
        elif task.task_type == TaskType.STAKE:
            result = await execute_stake_task(task)
        elif task.task_type == TaskType.SWAP:
            result = await execute_swap_task(task)
        else:
            result = TaskResult(
                task_id=task.task_id,
                status=TaskStatus.FAILED,
                error=f"Unsupported task type: {task.task_type}",
                timestamp=datetime.now().isoformat()
            )
        
        # Store in history
        TASK_HISTORY[task.task_id] = result
        
        # Remove from active tasks
        if task.task_id in ACTIVE_TASKS:
            del ACTIVE_TASKS[task.task_id]
        
        return result
    
    except Exception as e:
        result = TaskResult(
            task_id=task.task_id,
            status=TaskStatus.FAILED,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )
        
        TASK_HISTORY[task.task_id] = result
        if task.task_id in ACTIVE_TASKS:
            del ACTIVE_TASKS[task.task_id]
        
        return result

@executor_agent.on_message(model=ExecutionTask)
async def handle_execution_task(ctx: Context, sender: str, msg: ExecutionTask):
    """Handle task execution requests"""
    try:
        ctx.logger.info(f"Received execution task: {msg.task_type.value} from {sender}")
        
        # Add to queue
        TASK_QUEUE.append(msg)
        
        # Process task
        result = await execute_task(msg)
        
        # Send result back to sender
        await ctx.send(sender, result)
        
        ctx.logger.info(f"Completed task {msg.task_id}: {result.status.value}")
    
    except Exception as e:
        ctx.logger.error(f"Error executing task {msg.task_id}: {e}")
        
        error_result = TaskResult(
            task_id=msg.task_id,
            status=TaskStatus.FAILED,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )
        
        await ctx.send(sender, error_result)

@executor_agent.on_interval(period=5.0)
async def process_queue(ctx: Context):
    """Process pending tasks in the queue"""
    if TASK_QUEUE:
        # Process tasks in priority order
        TASK_QUEUE.sort(key=lambda x: x.priority, reverse=True)
        
        # Process up to 3 tasks concurrently
        tasks_to_process = TASK_QUEUE[:3]
        TASK_QUEUE[:3] = []
        
        for task in tasks_to_process:
            asyncio.create_task(execute_task(task))

@executor_agent.on_message(model=TaskUpdate)
async def handle_task_update_request(ctx: Context, sender: str, msg: TaskUpdate):
    """Handle task status update requests"""
    try:
        task_id = msg.task_id
        
        if task_id in ACTIVE_TASKS:
            task = ACTIVE_TASKS[task_id]
            status = TaskStatus.IN_PROGRESS
            progress = 0.5  # Mock progress
            message = f"Task {task_id} is in progress"
        elif task_id in TASK_HISTORY:
            result = TASK_HISTORY[task_id]
            status = result.status
            progress = 1.0 if status == TaskStatus.COMPLETED else 0.0
            message = f"Task {task_id} completed with status: {status.value}"
        else:
            status = TaskStatus.PENDING
            progress = 0.0
            message = f"Task {task_id} not found"
        
        update = TaskUpdate(
            task_id=task_id,
            status=status,
            progress=progress,
            message=message,
            timestamp=datetime.now().isoformat()
        )
        
        await ctx.send(sender, update)
    
    except Exception as e:
        ctx.logger.error(f"Error handling task update request: {e}")

# Include the protocol
executor_agent.include(executor_protocol, publish_manifest=True)

if __name__ == "__main__":
    executor_agent.run()
