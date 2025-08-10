# @steam-bot/isomorphic

An isomorphic TypeScript package for Steam Multichat with AI Agents, designed to be used in both backend and frontend applications.

## Features

- **Domain Models**: Strongly-typed domain entities (Bot, Task, Chat, System)
- **Event System**: Redux-compatible event system with Effect Schema validation
- **Command Pattern**: Type-safe command definitions and validation
- **SSE Support**: Server-Sent Events utilities for real-time communication
- **State Management**: Redux-style reducers with functional programming patterns
- **TypeID Generation**: Type-safe ID generation with prefixes
- **Functional Programming**: Built with fp-ts, ramda, and Effect for composable, type-safe operations

## Installation

```bash
npm install @steam-bot/isomorphic
# or
yarn add @steam-bot/isomorphic
```

## Usage

### Domain Models

```typescript
import { Bot, Task, Chat, AppState } from '@steam-bot/isomorphic'

// Type-safe domain entities
const bot: Bot = {
  id: 'bot_123',
  steamId64: '76561198000000000',
  proxyUrl: 'http://proxy.example.com',
  status: 'connected',
  lastSeen: Date.now()
}
```

### Event System

```typescript
import { 
  events, 
  DomainEvent,
  botConnected,
  taskCreated 
} from '@steam-bot/isomorphic'

// Create events using factory functions
const connectEvent = botConnected({ 
  botId: 'bot_123' 
})

const taskEvent = taskCreated({
  taskId: 'task_456',
  playerSteamId64: '76561198000000001',
  item: 'AK-47 | Redline',
  priceMin: 10,
  priceMax: 20
})

// Events are Redux-compatible actions
// { type: 'bot.connected', payload: {...}, meta: {...} }
```

### Commands

```typescript
import { 
  commands,
  validateCommand,
  createSuccessResponse,
  createErrorResponse 
} from '@steam-bot/isomorphic'

// Create commands
const addBotCmd = commands.addBotFromMaFile({
  maFileJSON: '{"shared_secret":"..."}',
  proxyUrl: 'http://proxy.example.com',
  label: 'Bot 1'
})

// Validate commands
const validatedCommand = validateCommand(addBotCmd)

// Create responses
const success = createSuccessResponse()
const error = createErrorResponse('Bot authentication failed')
```

### State Management

```typescript
import { 
  rootReducer,
  createInitialAppState,
  DomainEvent 
} from '@steam-bot/isomorphic'

// Initialize state
let state = createInitialAppState()

// Apply events to update state
const event: DomainEvent = botConnected({ botId: 'bot_123' })
state = rootReducer(state, event)
```

### Server-Sent Events (SSE)

```typescript
import { 
  EventBuffer,
  createSSESnapshot,
  createSSEBatch,
  formatSSEMessage 
} from '@steam-bot/isomorphic'

// Create SSE messages
const snapshot = createSSESnapshot(appState)
const batch = createSSEBatch(events)

// Format for wire protocol
const sseMessage = formatSSEMessage(snapshot)
// Output: "event: snapshot\ndata: {...}\n\n"

// Use EventBuffer for batching
const buffer = new EventBuffer(100, (events) => {
  const batch = createSSEBatch(events)
  sendToClients(formatSSEMessage(batch))
})

buffer.add(event1)
buffer.add(event2)
// Automatically flushes after 100ms
```

### TypeID Generation

```typescript
import { 
  generateBotId,
  generateTaskId,
  validateBotId,
  extractPrefix 
} from '@steam-bot/isomorphic'

// Generate type-safe IDs
const botId = generateBotId()     // 'bot_01h2x3y4z5...'
const taskId = generateTaskId()   // 'task_01h2x3y4z5...'

// Validate IDs
if (validateBotId(someId)) {
  // someId is a valid BotId
}

// Extract prefix
const prefix = extractPrefix(botId) // 'bot'
```

## Architecture

The package follows these architectural principles:

1. **Isomorphic Design**: All code runs in both Node.js and browser environments
2. **Functional Programming**: Uses fp-ts, ramda, and Effect for composability
3. **Type Safety**: Leverages TypeScript's advanced type system features
4. **Event Sourcing**: Events are the source of truth for state changes
5. **Redux Compatibility**: Events are Redux actions (action === event)
6. **Schema Validation**: Uses Effect Schema for runtime validation

## Type System Features

The package demonstrates advanced TypeScript features:

- **Tagged Template Literals**: `BotId = 'bot_${string}'`
- **Mapped Types**: Dynamic type generation based on other types
- **Conditional Types**: Type logic and inference
- **Generic Constraints**: Type-safe factory functions
- **Type Guards**: Runtime type checking with type narrowing
- **Branded Types**: Nominal typing for ID types

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run watch

# Clean build artifacts
npm run clean
```

## API Reference

### Domain Models
- `Bot`, `Task`, `Chat`, `Message`, `AppState`
- Status enums: `BotStatus`, `TaskStatus`
- ID types: `BotId`, `TaskId`, `ChatId`, `MessageId`, `EventId`

### Events
- Event creators: `botConnected`, `taskCreated`, etc.
- Event types: `DomainEvent`, `EventMeta`, `WireAction`
- Utilities: `batchEvents`, `filterEventsByType`, `sortEventsByTimestamp`

### Commands
- Command creators: `addBotFromMaFile`, `createTask`, etc.
- Command types: `Command`, `CommandResponse`
- Validation: `validateCommand`, `validateCommandResponse`

### Utilities
- TypeID: `generateBotId`, `validateBotId`, `extractPrefix`
- SSE: `EventBuffer`, `createSSESnapshot`, `formatSSEMessage`
- Reducers: `rootReducer`, `createInitialAppState`, `updateEntity`

## License

MIT
