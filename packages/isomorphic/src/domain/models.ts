import { Schema } from 'effect'
import * as R from 'ramda'

// ============================================================================
// Domain Status Enums
// ============================================================================

export const BotStatus = Schema.Literal(
  'connecting',
  'connected', 
  'disconnected',
  'authFailed'
)
export type BotStatus = Schema.Schema.Type<typeof BotStatus>

export const TaskStatus = Schema.Literal(
  'created',
  'assigned',
  'invited',
  'accepted',
  'failed',
  'disposed',
  'resolved'
)
export type TaskStatus = Schema.Schema.Type<typeof TaskStatus>

export const MessageFrom = Schema.Literal('bot', 'player')
export type MessageFrom = Schema.Schema.Type<typeof MessageFrom>

// ============================================================================
// ID Types with Tagged Template Literals
// ============================================================================

export type BotId = `bot_${string}`
export type TaskId = `task_${string}`
export type ChatId = `chat_${string}`
export type MessageId = `msg_${string}`
export type EventId = `evt_${string}`

// Schema validators for IDs
export const BotIdSchema = Schema.TemplateLiteral(Schema.Literal('bot_'), Schema.String)
export const TaskIdSchema = Schema.TemplateLiteral(Schema.Literal('task_'), Schema.String)
export const ChatIdSchema = Schema.TemplateLiteral(Schema.Literal('chat_'), Schema.String)
export const MessageIdSchema = Schema.TemplateLiteral(Schema.Literal('msg_'), Schema.String)
export const EventIdSchema = Schema.TemplateLiteral(Schema.Literal('evt_'), Schema.String)

// ============================================================================
// Domain Models
// ============================================================================

export const Bot = Schema.Struct({
  id: BotIdSchema,
  steamId64: Schema.String,
  label: Schema.optional(Schema.String),
  proxyUrl: Schema.String,
  status: BotStatus,
  lastSeen: Schema.optional(Schema.Number)
})
export type Bot = Schema.Schema.Type<typeof Bot>

export const Task = Schema.Struct({
  id: TaskIdSchema,
  playerSteamId64: Schema.String,
  item: Schema.String,
  priceMin: Schema.Number,
  priceMax: Schema.Number,
  status: TaskStatus,
  assignedBotId: Schema.optional(BotIdSchema)
})
export type Task = Schema.Schema.Type<typeof Task>

export const Message = Schema.Struct({
  id: MessageIdSchema,
  from: MessageFrom,
  text: Schema.String,
  ts: Schema.Number
})
export type Message = Schema.Schema.Type<typeof Message>

export const Chat = Schema.Struct({
  id: ChatIdSchema,
  botId: BotIdSchema,
  playerSteamId64: Schema.String,
  agentEnabled: Schema.Boolean,
  messages: Schema.Array(Message),
  scriptStep: Schema.optional(Schema.Number)
})
export type Chat = Schema.Schema.Type<typeof Chat>

export const RateLimitInfo = Schema.Struct({
  lastInviteAt: Schema.optional(Schema.Number)
})
export type RateLimitInfo = Schema.Schema.Type<typeof RateLimitInfo>

export const RoundRobinState = Schema.Struct({
  pointer: Schema.Number,
  eligibleBotIds: Schema.Array(BotIdSchema)
})
export type RoundRobinState = Schema.Schema.Type<typeof RoundRobinState>

export const SystemState = Schema.Struct({
  roundRobin: RoundRobinState,
  rateLimits: Schema.Record({ key: BotIdSchema, value: RateLimitInfo })
})
export type SystemState = Schema.Schema.Type<typeof SystemState>

// ============================================================================
// Application State
// ============================================================================

export const AppState = Schema.Struct({
  bots: Schema.Record({ key: BotIdSchema, value: Bot }),
  tasks: Schema.Record({ key: TaskIdSchema, value: Task }),
  chats: Schema.Record({ key: ChatIdSchema, value: Chat }),
  system: SystemState
})
export type AppState = Schema.Schema.Type<typeof AppState>

// ============================================================================
// Utility Types using Advanced TypeScript Features
// ============================================================================

// Extract ID type from entity type
export type ExtractId<T> = T extends { id: infer ID } ? ID : never

// Create lookup type for entities
export type EntityLookup<TId extends string, TEntity> = Record<TId, TEntity>

// Mapped type for entity collections
export type EntityCollection<T extends { id: string }> = {
  [K in T['id']]: T
}

// Conditional type for optional fields
export type OptionalFields<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]: T[K]
}

// Required fields only
export type RequiredFields<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K]
}

// Type predicate creators using generics
export const createIdPredicate = <T extends string>(prefix: string) =>
  (id: unknown): id is T => 
    typeof id === 'string' && id.startsWith(prefix)

export const isBotId = createIdPredicate<BotId>('bot_')
export const isTaskId = createIdPredicate<TaskId>('task_')
export const isChatId = createIdPredicate<ChatId>('chat_')
export const isMessageId = createIdPredicate<MessageId>('msg_')
export const isEventId = createIdPredicate<EventId>('evt_')

// Lens creators for nested state updates (using ramda)
export const createStateLens = <K extends keyof AppState>(key: K) =>
  R.lensProp<AppState, K>(key)

export const botsLens = createStateLens('bots')
export const tasksLens = createStateLens('tasks')
export const chatsLens = createStateLens('chats')
export const systemLens = createStateLens('system')
