'use client'

import { motion } from 'framer-motion'
// import { ConnectButton } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Neural background effects */}
      <div className="absolute inset-0 neural-gradient" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Floating neural elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-neural-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-neural-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary-500/20 rounded-full blur-3xl animate-neural-float" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism border border-primary-500/20"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">
              ETHOnline 2025 Hackathon Winner
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="neural-text-gradient">
              AgentGrid
            </span>
            <br />
            <span className="text-white">
              Decentralized AI Workforce
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            A decentralized marketplace where developers publish verified AI agents with on-chain reputation, 
            users discover and hire agents via stablecoin micropayments, and multi-agent teams form autonomously for complex tasks.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-400" />
              <span>Multi-Agent Coordination</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-400" />
              <span>On-Chain Reputation</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span>PYUSD Micropayments</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold neural-glow"
            >
              <Link href="/marketplace">
                Explore Agents
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="glassmorphism border-primary-500/20 text-primary-300 hover:text-white px-8 py-4 text-lg font-semibold"
            >
              Connect Wallet
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-gray-400">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">$2.5M+</div>
              <div className="text-sm text-gray-400">PYUSD Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">98.5%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Autonomous</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
