/**
 * Example usage of @steam-bot/isomorphic package
 * This demonstrates how to use the package in both frontend and backend contexts
 */

import {
  // Domain models
  AppState,
  Bot,
  Task,
  Chat,
  
  // Events
  events,
  DomainEvent,
  batchEvents,
  filterEventsByType,
  
  // Commands
  commands,
  Command,
  validateCommand,
  createSuccessResponse,
  createErrorResponse,
  
  // State management
  rootReducer,
  createInitialAppState,
  
  // Utilities
  generateBotId,
  generateTaskId,
  generateChatId,
  EventBuffer,
  createSSESnapshot,
  createSSEBatch,
  formatSSEMessage,
  
  // Types
  BotId,
  TaskId,
  ChatId
} from '../src'

// ============================================================================
// Backend Usage Example
// ============================================================================

class BackendEventStore {
  private state: AppState = createInitialAppState()
  private eventBuffer: EventBuffer
  private subscribers: Set<(message: string) => void> = new Set()
  
  constructor() {
    // Setup event batching with 100ms interval
    this.eventBuffer = new EventBuffer(100, (events) => {
      this.broadcastBatch(events)
    })
  }
  
  // Handle incoming commands
  async handleCommand(command: Command): Promise<{ ok: boolean; error?: string }> {
    // Validate command
    const validated = validateCommand(command)
    if (!validated) {
      return createErrorResponse('Invalid command')
    }
    
    // Process command and emit events
    switch (command.type) {
      case 'AddBotFromMaFile': {
        const botId = generateBotId()
        
        // Simulate bot connection
        const event = events.botConnected({ botId })
        this.applyEvent(event)
        
        return createSuccessResponse()
      }
      
      case 'CreateTask': {
        const taskId = command.taskId || generateTaskId()
        
        const createEvent = events.taskCreated({
          taskId,
          playerSteamId64: command.playerSteamId64,
          item: command.item,
          priceMin: command.priceMin,
          priceMax: command.priceMax
        })
        
        this.applyEvent(createEvent)
        
        // Auto-assign to available bot
        const availableBots = Object.values(this.state.bots)
          .filter(bot => bot.status === 'connected')
        
        if (availableBots.length > 0) {
          const assignedBot = availableBots[0]!
          const assignEvent = events.taskAssigned({
            taskId,
            botId: assignedBot.id
          })
          this.applyEvent(assignEvent)
        }
        
        return createSuccessResponse()
      }
      
      case 'SendMessage': {
        const event = events.chatMessageSent({
          chatId: command.chatId,
          text: command.text
        })
        
        this.applyEvent(event)
        return createSuccessResponse()
      }
      
      default:
        return createErrorResponse('Command not implemented')
    }
  }
  
  // Apply event to state and broadcast
  private applyEvent(event: DomainEvent): void {
    // Update state
    this.state = rootReducer(this.state, event)
    
    // Buffer event for batching
    this.eventBuffer.add(event)
  }
  
  // Send initial snapshot to new SSE connection
  subscribeToEvents(callback: (message: string) => void): () => void {
    // Send initial snapshot
    const snapshot = createSSESnapshot(this.state)
    callback(formatSSEMessage(snapshot))
    
    // Add to subscribers
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }
  
  // Broadcast event batch to all subscribers
  private broadcastBatch(events: DomainEvent[]): void {
    const batch = createSSEBatch(events)
    const message = formatSSEMessage(batch)
    
    this.subscribers.forEach(callback => {
      callback(message)
    })
  }
  
  // Get current state
  getState(): AppState {
    return this.state
  }
}

// ============================================================================
// Frontend Usage Example (React/Redux)
// ============================================================================

import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'

// Redux slice using the isomorphic types
const appSlice = createSlice({
  name: 'app',
  initialState: createInitialAppState(),
  reducers: {
    // Handle SSE snapshot
    setSnapshot: (state, action: PayloadAction<AppState>) => {
      return action.payload
    },
    
    // Handle SSE event batch
    applyEvents: (state, action: PayloadAction<DomainEvent[]>) => {
      return action.payload.reduce(rootReducer, state)
    }
  }
})

// Frontend SSE client
class FrontendSSEClient {
  private eventSource: EventSource | null = null
  private store: any
  
  constructor(store: any) {
    this.store = store
  }
  
  connect(url: string): void {
    this.eventSource = new EventSource(url)
    
    // Handle snapshot
    this.eventSource.addEventListener('snapshot', (e) => {
      const state = JSON.parse(e.data) as AppState
      this.store.dispatch(appSlice.actions.setSnapshot(state))
    })
    
    // Handle event batches
    this.eventSource.addEventListener('batch', (e) => {
      const { events } = JSON.parse(e.data) as { events: DomainEvent[] }
      this.store.dispatch(appSlice.actions.applyEvents(events))
    })
    
    // Handle errors
    this.eventSource.onerror = () => {
      console.error('SSE connection error')
      this.reconnect(url)
    }
  }
  
  private reconnect(url: string): void {
    setTimeout(() => {
      this.connect(url)
    }, 5000)
  }
  
  disconnect(): void {
    this.eventSource?.close()
    this.eventSource = null
  }
  
  // Send command to backend
  async sendCommand(command: Command): Promise<void> {
    const response = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command)
    })
    
    const result = await response.json()
    if (!result.ok) {
      throw new Error(result.error)
    }
  }
}

// ============================================================================
// Functional Programming Examples
// ============================================================================

import * as R from 'ramda'
import { pipe } from 'effect'

// Example: Process events functionally
const processEventBatch = (events: DomainEvent[]): void => {
  // Filter bot events
  const botEvents = filterEventsByType('bot.connected', events)
  
  // Group events by aggregate
  const grouped = R.groupBy(
    (e: DomainEvent) => e.meta.aggregate,
    events
  )
  
  // Count events by type
  const eventCounts = pipe(
    events,
    R.groupBy((e: DomainEvent) => e.type),
    R.map(R.length)
  )
  
  console.log('Event counts:', eventCounts)
}

// Example: Transform commands functionally
const enhanceCommand = <T extends Command>(
  command: T,
  metadata: Record<string, unknown>
): T & { metadata: Record<string, unknown> } => ({
  ...command,
  metadata
})

// Example: Compose event creators
const createBotAndTask = (
  steamId64: string,
  item: string,
  priceRange: [number, number]
) => {
  const botId = generateBotId()
  const taskId = generateTaskId()
  
  return batchEvents([
    events.botConnected({ botId }),
    events.taskCreated({
      taskId,
      playerSteamId64: steamId64,
      item,
      priceMin: priceRange[0],
      priceMax: priceRange[1]
    }),
    events.taskAssigned({ taskId, botId })
  ])
}

// ============================================================================
// Usage Examples
// ============================================================================

// Backend usage
const backend = new BackendEventStore()

// Handle commands
backend.handleCommand(
  commands.createTask({
    playerSteamId64: '76561198000000001',
    item: 'AK-47 | Redline',
    priceMin: 10,
    priceMax: 20
  })
)

// Frontend usage
const store = configureStore({
  reducer: {
    app: appSlice.reducer
  }
})

const sseClient = new FrontendSSEClient(store)
sseClient.connect('/api/event-stream')

// Send command from frontend
sseClient.sendCommand(
  commands.toggleAgent({
    chatId: generateChatId(),
    enabled: true
  })
)

// Export for testing
export {
  BackendEventStore,
  FrontendSSEClient,
  processEventBatch,
  enhanceCommand,
  createBotAndTask
}
