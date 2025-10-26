import { AgentDetail } from '@/components/marketplace/agent-detail'
import { AgentReviews } from '@/components/marketplace/agent-reviews'
import { AgentPricing } from '@/components/marketplace/agent-pricing'
import { HireAgent } from '@/components/marketplace/hire-agent'

interface AgentDetailPageProps {
  params: {
    agentId: string
  }
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <AgentDetail agentId={params.agentId} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <AgentReviews agentId={params.agentId} />
          </div>
          <div>
            <AgentPricing agentId={params.agentId} />
            <HireAgent agentId={params.agentId} />
          </div>
        </div>
      </div>
    </div>
  )
}
