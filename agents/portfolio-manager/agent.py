# Mock implementation for development
# In production, this would use the actual uagents package
from typing import List, Dict, Optional
import asyncio
import json
import numpy as np
from datetime import datetime

class PortfolioRequest(Model):
    user_address: str
    risk_level: str  # 'low', 'medium', 'high'
    amount: float
    preferences: Optional[Dict[str, any]] = None

class PortfolioResponse(Model):
    allocations: Dict[str, float]
    expected_return: float
    risk_score: float
    recommendations: List[str]
    timestamp: str

class PriceUpdate(Model):
    symbol: str
    price: float
    timestamp: str

# Initialize the portfolio manager agent
portfolio_agent = Agent(
    name="portfolio_manager",
    seed="portfolio_manager_seed_phrase_12345",
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"]
)

portfolio_protocol = Protocol("Portfolio Management")

# Mock data for demonstration
CRYPTO_ASSETS = {
    'BTC': {'price': 45000, 'volatility': 0.8, 'correlation': 0.1},
    'ETH': {'price': 3000, 'volatility': 0.9, 'correlation': 0.3},
    'SOL': {'price': 100, 'volatility': 1.2, 'correlation': 0.5},
    'AVAX': {'price': 25, 'volatility': 1.1, 'correlation': 0.4},
    'MATIC': {'price': 0.8, 'volatility': 0.7, 'correlation': 0.6},
    'USDC': {'price': 1.0, 'volatility': 0.01, 'correlation': 0.0},
    'USDT': {'price': 1.0, 'volatility': 0.01, 'correlation': 0.0},
}

def calculate_portfolio_metrics(allocations: Dict[str, float]) -> tuple[float, float]:
    """Calculate expected return and risk score for given allocations"""
    total_return = 0
    total_risk = 0
    
    for asset, weight in allocations.items():
        if asset in CRYPTO_ASSETS:
            asset_data = CRYPTO_ASSETS[asset]
            # Simple expected return calculation (mock)
            expected_return = 0.1 if asset not in ['USDC', 'USDT'] else 0.02
            total_return += weight * expected_return
            total_risk += weight * asset_data['volatility']
    
    return total_return, total_risk

def optimize_portfolio(risk_level: str, amount: float) -> Dict[str, float]:
    """Optimize portfolio based on risk level using modern portfolio theory"""
    
    if risk_level == 'low':
        # Conservative portfolio
        return {
            'USDC': 0.4,
            'USDT': 0.3,
            'BTC': 0.2,
            'ETH': 0.1
        }
    elif risk_level == 'medium':
        # Balanced portfolio
        return {
            'BTC': 0.3,
            'ETH': 0.25,
            'SOL': 0.15,
            'AVAX': 0.1,
            'MATIC': 0.1,
            'USDC': 0.1
        }
    else:  # high risk
        # Aggressive portfolio
        return {
            'BTC': 0.25,
            'ETH': 0.2,
            'SOL': 0.2,
            'AVAX': 0.15,
            'MATIC': 0.15,
            'USDC': 0.05
        }

def generate_recommendations(allocations: Dict[str, float], risk_level: str) -> List[str]:
    """Generate investment recommendations based on portfolio"""
    recommendations = []
    
    if risk_level == 'low':
        recommendations.extend([
            "Consider dollar-cost averaging for stable growth",
            "Monitor market conditions monthly",
            "Rebalance quarterly to maintain target allocation"
        ])
    elif risk_level == 'medium':
        recommendations.extend([
            "Diversify across different sectors",
            "Consider staking rewards for passive income",
            "Monitor weekly and rebalance monthly"
        ])
    else:
        recommendations.extend([
            "High volatility expected - prepare for swings",
            "Consider stop-loss strategies",
            "Monitor daily and be ready to adjust quickly"
        ])
    
    # Add specific recommendations based on allocations
    if allocations.get('BTC', 0) > 0.3:
        recommendations.append("High BTC allocation - consider reducing if overexposed")
    
    if allocations.get('USDC', 0) + allocations.get('USDT', 0) < 0.1:
        recommendations.append("Low stablecoin allocation - consider adding more for stability")
    
    return recommendations

@portfolio_agent.on_message(model=PortfolioRequest, replies=PortfolioResponse)
async def handle_portfolio_request(ctx: Context, sender: str, msg: PortfolioRequest):
    """Handle portfolio optimization requests"""
    try:
        ctx.logger.info(f"Received portfolio request from {sender}: {msg.risk_level} risk, ${msg.amount}")
        
        # Optimize portfolio based on risk level
        allocations = optimize_portfolio(msg.risk_level, msg.amount)
        
        # Calculate metrics
        expected_return, risk_score = calculate_portfolio_metrics(allocations)
        
        # Generate recommendations
        recommendations = generate_recommendations(allocations, msg.risk_level)
        
        # Create response
        response = PortfolioResponse(
            allocations=allocations,
            expected_return=expected_return,
            risk_score=risk_score,
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
        await ctx.send(sender, response)
        ctx.logger.info(f"Sent portfolio response to {sender}")
        
    except Exception as e:
        ctx.logger.error(f"Error handling portfolio request: {e}")
        # Send error response
        error_response = PortfolioResponse(
            allocations={},
            expected_return=0.0,
            risk_score=1.0,
            recommendations=["Error processing request. Please try again."],
            timestamp=datetime.now().isoformat()
        )
        await ctx.send(sender, error_response)

@portfolio_agent.on_message(model=PriceUpdate)
async def handle_price_update(ctx: Context, sender: str, msg: PriceUpdate):
    """Handle price updates from price monitor agent"""
    try:
        if msg.symbol in CRYPTO_ASSETS:
            CRYPTO_ASSETS[msg.symbol]['price'] = msg.price
            ctx.logger.info(f"Updated {msg.symbol} price to ${msg.price}")
    except Exception as e:
        ctx.logger.error(f"Error updating price for {msg.symbol}: {e}")

# Include the protocol
portfolio_agent.include(portfolio_protocol, publish_manifest=True)

if __name__ == "__main__":
    portfolio_agent.run()
