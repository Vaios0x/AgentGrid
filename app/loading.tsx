import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="glassmorphism rounded-2xl p-8 neural-border">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <Loader2 className="w-16 h-16 text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading AgentGrid</h2>
          <p className="text-gray-300">Preparing your decentralized AI workforce...</p>
        </div>
      </div>
    </div>
  )
}
