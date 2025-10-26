import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { AgentShowcase } from '@/components/agent-showcase'
import { Stats } from '@/components/stats'
import { CTA } from '@/components/cta'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <AgentShowcase />
      <CTA />
    </main>
  )
}
