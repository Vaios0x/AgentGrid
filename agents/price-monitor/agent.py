from uagents import Agent, Context, Model, Protocol
from typing import List, Dict, Optional
import asyncio
import json
import aiohttp
from datetime import datetime, timedelta

class PriceAlert(Model):
    symbol: str
    target_price: float
    condition: str  # 'above', 'below', 'change'
    user_address: str
    alert_id: str

class PriceUpdate(Model):
    symbol: str
    price: float
    timestamp: str
    change_24h: float
    volume_24h: float

class PriceData(Model):
    symbol: str
    price: float
    change_24h: float
    volume_24h: float
    market_cap: float
    timestamp: str

# Initialize the price monitor agent
price_agent = Agent(
    name="price_monitor",
    seed="price_monitor_seed_phrase_12345",
    port=8002,
    endpoint=["http://127.0.0.1:8002/submit"]
)

price_protocol = Protocol("Price Monitoring")

# Tracked symbols and their current data
TRACKED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'USDC', 'USDT']
PRICE_DATA = {}
ALERTS = {}

# Mock price data for demonstration
MOCK_PRICES = {
    'BTC': {'price': 45000, 'change_24h': 2.5, 'volume_24h': 25000000000},
    'ETH': {'price': 3000, 'change_24h': 3.2, 'volume_24h': 15000000000},
    'SOL': {'price': 100, 'change_24h': -1.8, 'volume_24h': 2000000000},
    'AVAX': {'price': 25, 'change_24h': 5.1, 'volume_24h': 800000000},
    'MATIC': {'price': 0.8, 'change_24h': 1.2, 'volume_24h': 500000000},
    'USDC': {'price': 1.0, 'change_24h': 0.0, 'volume_24h': 1000000000},
    'USDT': {'price': 1.0, 'change_24h': 0.0, 'volume_24h': 2000000000},
}

async def fetch_price_data(symbol: str) -> Optional[Dict]:
    """Fetch real-time price data for a symbol"""
    try:
        # In production, this would use a real API like CoinGecko, CoinMarketCap, etc.
        # For demo purposes, we'll use mock data with some randomness
        if symbol in MOCK_PRICES:
            base_data = MOCK_PRICES[symbol].copy()
            # Add some randomness to simulate price movement
            import random
            price_change = random.uniform(-0.05, 0.05)  # ±5% random change
            base_data['price'] *= (1 + price_change)
            base_data['change_24h'] += random.uniform(-2, 2)
            return base_data
        return None
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

async def check_alerts(symbol: str, current_price: float):
    """Check if any alerts should be triggered for this symbol"""
    if symbol not in ALERTS:
        return
    
    triggered_alerts = []
    for alert_id, alert in ALERTS[symbol].items():
        should_trigger = False
        
        if alert['condition'] == 'above' and current_price > alert['target_price']:
            should_trigger = True
        elif alert['condition'] == 'below' and current_price < alert['target_price']:
            should_trigger = True
        elif alert['condition'] == 'change':
            # Check for significant price change (simplified)
            if abs(PRICE_DATA.get(symbol, {}).get('change_24h', 0)) > 5:
                should_trigger = True
        
        if should_trigger:
            triggered_alerts.append(alert_id)
    
    # Remove triggered alerts
    for alert_id in triggered_alerts:
        del ALERTS[symbol][alert_id]
        if not ALERTS[symbol]:
            del ALERTS[symbol]

@price_agent.on_interval(period=30.0)  # Update every 30 seconds
async def update_prices(ctx: Context):
    """Periodically update price data for all tracked symbols"""
    try:
        for symbol in TRACKED_SYMBOLS:
            price_data = await fetch_price_data(symbol)
            if price_data:
                PRICE_DATA[symbol] = {
                    'symbol': symbol,
                    'price': price_data['price'],
                    'change_24h': price_data['change_24h'],
                    'volume_24h': price_data['volume_24h'],
                    'market_cap': price_data['price'] * 1000000,  # Mock market cap
                    'timestamp': datetime.now().isoformat()
                }
                
                # Check for alerts
                await check_alerts(symbol, price_data['price'])
                
                # Broadcast price update to other agents
                price_update = PriceUpdate(
                    symbol=symbol,
                    price=price_data['price'],
                    timestamp=datetime.now().isoformat(),
                    change_24h=price_data['change_24h'],
                    volume_24h=price_data['volume_24h']
                )
                
                # Send to portfolio manager
                await ctx.send("portfolio_manager", price_update)
                
                ctx.logger.info(f"Updated {symbol}: ${price_data['price']:.2f} ({price_data['change_24h']:+.2f}%)")
    
    except Exception as e:
        ctx.logger.error(f"Error updating prices: {e}")

@price_agent.on_message(model=PriceAlert)
async def handle_price_alert(ctx: Context, sender: str, msg: PriceAlert):
    """Handle price alert requests"""
    try:
        if msg.symbol not in ALERTS:
            ALERTS[msg.symbol] = {}
        
        ALERTS[msg.symbol][msg.alert_id] = {
            'target_price': msg.target_price,
            'condition': msg.condition,
            'user_address': msg.user_address,
            'created_at': datetime.now().isoformat()
        }
        
        ctx.logger.info(f"Created price alert for {msg.symbol}: {msg.condition} ${msg.target_price}")
        
    except Exception as e:
        ctx.logger.error(f"Error creating price alert: {e}")

@price_agent.on_message(model=PriceData)
async def handle_price_request(ctx: Context, sender: str, msg: PriceData):
    """Handle price data requests"""
    try:
        symbol = msg.symbol.upper()
        if symbol in PRICE_DATA:
            price_data = PRICE_DATA[symbol]
            response = PriceData(
                symbol=price_data['symbol'],
                price=price_data['price'],
                change_24h=price_data['change_24h'],
                volume_24h=price_data['volume_24h'],
                market_cap=price_data['market_cap'],
                timestamp=price_data['timestamp']
            )
            await ctx.send(sender, response)
        else:
            ctx.logger.warning(f"Price data not available for {symbol}")
    
    except Exception as e:
        ctx.logger.error(f"Error handling price request: {e}")

# Include the protocol
price_agent.include(price_protocol, publish_manifest=True)

if __name__ == "__main__":
    price_agent.run()
