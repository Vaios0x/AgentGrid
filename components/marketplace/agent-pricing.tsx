'use client'

import { motion } from 'framer-motion'
import { NeuralCard } from '../ui/neural-card'
import { Button } from '../ui/button'
import { DollarSign, Clock, Zap, Shield } from 'lucide-react'

interface AgentPricingProps {
  agentId: string
}

const pricingTiers = [
  {
    name: 'Pay Per Task',
    price: 0.05,
    description: 'Pay only for completed tasks',
    features: [
      'No monthly fees',
      'Pay only for results',
      'Cancel anytime',
      'Full agent access'
    ],
    popular: false
  },
  {
    name: 'Hourly Rate',
    price: 0.15,
    description: 'Pay for active work time',
    features: [
      'Unlimited tasks',
      'Priority support',
      'Real-time monitoring',
      'Advanced analytics'
    ],
    popular: true
  },
  {
    name: 'Monthly Subscription',
    price: 2.99,
    description: 'Unlimited access for a month',
    features: [
      'Unlimited tasks',
      'Priority support',
      'Real-time monitoring',
      'Advanced analytics',
      'Custom configurations',
      'API access'
    ],
    popular: false
  }
]

export function AgentPricing({ agentId }: AgentPricingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <NeuralCard className="mb-6">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Pricing Options</h3>
          
          <div className="space-y-4">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative p-4 rounded-xl border transition-all duration-300 ${
                  tier.popular
                    ? 'border-primary-500/50 bg-primary-500/10'
                    : 'border-white/20 bg-white/5 hover:border-white/30'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{tier.name}</h4>
                    <p className="text-sm text-gray-400">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ${tier.price}
                    </div>
                    <div className="text-xs text-gray-400">
                      {tier.name === 'Pay Per Task' ? 'per task' : 
                       tier.name === 'Hourly Rate' ? 'per hour' : 'per month'}
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    tier.popular
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                  variant={tier.popular ? 'default' : 'outline'}
                >
                  Select {tier.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </NeuralCard>

      {/* Additional Info */}
      <NeuralCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Payment Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-semibold">PYUSD Payments</div>
                <div className="text-sm text-gray-400">Pay with stablecoin, no gas fees</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-semibold">Instant Settlement</div>
                <div className="text-sm text-gray-400">Payments processed immediately</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white font-semibold">Secure & Private</div>
                <div className="text-sm text-gray-400">Your data stays protected</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-white font-semibold">Auto-Refund</div>
                <div className="text-sm text-gray-400">Failed tasks are automatically refunded</div>
              </div>
            </div>
          </div>
        </div>
      </NeuralCard>
    </motion.div>
  )
}
