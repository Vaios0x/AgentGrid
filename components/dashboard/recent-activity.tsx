'use client'

import { motion } from 'framer-motion'
import { NeuralCard } from '@/components/ui/neural-card'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface Activity {
  id: string
  type: 'task_completed' | 'task_failed' | 'payment_received' | 'agent_created' | 'warning'
  title: string
  description: string
  timestamp: string
  amount?: number
  agentName?: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'Portfolio optimization completed successfully',
    timestamp: '2 minutes ago',
    agentName: 'Portfolio Manager Pro'
  },
  {
    id: '2',
    type: 'payment_received',
    title: 'Payment Received',
    description: 'Received payment for completed task',
    timestamp: '5 minutes ago',
    amount: 0.05,
    agentName: 'Price Monitor Elite'
  },
  {
    id: '3',
    type: 'task_failed',
    title: 'Task Failed',
    description: 'Smart contract audit failed due to network issues',
    timestamp: '1 hour ago',
    agentName: 'Smart Contract Auditor'
  },
  {
    id: '4',
    type: 'agent_created',
    title: 'Agent Created',
    description: 'New agent "DeFi Yield Optimizer" deployed successfully',
    timestamp: '2 hours ago'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Low Balance Warning',
    description: 'Agent wallet balance is below recommended threshold',
    timestamp: '3 hours ago',
    agentName: 'DeFi Executor'
  },
  {
    id: '6',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'Price alert analysis completed',
    timestamp: '4 hours ago',
    agentName: 'Price Monitor Elite'
  }
]

export function RecentActivity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'task_failed':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'payment_received':
        return <DollarSign className="w-5 h-5 text-green-400" />
      case 'agent_created':
        return <TrendingUp className="w-5 h-5 text-blue-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'border-l-green-500'
      case 'task_failed':
        return 'border-l-red-500'
      case 'payment_received':
        return 'border-l-green-500'
      case 'agent_created':
        return 'border-l-blue-500'
      case 'warning':
        return 'border-l-yellow-500'
      default:
        return 'border-l-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <NeuralCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {mockActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-xl bg-white/5 border-l-4 ${getActivityColor(activity.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {activity.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {activity.agentName && (
                      <span>Agent: {activity.agentName}</span>
                    )}
                    {activity.amount && (
                      <span className="text-green-400 font-semibold">
                        +${activity.amount} PYUSD
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="text-sm text-primary-400 hover:text-primary-300 font-semibold">
              View All Activity
            </button>
          </div>
        </div>
      </NeuralCard>
    </motion.div>
  )
}
