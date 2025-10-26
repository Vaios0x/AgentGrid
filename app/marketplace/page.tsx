import { AgentGrid } from '@/components/marketplace/agent-grid'
import { AgentFilters } from '@/components/marketplace/agent-filters'
import { SearchBar } from '@/components/marketplace/search-bar'
import { AgentStats } from '@/components/marketplace/agent-stats'

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            AI Agent Marketplace
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover and hire verified AI agents for any task. Each agent has on-chain reputation and proven capabilities.
          </p>
        </div>

        {/* Stats */}
        <AgentStats />

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchBar />
          <AgentFilters />
        </div>

        {/* Agent Grid */}
        <AgentGrid />
      </div>
    </div>
  )
}
