import { Client, PrivateKey, AccountId, TokenId, AccountBalanceQuery } from '@hashgraph/sdk'
import { HederaAgentAPI, HederaLangchainToolkit, coreTokenPlugin, coreConsensusPlugin } from 'hedera-agent-kit'

export class HederaService {
  private client: Client
  private agentAPI: HederaAgentAPI
  private isInitialized = false

  constructor() {
    this.client = Client.forTestnet()
    this.agentAPI = new HederaAgentAPI({
      client: this.client,
      plugins: [coreTokenPlugin, coreConsensusPlugin]
    })
  }

  async initialize() {
    if (this.isInitialized) return

    const accountId = process.env.HEDERA_ACCOUNT_ID
    const privateKey = process.env.HEDERA_PRIVATE_KEY

    if (!accountId || !privateKey) {
      throw new Error('Hedera credentials not found in environment variables')
    }

    this.client.setOperator(
      AccountId.fromString(accountId),
      PrivateKey.fromString(privateKey)
    )

    this.isInitialized = true
  }

  async createAgentToken(agentId: string, supply: number) {
    await this.initialize()
    
    return await this.agentAPI.createToken({
      name: `Agent-${agentId}`,
      symbol: `AGT-${agentId}`,
      initialSupply: supply,
      decimals: 8
    })
  }

  async logAgentAction(agentId: string, action: string, metadata?: Record<string, any>) {
    await this.initialize()
    
    const topicId = process.env.HEDERA_TOPIC_ID
    if (!topicId) {
      throw new Error('Hedera topic ID not found in environment variables')
    }

    return await this.agentAPI.submitMessage({
      topicId,
      message: JSON.stringify({
        agentId,
        action,
        metadata,
        timestamp: Date.now()
      })
    })
  }

  async getAccountBalance(accountId: string) {
    await this.initialize()
    
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(this.client)

    return balance
  }

  async transferTokens(tokenId: string, from: string, to: string, amount: number) {
    await this.initialize()
    
    return await this.agentAPI.transferToken({
      tokenId: TokenId.fromString(tokenId),
      from: AccountId.fromString(from),
      to: AccountId.fromString(to),
      amount
    })
  }
}

export const hederaService = new HederaService()
