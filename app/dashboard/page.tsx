import { DashboardHeader } from '../../components/dashboard/dashboard-header'
import { DashboardStats } from '../../components/dashboard/dashboard-stats'
import { MyAgents } from '../../components/dashboard/my-agents'
import { RecentActivity } from '../../components/dashboard/recent-activity'
import { QuickActions } from '../../components/dashboard/quick-actions'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          <div className="lg:col-span-3">
            <DashboardStats />
            <MyAgents />
            <RecentActivity />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  )
}
