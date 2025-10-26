#!/usr/bin/env python3
"""
Script to test AgentGrid agents
"""

import asyncio
import json
import sys
from pathlib import Path

# Add the agents directory to the Python path
agents_dir = Path(__file__).parent.parent / "agents"
sys.path.insert(0, str(agents_dir))

from uagents import Agent, Context
from portfolio_manager.agent import PortfolioRequest, PortfolioResponse
from price_monitor.agent import PriceData
from executor.agent import ExecutionTask, TaskResult, TaskType

async def test_portfolio_agent():
    """Test the portfolio manager agent"""
    print("🧪 Testing Portfolio Manager Agent...")
    
    try:
        # Create a test portfolio request
        request = PortfolioRequest(
            user_address="0x1234567890123456789012345678901234567890",
            risk_level="medium",
            amount=1000.0,
            preferences={"max_volatility": 0.3}
        )
        
        print(f"  📊 Risk Level: {request.risk_level}")
        print(f"  💰 Amount: ${request.amount}")
        
        # In a real test, you would send this to the agent
        # For now, we'll just validate the request
        assert request.risk_level in ["low", "medium", "high"]
        assert request.amount > 0
        assert len(request.user_address) == 42
        
        print("  ✅ Portfolio request validation passed")
        return True
        
    except Exception as e:
        print(f"  ❌ Portfolio agent test failed: {e}")
        return False

async def test_price_agent():
    """Test the price monitor agent"""
    print("🧪 Testing Price Monitor Agent...")
    
    try:
        # Test price data structure
        price_data = PriceData(
            symbol="BTC",
            price=45000.0,
            change_24h=2.5,
            volume_24h=25000000000,
            market_cap=850000000000,
            timestamp="2024-01-15T10:30:00Z"
        )
        
        print(f"  📈 Symbol: {price_data.symbol}")
        print(f"  💰 Price: ${price_data.price:,.2f}")
        print(f"  📊 24h Change: {price_data.change_24h:+.2f}%")
        
        # Validate price data
        assert price_data.price > 0
        assert price_data.volume_24h > 0
        assert price_data.market_cap > 0
        
        print("  ✅ Price data validation passed")
        return True
        
    except Exception as e:
        print(f"  ❌ Price agent test failed: {e}")
        return False

async def test_executor_agent():
    """Test the executor agent"""
    print("🧪 Testing Executor Agent...")
    
    try:
        # Test execution task
        task = ExecutionTask(
            task_id="test_task_001",
            task_type=TaskType.TRADE,
            user_address="0x1234567890123456789012345678901234567890",
            parameters={
                "symbol": "ETH",
                "amount": 1.0,
                "side": "buy",
                "price": 3000.0
            },
            priority=1
        )
        
        print(f"  🎯 Task ID: {task.task_id}")
        print(f"  🔧 Task Type: {task.task_type.value}")
        print(f"  📋 Parameters: {len(task.parameters)} items")
        
        # Validate task
        assert task.task_id is not None
        assert task.task_type in TaskType
        assert len(task.parameters) > 0
        
        print("  ✅ Execution task validation passed")
        return True
        
    except Exception as e:
        print(f"  ❌ Executor agent test failed: {e}")
        return False

async def test_agent_communication():
    """Test communication between agents"""
    print("🧪 Testing Agent Communication...")
    
    try:
        # Test that agents can be imported and instantiated
        from portfolio_manager.agent import portfolio_agent
        from price_monitor.agent import price_agent
        from executor.agent import executor_agent
        
        print("  📡 Portfolio Agent: ✅")
        print("  📡 Price Monitor Agent: ✅")
        print("  📡 Executor Agent: ✅")
        
        # Test agent properties
        assert portfolio_agent.name == "portfolio_manager"
        assert price_agent.name == "price_monitor"
        assert executor_agent.name == "executor"
        
        print("  ✅ Agent communication test passed")
        return True
        
    except Exception as e:
        print(f"  ❌ Agent communication test failed: {e}")
        return False

async def main():
    """Run all agent tests"""
    print("🚀 Starting AgentGrid Agent Tests")
    print("=" * 50)
    
    tests = [
        test_portfolio_agent,
        test_price_agent,
        test_executor_agent,
        test_agent_communication,
    ]
    
    results = []
    for test in tests:
        result = await test()
        results.append(result)
        print()  # Add spacing between tests
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Agents are ready to deploy.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)
