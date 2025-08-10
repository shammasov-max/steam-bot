import { pipe } from 'effect'
import * as R from 'ramda'
import { DomainEvent, EventBatch } from '../events/schemas'
import { AppState } from '../domain/models'

// ============================================================================
// SSE Message Types
// ============================================================================

export type SSEMessageType = 'snapshot' | 'batch' | 'ping'

export type SSESnapshot = {
  readonly type: 'snapshot'
  readonly data: AppState
  readonly timestamp: number
}

export type SSEBatch = {
  readonly type: 'batch'  
  readonly data: DomainEvent[]
  readonly timestamp: number
}

export type SSEPing = {
  readonly type: 'ping'
  readonly timestamp: number
}

export type SSEMessage = SSESnapshot | SSEBatch | SSEPing

// ============================================================================
// SSE Message Creation
// ============================================================================

export const createSSESnapshot = (state: AppState): SSESnapshot => ({
  type: 'snapshot',
  data: state,
  timestamp: Date.now()
})

export const createSSEBatch = (events: DomainEvent[]): SSEBatch => ({
  type: 'batch',
  data: events,
  timestamp: Date.now()
})

export const createSSEPing = (): SSEPing => ({
  type: 'ping',
  timestamp: Date.now()
})

// ============================================================================
// SSE Message Type Guards
// ============================================================================

export const isSSESnapshot = (msg: SSEMessage): msg is SSESnapshot =>
  msg.type === 'snapshot'

export const isSSEBatch = (msg: SSEMessage): msg is SSEBatch =>
  msg.type === 'batch'

export const isSSEPing = (msg: SSEMessage): msg is SSEPing =>
  msg.type === 'ping'

// ============================================================================
// SSE Formatting for Wire Protocol
// ============================================================================

export const formatSSEMessage = (message: SSEMessage): string => {
  switch (message.type) {
    case 'snapshot':
      return `event: snapshot\ndata: ${JSON.stringify(message.data)}\n\n`
    case 'batch':
      return `event: batch\ndata: ${JSON.stringify({ events: message.data })}\n\n`
    case 'ping':
      return `:ping ${message.timestamp}\n\n`
  }
}

// Format with retry hint
export const formatSSEMessageWithRetry = R.curry(
  (retryMs: number, message: SSEMessage): string =>
    `retry: ${retryMs}\n${formatSSEMessage(message)}`
)

// ============================================================================
// SSE Parsing
// ============================================================================

export type ParsedSSEMessage = {
  readonly event?: string
  readonly data?: string
  readonly id?: string
  readonly retry?: number
}

export const parseSSEMessage = (raw: string): ParsedSSEMessage | null => {
  const lines = raw.trim().split('\n')
  let event: string | undefined
  let data: string | undefined
  let id: string | undefined
  let retry: number | undefined
  
  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      data = line.slice(5).trim()
    } else if (line.startsWith('id:')) {
      id = line.slice(3).trim()
    } else if (line.startsWith('retry:')) {
      retry = parseInt(line.slice(6).trim(), 10)
    }
  }
  
  const hasAnyValue = event !== undefined || data !== undefined || id !== undefined || retry !== undefined
  
  if (!hasAnyValue) return null
  
  const result: any = {}
  if (event !== undefined) result.event = event
  if (data !== undefined) result.data = data
  if (id !== undefined) result.id = id
  if (retry !== undefined) result.retry = retry
  
  return result as ParsedSSEMessage
}

// ============================================================================
// SSE Stream Processing Utilities
// ============================================================================

// Buffer events for batching
export class EventBuffer {
  private buffer: DomainEvent[] = []
  private timer: NodeJS.Timeout | null = null
  
  constructor(
    private readonly flushInterval: number,
    private readonly onFlush: (events: DomainEvent[]) => void
  ) {}
  
  add = (event: DomainEvent): void => {
    this.buffer.push(event)
    
    if (!this.timer) {
      this.timer = setTimeout(this.flush, this.flushInterval)
    }
  }
  
  flush = (): void => {
    if (this.buffer.length > 0) {
      const events = [...this.buffer]
      this.buffer = []
      this.onFlush(events)
    }
    
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
  
  clear = (): void => {
    this.buffer = []
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

// ============================================================================
// SSE Connection State Management
// ============================================================================

export type SSEConnectionState = 
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error'

export type SSEConnection = {
  readonly state: SSEConnectionState
  readonly lastEventId?: string
  readonly reconnectAttempts: number
  readonly error?: Error
}

export const createInitialSSEConnection = (): SSEConnection => ({
  state: 'connecting',
  reconnectAttempts: 0
})

// State transition functions
export const transitionSSEConnection = R.curry(
  (newState: SSEConnectionState, connection: SSEConnection): SSEConnection => {
    const base = {
      ...connection,
      state: newState
    }
    
    if (newState !== 'error') {
      delete (base as any).error
    }
    
    return base
  }
)

export const setSSEError = R.curry(
  (error: Error, connection: SSEConnection): SSEConnection => ({
    ...connection,
    state: 'error',
    error
  })
)

export const incrementReconnectAttempts = (connection: SSEConnection): SSEConnection => ({
  ...connection,
  reconnectAttempts: connection.reconnectAttempts + 1
})

export const resetReconnectAttempts = (connection: SSEConnection): SSEConnection => ({
  ...connection,
  reconnectAttempts: 0
})

export const setLastEventId = R.curry(
  (eventId: string, connection: SSEConnection): SSEConnection => ({
    ...connection,
    lastEventId: eventId
  })
)

// ============================================================================
// Reconnection Strategy
// ============================================================================

export type ReconnectionStrategy = {
  readonly maxAttempts: number
  readonly baseDelay: number
  readonly maxDelay: number
  readonly backoffMultiplier: number
}

export const defaultReconnectionStrategy: ReconnectionStrategy = {
  maxAttempts: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2
}

export const calculateReconnectDelay = (
  attempts: number,
  strategy: ReconnectionStrategy
): number => {
  const delay = strategy.baseDelay * Math.pow(strategy.backoffMultiplier, attempts)
  return Math.min(delay, strategy.maxDelay)
}

export const shouldReconnect = (
  connection: SSEConnection,
  strategy: ReconnectionStrategy
): boolean =>
  connection.reconnectAttempts < strategy.maxAttempts

// ============================================================================
// SSE Headers Configuration
// ============================================================================

export type SSEHeaders = {
  readonly 'Content-Type': 'text/event-stream'
  readonly 'Cache-Control': string
  readonly 'Connection': 'keep-alive'
  readonly 'X-Accel-Buffering'?: 'no'
}

export const createSSEHeaders = (
  noCache = true,
  additionalHeaders?: Record<string, string>
): SSEHeaders => ({
  'Content-Type': 'text/event-stream',
  'Cache-Control': noCache ? 'no-cache, no-transform' : 'no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
  ...additionalHeaders
})
