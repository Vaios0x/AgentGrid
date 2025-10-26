import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, optimism, base, polygon } from '@reown/appkit/networks'
import { createConfig } from 'wagmi'

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!

export const networks = [mainnet, arbitrum, optimism, base, polygon]

export const wagmiConfig = createConfig({
  chains: networks,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
})

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks,
  projectId,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
})

export const metadata = {
  name: 'AgentGrid',
  description: 'Decentralized AI Workforce Marketplace',
  url: 'https://agentgrid.io',
  icons: ['https://agentgrid.io/icon.png'],
}
