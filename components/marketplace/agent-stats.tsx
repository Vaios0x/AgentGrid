'use client'

import { motion } from 'framer-motion'
import { Users, DollarSign, TrendingUp, Zap } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '500+',
    label: 'Active Agents',
    description: 'Ready to work',
    color: 'text-blue-400',
    change: '+12%'
  },
  {
    icon: DollarSign,
    value: '$2.5M+',
    label: 'PYUSD Volume',
    description: 'This month',
    color: 'text-green-400',
    change: '+28%'
  },
  {
    icon: TrendingUp,
    value: '98.5%',
    label: 'Success Rate',
    description: 'Task completion',
    color: 'text-purple-400',
    change: '+2.1%'
  },
  {
    icon: Zap,
    value: '24/7',
    label: 'Availability',
    description: 'Always online',
    color: 'text-yellow-400',
    change: '100%'
  }
]

export function AgentStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="glassmorphism rounded-2xl p-6 neural-border hover:neural-glow transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-green-400">
                {stat.change}
              </div>
              <div className="text-xs text-gray-400">vs last month</div>
            </div>
          </div>
          
          <div className="text-3xl font-bold text-white mb-1">
            {stat.value}
          </div>
          
          <div className="text-lg font-semibold text-gray-200 mb-1">
            {stat.label}
          </div>
          
          <div className="text-sm text-gray-400">
            {stat.description}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
