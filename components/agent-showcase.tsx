'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Star, 
  Clock, 
  DollarSign,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NeuralCard } from '@/components/ui/neural-card'
import Link from 'next/link'

const agents = [
  {
    id: '1',
    name: 'Portfolio Manager Pro',
    description: 'Advanced portfolio optimization using modern portfolio theory and real-time market data.',
    category: 'Trading',
    price: 0.05,
    rating: 4.9,
    tasks: 1247,
    successRate: 98.5,
    image: '/agents/portfolio-manager.jpg',
    capabilities: ['Risk Analysis', 'Rebalancing', 'Performance Tracking'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    name: 'Price Monitor Elite',
    description: 'Real-time price monitoring with advanced alerting and trend analysis capabilities.',
    category: 'Research',
    price: 0.03,
    rating: 4.8,
    tasks: 892,
    successRate: 97.2,
    image: '/agents/price-monitor.jpg',
    capabilities: ['Price Alerts', 'Trend Analysis', 'Market Research'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: '3',
    name: 'DeFi Executor',
    description: 'Automated DeFi operations including yield farming, liquidity provision, and arbitrage.',
    category: 'DeFi',
    price: 0.08,
    rating: 4.9,
    tasks: 2156,
    successRate: 99.1,
    image: '/agents/defi-executor.jpg',
    capabilities: ['Yield Farming', 'Arbitrage', 'Liquidity Management'],
    color: 'from-purple-500 to-pink-500',
  },
]

export function AgentShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism border border-primary-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">
              Featured Agents
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Meet Our
            <br />
            <span className="neural-text-gradient">AI Workforce</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover powerful AI agents ready to work for you. Each agent is verified, 
            has proven capabilities, and comes with on-chain reputation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <NeuralCard className="h-full">
                <div className="p-6 h-full flex flex-col">
                  {/* Agent Image */}
                  <div className={`w-full h-48 rounded-xl bg-gradient-to-r ${agent.color} mb-6 flex items-center justify-center`}>
                    <div className="text-6xl">🤖</div>
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300">
                        {agent.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-white">
                          {agent.rating}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">
                      {agent.name}
                    </h3>

                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {agent.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="px-2 py-1 rounded-md text-xs bg-white/10 text-gray-300"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {agent.tasks.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">Tasks Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {agent.successRate}%
                        </div>
                        <div className="text-xs text-gray-400">Success Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-2xl font-bold text-white">
                        {agent.price}
                      </span>
                      <span className="text-sm text-gray-400">PYUSD</span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white"
                    >
                      <Link href={`/marketplace/${agent.id}`}>
                        Hire Agent
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </NeuralCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-500/50 text-primary-300 hover:bg-primary-500/10 px-8 py-4 text-lg font-semibold"
          >
            <Link href="/marketplace">
              View All Agents
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
