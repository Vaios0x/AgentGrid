// Portfolio Manager Agent - TypeScript implementation
import { Agent, Context, Protocol } from '@/lib/agents/mock-uagents'

export interface PortfolioRequest {
  user_address: string
  risk_level: 'low' | 'medium' | 'high'
  amount: number
  preferences?: Record<string, any>
}

export interface PortfolioResponse {
  allocations: Record<string, number>
  expected_return: number
  risk_score: number
  recommendations: string[]
  timestamp: string
}

export interface PriceUpdate {
  symbol: string
  price: number
  timestamp: string
  change_24h: number
  volume_24h: number
}

// Mock data for demonstration
const CRYPTO_ASSETS = {
  'BTC': { price: 45000, volatility: 0.8, correlation: 0.1 },
  'ETH': { price: 3000, volatility: 0.9, correlation: 0.3 },
  'SOL': { price: 100, volatility: 1.2, correlation: 0.5 },
  'AVAX': { price: 25, volatility: 1.1, correlation: 0.4 },
  'MATIC': { price: 0.8, volatility: 0.7, correlation: 0.6 },
  'USDC': { price: 1.0, volatility: 0.01, correlation: 0.0 },
  'USDT': { price: 1.0, volatility: 0.01, correlation: 0.0 },
}

function calculatePortfolioMetrics(allocations: Record<string, number>): [number, number] {
  let totalReturn = 0
  let totalRisk = 0
  
  for (const [asset, weight] of Object.entries(allocations)) {
    if (asset in CRYPTO_ASSETS) {
      const assetData = CRYPTO_ASSETS[asset as keyof typeof CRYPTO_ASSETS]
      const expectedReturn = asset === 'USDC' || asset === 'USDT' ? 0.02 : 0.1
      totalReturn += weight * expectedReturn
      totalRisk += weight * assetData.volatility
    }
  }
  
  return [totalReturn, totalRisk]
}

function optimizePortfolio(riskLevel: string, _amount: number): Record<string, number> {
  if (riskLevel === 'low') {
    return {
      'USDC': 0.4,
      'USDT': 0.3,
      'BTC': 0.2,
      'ETH': 0.1
    }
  } else if (riskLevel === 'medium') {
    return {
      'BTC': 0.3,
      'ETH': 0.25,
      'SOL': 0.15,
      'AVAX': 0.1,
      'MATIC': 0.1,
      'USDC': 0.1
    }
  } else {
    return {
      'BTC': 0.25,
      'ETH': 0.2,
      'SOL': 0.2,
      'AVAX': 0.15,
      'MATIC': 0.15,
      'USDC': 0.05
    }
  }
}

function generateRecommendations(allocations: Record<string, number>, riskLevel: string): string[] {
  const recommendations: string[] = []
  
  if (riskLevel === 'low') {
    recommendations.push(
      'Consider dollar-cost averaging for stable growth',
      'Monitor market conditions monthly',
      'Rebalance quarterly to maintain target allocation'
    )
  } else if (riskLevel === 'medium') {
    recommendations.push(
      'Diversify across different sectors',
      'Consider staking rewards for passive income',
      'Monitor weekly and rebalance monthly'
    )
  } else {
    recommendations.push(
      'High volatility expected - prepare for swings',
      'Consider stop-loss strategies',
      'Monitor daily and be ready to adjust quickly'
    )
  }
  
  if ((allocations['BTC'] || 0) > 0.3) {
    recommendations.push('High BTC allocation - consider reducing if overexposed')
  }
  
  const stablecoinAllocation = (allocations['USDC'] || 0) + (allocations['USDT'] || 0)
  if (stablecoinAllocation < 0.1) {
    recommendations.push('Low stablecoin allocation - consider adding more for stability')
  }
  
  return recommendations
}

// Initialize the portfolio manager agent
export const portfolioAgent = Agent({
  name: 'portfolio_manager',
  seed: 'portfolio_manager_seed_phrase_12345',
  port: 8001,
  endpoint: ['http://127.0.0.1:8001/submit']
})

export const portfolioProtocol = Protocol('Portfolio Management')

// Mock message handlers
portfolioAgent.on_message('PortfolioRequest', async (ctx: Context, _sender: string, msg: PortfolioRequest) => {
  try {
    ctx.logger.info(`Received portfolio request: ${msg.risk_level} risk, $${msg.amount}`)
    
    const allocations = optimizePortfolio(msg.risk_level, msg.amount)
    const [expectedReturn, riskScore] = calculatePortfolioMetrics(allocations)
    const recommendations = generateRecommendations(allocations, msg.risk_level)
    
    const response: PortfolioResponse = {
      allocations,
      expected_return: expectedReturn,
      risk_score: riskScore,
      recommendations,
      timestamp: new Date().toISOString()
    }
    
    await ctx.send('client', response)
    ctx.logger.info(`Sent portfolio response to client`)
    
  } catch (error) {
    ctx.logger.error(`Error handling portfolio request: ${error}`)
    
    const errorResponse: PortfolioResponse = {
      allocations: {},
      expected_return: 0.0,
      risk_score: 1.0,
      recommendations: ['Error processing request. Please try again.'],
      timestamp: new Date().toISOString()
    }
    
    await ctx.send('client', errorResponse)
  }
})

portfolioAgent.on_message('PriceUpdate', async (ctx: Context, _sender: string, msg: PriceUpdate) => {
  try {
    if (msg.symbol in CRYPTO_ASSETS) {
      (CRYPTO_ASSETS as any)[msg.symbol].price = msg.price
      ctx.logger.info(`Updated ${msg.symbol} price to $${msg.price}`)
    }
  } catch (error) {
    ctx.logger.error(`Error updating price for ${msg.symbol}: ${error}`)
  }
})

portfolioAgent.include(portfolioProtocol, { publish_manifest: true })

// Export for use in other parts of the application
export { portfolioAgent as default }
