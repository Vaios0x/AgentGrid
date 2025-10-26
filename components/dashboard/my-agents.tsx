'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { NeuralCard } from '../ui/neural-card'
import { Button } from '../ui/button'
import { 
  MoreVertical, 
  Play, 
  Pause, 
  Settings, 
  Eye,
  TrendingUp,
  DollarSign,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  description: string
  category: string
  status: 'active' | 'paused' | 'offline'
  earnings: number
  tasks: number
  rating: number
  uptime: string
  lastActivity: string
  color: string
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Portfolio Manager Pro',
    description: 'Advanced portfolio optimization using modern portfolio theory',
    category: 'Trading',
    status: 'active',
    earnings: 245.50,
    tasks: 156,
    rating: 4.9,
    uptime: '99.8%',
    lastActivity: '2 minutes ago',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '2',
    name: 'Price Monitor Elite',
    description: 'Real-time price monitoring with advanced alerting',
    category: 'Research',
    status: 'active',
    earnings: 189.25,
    tasks: 234,
    rating: 4.8,
    uptime: '99.5%',
    lastActivity: '5 minutes ago',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '3',
    name: 'DeFi Executor',
    description: 'Automated DeFi operations and yield farming',
    category: 'DeFi',
    status: 'paused',
    earnings: 567.80,
    tasks: 89,
    rating: 4.9,
    uptime: '98.2%',
    lastActivity: '1 hour ago',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '4',
    name: 'Smart Contract Auditor',
    description: 'Automated smart contract security analysis',
    category: 'Security',
    status: 'offline',
    earnings: 123.45,
    tasks: 45,
    rating: 4.7,
    uptime: '97.1%',
    lastActivity: '3 hours ago',
    color: 'from-red-500 to-orange-500'
  }
]

export function MyAgents() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)

  const toggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const newStatus = agent.status === 'active' ? 'paused' : 'active'
        return { ...agent, status: newStatus }
      }
      return agent
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'offline':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My Agents</h2>
        <Button
          asChild
          className="bg-primary-500 hover:bg-primary-600 text-white"
        >
          <Link href="/dashboard/agents/create">
            Create New Agent
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <NeuralCard>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center`}>
                      <div className="text-2xl">🤖</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-400">{agent.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(agent.status)}`}>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {agent.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      ${agent.earnings}
                    </div>
                    <div className="text-xs text-gray-400">Total Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{agent.tasks}</div>
                    <div className="text-xs text-gray-400">Tasks Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {agent.rating}
                    </div>
                    <div className="text-xs text-gray-400">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{agent.uptime}</div>
                    <div className="text-xs text-gray-400">Uptime</div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <Clock className="w-4 h-4" />
                  <span>Last activity: {agent.lastActivity}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleAgentStatus(agent.id)}
                    variant={agent.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    className={
                      agent.status === 'active'
                        ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }
                  >
                    {agent.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    )}
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </NeuralCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
