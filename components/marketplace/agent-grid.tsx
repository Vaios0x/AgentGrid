'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NeuralCard } from '../ui/neural-card'
import { Button } from '../ui/button'
import { Star, Clock, DollarSign, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  description: string
  category: string
  price: number
  rating: number
  tasks: number
  successRate: number
  image: string
  capabilities: string[]
  color: string
  isOnline: boolean
  responseTime: string
}

// Mock data for demonstration
const mockAgents: Agent[] = [
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
    isOnline: true,
    responseTime: '< 1s'
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
    isOnline: true,
    responseTime: '< 500ms'
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
    isOnline: false,
    responseTime: '< 2s'
  },
  {
    id: '4',
    name: 'Smart Contract Auditor',
    description: 'Automated smart contract security analysis and vulnerability detection.',
    category: 'Security',
    price: 0.12,
    rating: 4.7,
    tasks: 456,
    successRate: 96.8,
    image: '/agents/auditor.jpg',
    capabilities: ['Security Analysis', 'Vulnerability Detection', 'Code Review'],
    color: 'from-red-500 to-orange-500',
    isOnline: true,
    responseTime: '< 5s'
  },
  {
    id: '5',
    name: 'NFT Market Analyzer',
    description: 'Comprehensive NFT market analysis with floor price tracking and trend prediction.',
    category: 'NFT',
    price: 0.04,
    rating: 4.6,
    tasks: 678,
    successRate: 95.3,
    image: '/agents/nft-analyzer.jpg',
    capabilities: ['Floor Price Tracking', 'Trend Analysis', 'Collection Analysis'],
    color: 'from-pink-500 to-rose-500',
    isOnline: true,
    responseTime: '< 1s'
  },
  {
    id: '6',
    name: 'Governance Bot',
    description: 'Automated governance participation and proposal analysis for DAOs.',
    category: 'Governance',
    price: 0.06,
    rating: 4.8,
    tasks: 334,
    successRate: 98.1,
    image: '/agents/governance-bot.jpg',
    capabilities: ['Proposal Analysis', 'Voting', 'Governance Tracking'],
    color: 'from-indigo-500 to-purple-500',
    isOnline: false,
    responseTime: '< 3s'
  }
]

export function AgentGrid() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [loading, setLoading] = useState(false)

  // Simulate loading
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glassmorphism rounded-2xl p-6 animate-pulse">
            <div className="w-full h-48 bg-gray-700 rounded-xl mb-6" />
            <div className="h-4 bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-700 rounded mb-4 w-3/4" />
            <div className="h-3 bg-gray-700 rounded mb-2" />
            <div className="h-3 bg-gray-700 rounded mb-4 w-1/2" />
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-700 rounded w-20" />
              <div className="h-8 bg-gray-700 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <NeuralCard className="h-full">
            <div className="p-6 h-full flex flex-col">
              {/* Agent Image and Status */}
              <div className="relative mb-6">
                <div className={`w-full h-48 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center`}>
                  <div className="text-6xl">🤖</div>
                </div>
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                  agent.isOnline 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}>
                  {agent.isOnline ? 'Online' : 'Offline'}
                </div>
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
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.capabilities.slice(0, 3).map((capability) => (
                    <span
                      key={capability}
                      className="px-2 py-1 rounded-md text-xs bg-white/10 text-gray-300"
                    >
                      {capability}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="px-2 py-1 rounded-md text-xs bg-white/10 text-gray-300">
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
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

                {/* Response Time */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Response time: {agent.responseTime}</span>
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
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </NeuralCard>
        </motion.div>
      ))}
    </div>
  )
}
