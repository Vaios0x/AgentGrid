#!/usr/bin/env python3
"""
Script to start all AgentGrid agents
"""

import asyncio
import subprocess
import sys
import os
from pathlib import Path

# Add the agents directory to the Python path
agents_dir = Path(__file__).parent.parent / "agents"
sys.path.insert(0, str(agents_dir))

async def start_agent(agent_name, port):
    """Start a single agent"""
    print(f"Starting {agent_name} on port {port}...")
    
    try:
        # Import and run the agent
        if agent_name == "portfolio_manager":
            from portfolio_manager.agent import portfolio_agent
            await portfolio_agent.run()
        elif agent_name == "price_monitor":
            from price_monitor.agent import price_agent
            await price_agent.run()
        elif agent_name == "executor":
            from executor.agent import executor_agent
            await executor_agent.run()
        else:
            print(f"Unknown agent: {agent_name}")
            return False
            
    except Exception as e:
        print(f"Error starting {agent_name}: {e}")
        return False
    
    return True

async def main():
    """Start all agents concurrently"""
    agents = [
        ("portfolio_manager", 8001),
        ("price_monitor", 8002),
        ("executor", 8003),
    ]
    
    print("🤖 Starting AgentGrid agents...")
    print("=" * 50)
    
    # Start all agents concurrently
    tasks = []
    for agent_name, port in agents:
        task = asyncio.create_task(start_agent(agent_name, port))
        tasks.append(task)
    
    # Wait for all agents to start
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Check results
    success_count = sum(1 for result in results if result is True)
    total_count = len(agents)
    
    print("=" * 50)
    if success_count == total_count:
        print(f"✅ All {total_count} agents started successfully!")
    else:
        print(f"⚠️  {success_count}/{total_count} agents started successfully")
        print("Check the logs above for any errors")
    
    # Keep the script running
    try:
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping agents...")
        for task in tasks:
            task.cancel()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
        sys.exit(0)
