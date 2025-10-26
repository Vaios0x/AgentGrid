'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NeuralCard } from '../ui/neural-card'
import { Button } from '../ui/button'
import { 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  Shield, 
  Zap,
  ArrowLeft,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface AgentDetailProps {
  agentId: string
}

interface Agent {
  id: string
  name: string
  description: string
  longDescription: string
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
  developer: {
    name: string
    address: string
    reputation: number
  }
  contractAddress: string
  lastUpdated: string
  totalEarnings: number
  averageRating: number
  reviews: number
}

// Mock data for demonstration
const mockAgent: Agent = {
  id: '1',
  name: 'Portfolio Manager Pro',
  description: 'Advanced portfolio optimization using modern portfolio theory and real-time market data.',
  longDescription: 'Portfolio Manager Pro is a sophisticated AI agent that specializes in cryptocurrency portfolio optimization. Using advanced algorithms based on Modern Portfolio Theory, it analyzes market conditions, risk factors, and user preferences to create optimal asset allocations. The agent continuously monitors market movements, rebalances portfolios automatically, and provides detailed performance analytics. It integrates with multiple exchanges and DeFi protocols to execute trades and manage positions efficiently.',
  category: 'Trading',
  price: 0.05,
  rating: 4.9,
  tasks: 1247,
  successRate: 98.5,
  image: '/agents/portfolio-manager.jpg',
  capabilities: [
    'Risk Analysis',
    'Portfolio Rebalancing',
    'Performance Tracking',
    'Market Analysis',
    'Automated Trading',
    'Yield Optimization',
    'Risk Management',
    'Performance Reporting'
  ],
  color: 'from-blue-500 to-cyan-500',
  isOnline: true,
  responseTime: '< 1s',
  developer: {
    name: 'CryptoQuant Labs',
    address: '0x1234...5678',
    reputation: 4.8
  },
  contractAddress: '0xabcd...efgh',
  lastUpdated: '2024-01-15T10:30:00Z',
  totalEarnings: 125.5,
  averageRating: 4.9,
  reviews: 156
}

export function AgentDetail({ agentId }: AgentDetailProps) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setAgent(mockAgent)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [agentId])

  if (loading) {
    return (
      <div className="glassmorphism rounded-2xl p-8 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-6 bg-gray-700 rounded mb-2 w-1/2" />
            <div className="h-4 bg-gray-700 rounded w-1/3" />
          </div>
        </div>
        <div className="h-4 bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-700 rounded mb-4 w-3/4" />
        <div className="h-32 bg-gray-700 rounded" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="glassmorphism rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Agent Not Found</h2>
        <p className="text-gray-300 mb-6">The agent you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/marketplace">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <NeuralCard>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${agent.color} flex items-center justify-center`}>
                <div className="text-4xl">🤖</div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{agent.name}</h1>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    agent.isOnline 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {agent.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <span className="px-3 py-1 rounded-full text-sm bg-primary-500/20 text-primary-300">
                    {agent.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{agent.rating}</span>
                    <span className="text-sm">({agent.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/marketplace">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">About This Agent</h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {agent.longDescription}
            </p>
          </div>

          {/* Capabilities */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {agent.capabilities.map((capability) => (
                <div
                  key={capability}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">{capability}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {agent.tasks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {agent.successRate}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {agent.responseTime}
              </div>
              <div className="text-sm text-gray-400">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                ${agent.totalEarnings}
              </div>
              <div className="text-sm text-gray-400">Total Earnings</div>
            </div>
          </div>

          {/* Developer Info */}
          <div className="glassmorphism rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Developer Information</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{agent.developer.name}</div>
                <div className="text-sm text-gray-400">{agent.developer.address}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{agent.developer.reputation}</span>
                </div>
                <div className="text-sm text-gray-400">Developer Rating</div>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Smart Contract</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Contract Address</div>
                <div className="text-white font-mono">{agent.contractAddress}</div>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </div>
        </div>
      </NeuralCard>
    </motion.div>
  )
}
