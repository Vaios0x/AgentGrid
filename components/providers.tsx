'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitProvider } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'viem'
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia, polygonAmoy } from '@reown/appkit/networks'
import { createConfig } from 'wagmi'
import { useState } from 'react'

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '38f9af2d652c00cd381f783b22b0b91a'

const networks = [sepolia, arbitrumSepolia, optimismSepolia, baseSepolia, polygonAmoy]

const wagmiConfig = createConfig({
  chains: networks as any,
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [baseSepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },
})

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
})

const metadata = {
  name: 'AgentGrid',
  description: 'Decentralized AI Workforce Marketplace',
  url: 'https://agentgrid.io',
  icons: ['https://agentgrid.io/icon.png'],
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider
          adapters={[wagmiAdapter as any]}
          networks={networks as any}
          projectId={projectId}
          metadata={metadata}
        >
          {children}
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}