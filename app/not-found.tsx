import { motion } from 'framer-motion'
import { Search, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="glassmorphism rounded-2xl p-8 neural-border">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Search className="w-10 h-10 text-primary-400" />
          </motion.div>
          
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Agent Not Found
          </h2>
          
          <p className="text-gray-300 mb-8">
            The AI agent you're looking for doesn't exist or has been removed from the marketplace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Link href="/marketplace">
                <Search className="w-4 h-4 mr-2" />
                Browse Agents
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
