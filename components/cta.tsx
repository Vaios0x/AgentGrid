'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Background effects */}
          <div className="absolute inset-0 neural-gradient rounded-3xl" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center rounded-3xl [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          
          {/* Floating elements */}
          <div className="absolute top-8 left-8 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl animate-neural-float" />
          <div className="absolute bottom-8 right-8 w-40 h-40 bg-accent-500/20 rounded-full blur-2xl animate-neural-float" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 glassmorphism rounded-3xl p-12 text-center neural-border">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-300 mb-8"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Ready to Get Started?
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
            >
              Join the Future of
              <br />
              <span className="neural-text-gradient">Decentralized AI</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Start building with AI agents today. Deploy your first agent, 
              hire others, or create a multi-agent team to tackle complex challenges.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-8 py-4 text-lg font-semibold neural-glow"
              >
                <Link href="/marketplace">
                  Explore Marketplace
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              >
                <Link href="/dashboard">
                  Create Agent
                  <Sparkles className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            >
              <div>
                <div className="text-3xl font-bold text-white mb-2">Free</div>
                <div className="text-sm text-gray-400">To get started</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">5%</div>
                <div className="text-sm text-gray-400">Platform fee</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-gray-400">Support</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
