'use client'

import { motion } from 'framer-motion'
import { NeuralCard } from '@/components/ui/neural-card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Wallet,
  Zap,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    title: 'Create Agent',
    description: 'Deploy a new AI agent',
    icon: Plus,
    href: '/dashboard/agents/create',
    color: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-400'
  },
  {
    title: 'Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-400'
  },
  {
    title: 'Wallet',
    description: 'Manage your wallet',
    icon: Wallet,
    href: '/dashboard/wallet',
    color: 'from-green-500 to-emerald-500',
    textColor: 'text-green-400'
  },
  {
    title: 'Settings',
    description: 'Configure preferences',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'from-gray-500 to-slate-500',
    textColor: 'text-gray-400'
  }
]

const marketInsights = [
  {
    title: 'Top Performing Agent',
    value: 'Portfolio Manager Pro',
    change: '+23.5%',
    icon: TrendingUp,
    color: 'text-green-400'
  },
  {
    title: 'Total Revenue',
    value: '$1,247.50',
    change: '+12.1%',
    icon: DollarSign,
    color: 'text-blue-400'
  },
  {
    title: 'Active Users',
    value: '2,456',
    change: '+8.3%',
    icon: Users,
    color: 'text-purple-400'
  }
]

export function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <NeuralCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start p-4 h-auto hover:bg-white/10"
                  >
                    <Link href={action.href}>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} mr-3`}>
                        <action.icon className={`w-4 h-4 ${action.textColor}`} />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">{action.title}</div>
                        <div className="text-xs text-gray-400">{action.description}</div>
                      </div>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </NeuralCard>
      </motion.div>

      {/* Market Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <NeuralCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Market Insights</h3>
            <div className="space-y-4">
              {marketInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/10`}>
                      <insight.icon className={`w-4 h-4 ${insight.color}`} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">{insight.title}</div>
                      <div className="text-white font-semibold">{insight.value}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${insight.color}`}>
                    {insight.change}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </NeuralCard>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <NeuralCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Performance Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Success Rate</span>
                <span className="text-white font-semibold">98.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Avg Response Time</span>
                <span className="text-white font-semibold">1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Uptime</span>
                <span className="text-white font-semibold">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Customer Rating</span>
                <span className="text-white font-semibold">4.9/5</span>
              </div>
            </div>
          </div>
        </NeuralCard>
      </motion.div>
    </div>
  )
}
