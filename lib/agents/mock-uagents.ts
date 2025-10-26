// Mock implementation of uAgents for development
// This replaces the actual uagents package that wasn't available

export interface Agent {
  name: string
  seed: string
  port: number
  endpoint: string[]
  run(): Promise<void>
  on_message(messageType: any, handler: Function): void
  on_interval(period: number, handler: Function): void
  include(protocol: any, options?: any): void
  send(target: string, message: any): Promise<void>
}

export interface Context {
  logger: {
    info: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
  }
  send: (target: string, message: any) => Promise<void>
}

export interface Model {
  // Base model interface
}

export interface Protocol {
  name: string
}

export function Agent(config: {
  name: string
  seed: string
  port: number
  endpoint: string[]
}): Agent {
  return {
    name: config.name,
    seed: config.seed,
    port: config.port,
    endpoint: config.endpoint,
    
    async run() {
      console.log(`Starting agent ${this.name} on port ${this.port}`)
    },
    
    on_message(messageType: any, handler: Function) {
      console.log(`Registered message handler for ${this.name}`)
    },
    
    on_interval(period: number, handler: Function) {
      console.log(`Registered interval handler for ${this.name} (${period}s)`)
    },
    
    include(protocol: any, options?: any) {
      console.log(`Included protocol ${protocol.name} for ${this.name}`)
    },
    
    async send(target: string, message: any) {
      console.log(`Sending message from ${this.name} to ${target}`)
    }
  }
}

export function Protocol(name: string): Protocol {
  return { name }
}

// Mock context for testing
export function createMockContext(): Context {
  return {
    logger: {
      info: (message: string) => console.log(`[INFO] ${message}`),
      error: (message: string) => console.error(`[ERROR] ${message}`),
      warning: (message: string) => console.warn(`[WARNING] ${message}`)
    },
    send: async (target: string, message: any) => {
      console.log(`[MOCK] Sending message to ${target}:`, message)
    }
  }
}
