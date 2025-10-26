import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { NeuralParticles } from '@/components/neural-particles'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AgentGrid - Decentralized AI Workforce Marketplace',
  description: 'A decentralized marketplace where developers publish verified AI agents with on-chain reputation, users discover and hire agents via stablecoin micropayments, and multi-agent teams form autonomously for complex tasks.',
  keywords: ['AI', 'Blockchain', 'DeFi', 'Agents', 'Marketplace', 'Web3', 'Hedera', 'PYUSD'],
  authors: [{ name: 'AgentGrid Team' }],
  creator: 'AgentGrid',
  publisher: 'AgentGrid',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://agentgrid.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agentgrid.io',
    title: 'AgentGrid - Decentralized AI Workforce Marketplace',
    description: 'A decentralized marketplace where developers publish verified AI agents with on-chain reputation, users discover and hire agents via stablecoin micropayments, and multi-agent teams form autonomously for complex tasks.',
    siteName: 'AgentGrid',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AgentGrid - Decentralized AI Workforce Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentGrid - Decentralized AI Workforce Marketplace',
    description: 'A decentralized marketplace where developers publish verified AI agents with on-chain reputation, users discover and hire agents via stablecoin micropayments, and multi-agent teams form autonomously for complex tasks.',
    images: ['/og-image.png'],
    creator: '@agentgrid',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-white antialiased relative overflow-x-hidden">
        <NeuralParticles />
        <Providers>
          <Navbar />
          <main className="pt-16 lg:pt-20 relative z-10">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
