import { LitNodeClient } from '@lit-protocol/lit-node-client-nodejs'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import { ethers } from 'ethers'

export interface VincentConfig {
  litNetwork: string
  privateKey: string
  rpcUrl: string
}

export interface AgentWallet {
  agentId: string
  address: string
  publicKey: string
  encryptedPrivateKey: string
  accessControlConditions: any[]
  spendingLimits: SpendingLimits
}

export interface SpendingLimits {
  dailyLimit: number
  transactionLimit: number
  allowedTokens: string[]
  allowedRecipients: string[]
}

export class VincentAgentWallet {
  private litNodeClient: LitNodeClient
  private litContracts: LitContracts
  private provider: ethers.JsonRpcProvider
  private config: VincentConfig
  private isInitialized = false

  constructor(config: VincentConfig) {
    this.config = config
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl)
  }

  async initialize() {
    if (this.isInitialized) return

    this.litNodeClient = new LitNodeClient({
      litNetwork: this.config.litNetwork,
      debug: false,
    })

    await this.litNodeClient.connect()

    const wallet = new ethers.Wallet(this.config.privateKey, this.provider)
    this.litContracts = new LitContracts({
      signer: wallet,
      network: this.config.litNetwork,
    })

    this.isInitialized = true
  }

  async createAgentWallet(
    agentId: string, 
    spendingLimits: SpendingLimits
  ): Promise<AgentWallet> {
    await this.initialize()

    const authSig = await this.getAuthSig()
    
    // Define access control conditions for the agent
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':agentId'],
        returnValueTest: {
          comparator: '=',
          value: agentId
        }
      }
    ]

    // Generate a new wallet for the agent
    const agentWallet = ethers.Wallet.createRandom()
    const agentAddress = agentWallet.address
    const agentPublicKey = agentWallet.publicKey

    // Encrypt the private key with Lit Protocol
    const { encryptedString, symmetricKey } = await this.litNodeClient.encryptString(
      agentWallet.privateKey,
      {
        accessControlConditions,
        authSig,
        chain: 'ethereum'
      }
    )

    // Store the encrypted private key and access control conditions
    const encryptedPrivateKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      authSig,
      chain: 'ethereum',
      encryptedSymmetricKey: symmetricKey,
      symmetricKeyMetadata: {
        name: `Agent-${agentId}-Wallet`,
        description: `Encrypted wallet for agent ${agentId}`,
      }
    })

    return {
      agentId,
      address: agentAddress,
      publicKey: agentPublicKey,
      encryptedPrivateKey: encryptedString,
      accessControlConditions,
      spendingLimits
    }
  }

  async getAgentWallet(agentId: string): Promise<AgentWallet | null> {
    await this.initialize()

    try {
      // In a real implementation, this would retrieve from a database
      // For now, we'll return null to indicate wallet not found
      return null
    } catch (error) {
      console.error('Error retrieving agent wallet:', error)
      return null
    }
  }

  async executeTransaction(
    agentId: string,
    transaction: {
      to: string
      value?: string
      data?: string
      gasLimit?: number
    }
  ): Promise<string> {
    await this.initialize()

    const agentWallet = await this.getAgentWallet(agentId)
    if (!agentWallet) {
      throw new Error(`Agent wallet not found for agent ${agentId}`)
    }

    // Check spending limits
    await this.validateSpendingLimits(agentWallet, transaction)

    // Get the agent's private key
    const authSig = await this.getAuthSig()
    const decryptedPrivateKey = await this.litNodeClient.decryptString(
      agentWallet.encryptedPrivateKey,
      {
        accessControlConditions: agentWallet.accessControlConditions,
        authSig,
        chain: 'ethereum'
      }
    )

    // Create wallet instance with decrypted private key
    const wallet = new ethers.Wallet(decryptedPrivateKey, this.provider)

    // Estimate gas if not provided
    let gasLimit = transaction.gasLimit
    if (!gasLimit) {
      gasLimit = await wallet.estimateGas({
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : 0,
        data: transaction.data
      })
    }

    // Create and send transaction
    const tx = await wallet.sendTransaction({
      to: transaction.to,
      value: transaction.value ? ethers.parseEther(transaction.value) : 0,
      data: transaction.data,
      gasLimit
    })

    return tx.hash
  }

  private async validateSpendingLimits(
    agentWallet: AgentWallet,
    transaction: any
  ): Promise<void> {
    const { spendingLimits } = agentWallet

    // Check daily limit
    const today = new Date().toISOString().split('T')[0]
    const dailySpent = await this.getDailySpent(agentWallet.agentId, today)
    
    if (dailySpent + parseFloat(transaction.value || '0') > spendingLimits.dailyLimit) {
      throw new Error('Daily spending limit exceeded')
    }

    // Check transaction limit
    if (parseFloat(transaction.value || '0') > spendingLimits.transactionLimit) {
      throw new Error('Transaction limit exceeded')
    }

    // Check allowed recipients
    if (spendingLimits.allowedRecipients.length > 0 && 
        !spendingLimits.allowedRecipients.includes(transaction.to)) {
      throw new Error('Recipient not in allowed list')
    }
  }

  private async getDailySpent(agentId: string, date: string): Promise<number> {
    // In a real implementation, this would query a database
    // For now, return 0
    return 0
  }

  private async getAuthSig() {
    // In a real implementation, this would get the auth signature from the user
    // For now, we'll create a mock signature
    return {
      sig: '0x' + '0'.repeat(130),
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: 'Sign this message to authenticate with Lit Protocol',
      address: '0x' + '0'.repeat(40)
    }
  }

  async getAgentBalance(agentId: string): Promise<string> {
    await this.initialize()

    const agentWallet = await this.getAgentWallet(agentId)
    if (!agentWallet) {
      throw new Error(`Agent wallet not found for agent ${agentId}`)
    }

    const balance = await this.provider.getBalance(agentWallet.address)
    return ethers.formatEther(balance)
  }

  async transferFromAgent(
    agentId: string,
    to: string,
    amount: string
  ): Promise<string> {
    return await this.executeTransaction(agentId, {
      to,
      value: amount
    })
  }
}

// Default configuration
export const vincentConfig: VincentConfig = {
  litNetwork: process.env.LIT_NETWORK || 'datil-test',
  privateKey: process.env.LIT_PRIVATE_KEY || '',
  rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com'
}

export const vincentService = new VincentAgentWallet(vincentConfig)
