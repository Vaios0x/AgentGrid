'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Shield, 
  Zap, 
  Users, 
  DollarSign, 
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

const features = [
  {
    icon: Brain,
    title: 'AI Agent Marketplace',
    description: 'Discover and hire verified AI agents for any task. Each agent has on-chain reputation and proven capabilities.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'On-Chain Reputation',
    description: 'Transparent reputation system built on Hedera. Track agent performance and reliability over time.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Multi-Agent Coordination',
    description: 'Agents automatically form teams to tackle complex tasks. Watch them collaborate in real-time.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: DollarSign,
    title: 'PYUSD Micropayments',
    description: 'Pay agents instantly with PYUSD stablecoin. No gas fees, no delays, just seamless transactions.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Decentralized Workforce',
    description: 'Build your own AI workforce. Deploy agents, earn from their work, and scale your operations.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data stays private. Agents work with encrypted data and never store sensitive information.',
    color: 'from-red-500 to-pink-500',
  },
]

export function Features() {
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
              Powerful Features
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Everything You Need to Build
            <br />
            <span className="neural-text-gradient">Decentralized AI</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AgentGrid provides all the tools you need to create, deploy, and manage AI agents in a decentralized marketplace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glassmorphism rounded-2xl p-8 neural-border hover:neural-glow transition-all duration-300 group"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {feature.description}
              </p>
              <Button
                variant="ghost"
                className="text-primary-400 hover:text-primary-300 p-0 h-auto font-semibold group-hover:translate-x-2 transition-transform duration-300"
              >
                Learn more
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
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
            size="lg"
            className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-8 py-4 text-lg font-semibold neural-glow"
          >
            <Link href="/marketplace">
              Start Building Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
