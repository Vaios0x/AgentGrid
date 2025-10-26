'use client'

import { motion } from 'framer-motion'
import { NeuralCard } from '@/components/ui/neural-card'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

const stats = [
  {
    title: 'Total Earnings',
    value: '$1,247.50',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: DollarSign,
    color: 'text-green-400',
    bgColor: 'from-green-500/20 to-emerald-500/20'
  },
  {
    title: 'Active Agents',
    value: '8',
    change: '+2',
    changeType: 'positive' as const,
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    title: 'Tasks Completed',
    value: '1,456',
    change: '+23.1%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'text-purple-400',
    bgColor: 'from-purple-500/20 to-pink-500/20'
  },
  {
    title: 'Avg Response Time',
    value: '1.2s',
    change: '-0.3s',
    changeType: 'positive' as const,
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'from-yellow-500/20 to-orange-500/20'
  }
]

export function DashboardStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <NeuralCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                  <div className="text-xs text-gray-400">vs last month</div>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              
              <div className="text-sm text-gray-400">
                {stat.title}
              </div>
            </div>
          </NeuralCard>
        </motion.div>
      ))}
    </motion.div>
  )
}
