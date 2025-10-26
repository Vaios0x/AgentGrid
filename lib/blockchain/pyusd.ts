import { ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers'

export interface PYUSDConfig {
  contractAddress: string
  decimals: number
  rpcUrl: string
}

export class PYUSDService {
  private provider: ethers.JsonRpcProvider
  private contract: ethers.Contract
  private config: PYUSDConfig

  constructor(config: PYUSDConfig) {
    this.config = config
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl)
    
    // PYUSD ERC-20 ABI (minimal)
    const abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function transferFrom(address from, address to, uint256 amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function totalSupply() view returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)'
    ]

    this.contract = new ethers.Contract(config.contractAddress, abi, this.provider)
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.contract.balanceOf(address)
    return formatUnits(balance, this.config.decimals)
  }

  async transfer(signer: ethers.Signer, to: string, amount: string): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer)
    const amountWei = parseUnits(amount, this.config.decimals)
    
    return await contractWithSigner.transfer(to, amountWei)
  }

  async transferFrom(signer: ethers.Signer, from: string, to: string, amount: string): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer)
    const amountWei = parseUnits(amount, this.config.decimals)
    
    return await contractWithSigner.transferFrom(from, to, amountWei)
  }

  async approve(signer: ethers.Signer, spender: string, amount: string): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer)
    const amountWei = parseUnits(amount, this.config.decimals)
    
    return await contractWithSigner.approve(spender, amountWei)
  }

  async getAllowance(owner: string, spender: string): Promise<string> {
    const allowance = await this.contract.allowance(owner, spender)
    return formatUnits(allowance, this.config.decimals)
  }

  async getTokenInfo() {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
      this.contract.decimals(),
      this.contract.totalSupply()
    ])

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: formatUnits(totalSupply, Number(decimals))
    }
  }

  // Utility methods
  formatAmount(amount: string): string {
    return formatUnits(amount, this.config.decimals)
  }

  parseAmount(amount: string): string {
    return parseUnits(amount, this.config.decimals).toString()
  }
}

// Default configuration
export const pyusdConfig: PYUSDConfig = {
  contractAddress: process.env.PYUSD_CONTRACT_ADDRESS || '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // Mainnet PYUSD
  decimals: parseInt(process.env.PYUSD_DECIMALS || '6'),
  rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com'
}

export const pyusdService = new PYUSDService(pyusdConfig)
