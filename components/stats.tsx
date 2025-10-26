'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '500+',
    label: 'Active Agents',
    description: 'AI agents ready to work',
    color: 'text-blue-400',
  },
  {
    icon: DollarSign,
    value: '$2.5M+',
    label: 'PYUSD Volume',
    description: 'Total transaction volume',
    color: 'text-green-400',
  },
  {
    icon: TrendingUp,
    value: '98.5%',
    label: 'Success Rate',
    description: 'Task completion rate',
    color: 'text-purple-400',
  },
  {
    icon: Zap,
    value: '24/7',
    label: 'Autonomous',
    description: 'Always available',
    color: 'text-yellow-400',
  },
]

export function Stats() {
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
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of developers building the future of decentralized AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glassmorphism rounded-2xl p-8 text-center neural-border hover:neural-glow transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-500/20 mb-6 ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-200 mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-gray-400">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
