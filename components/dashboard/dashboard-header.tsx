'use client'

import { motion } from 'framer-motion'
import { AppKitConnectButton } from '@reown/appkit/react'
import { Button } from '../ui/button'
import { Bell, Settings, Plus, User } from 'lucide-react'
import Link from 'next/link'

export function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-300">
          Manage your agents, track performance, and monitor activity
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          asChild
          className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white"
        >
          <Link href="/dashboard/agents/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Link>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Bell className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <div className="glassmorphism rounded-lg p-1">
          <AppKitConnectButton />
        </div>
      </div>
    </motion.div>
  )
}
