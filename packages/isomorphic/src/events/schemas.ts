import { Schema } from 'effect'
import { pipe } from 'effect'
import * as R from 'ramda'
import {
  BotId,
  BotIdSchema,
  TaskId,
  TaskIdSchema,
  ChatId,
  ChatIdSchema,
  TaskStatus,
  AppState,
  MessageFrom
} from '../domain/models'
import { createEventSchema, WireAction } from './meta'

// ============================================================================
// System Events
// ============================================================================

export const SnapshotPayload = Schema.Struct({
  state: AppState
})

export const SnapshotEvent = createEventSchema('snapshot', SnapshotPayload)
export type SnapshotEvent = Schema.Schema.Type<typeof SnapshotEvent>

// ============================================================================
// Bot Events
// ============================================================================

export const BotConnectedPayload = Schema.Struct({
  botId: BotIdSchema
})

export const BotConnectedEvent = createEventSchema('bot.connected', BotConnectedPayload)
export type BotConnectedEvent = Schema.Schema.Type<typeof BotConnectedEvent>

export const BotDisconnectedPayload = Schema.Struct({
  botId: BotIdSchema
})

export const BotDisconnectedEvent = createEventSchema('bot.disconnected', BotDisconnectedPayload)
export type BotDisconnectedEvent = Schema.Schema.Type<typeof BotDisconnectedEvent>

export const BotAuthFailedPayload = Schema.Struct({
  botId: BotIdSchema,
  reason: Schema.String
})

export const BotAuthFailedEvent = createEventSchema('bot.authFailed', BotAuthFailedPayload)
export type BotAuthFailedEvent = Schema.Schema.Type<typeof BotAuthFailedEvent>

// ============================================================================
// Task Events
// ============================================================================

export const TaskCreatedPayload = Schema.Struct({
  taskId: TaskIdSchema,
  playerSteamId64: Schema.String,
  item: Schema.String,
  priceMin: Schema.Number,
  priceMax: Schema.Number
})

export const TaskCreatedEvent = createEventSchema('task.created', TaskCreatedPayload)
export type TaskCreatedEvent = Schema.Schema.Type<typeof TaskCreatedEvent>

export const TaskAssignedPayload = Schema.Struct({
  taskId: TaskIdSchema,
  botId: BotIdSchema
})

export const TaskAssignedEvent = createEventSchema('task.assigned', TaskAssignedPayload)
export type TaskAssignedEvent = Schema.Schema.Type<typeof TaskAssignedEvent>

export const TaskStatusChangedPayload = Schema.Struct({
  taskId: TaskIdSchema,
  status: TaskStatus
})

export const TaskStatusChangedEvent = createEventSchema('task.statusChanged', TaskStatusChangedPayload)
export type TaskStatusChangedEvent = Schema.Schema.Type<typeof TaskStatusChangedEvent>

// ============================================================================
// Friend Invite Events
// ============================================================================

export const FriendInviteSentPayload = Schema.Struct({
  botId: BotIdSchema,
  playerSteamId64: Schema.String
})

export const FriendInviteSentEvent = createEventSchema('friendInvite.sent', FriendInviteSentPayload)
export type FriendInviteSentEvent = Schema.Schema.Type<typeof FriendInviteSentEvent>

export const FriendInviteAcceptedPayload = Schema.Struct({
  botId: BotIdSchema,
  playerSteamId64: Schema.String
})

export const FriendInviteAcceptedEvent = createEventSchema('friendInvite.accepted', FriendInviteAcceptedPayload)
export type FriendInviteAcceptedEvent = Schema.Schema.Type<typeof FriendInviteAcceptedEvent>

export const FriendInviteFailedPayload = Schema.Struct({
  botId: BotIdSchema,
  playerSteamId64: Schema.String,
  reason: Schema.String
})

export const FriendInviteFailedEvent = createEventSchema('friendInvite.failed', FriendInviteFailedPayload)
export type FriendInviteFailedEvent = Schema.Schema.Type<typeof FriendInviteFailedEvent>

// ============================================================================
// Chat Events
// ============================================================================

export const ChatStartedPayload = Schema.Struct({
  chatId: ChatIdSchema,
  botId: BotIdSchema,
  playerSteamId64: Schema.String
})

export const ChatStartedEvent = createEventSchema('chat.started', ChatStartedPayload)
export type ChatStartedEvent = Schema.Schema.Type<typeof ChatStartedEvent>

export const ChatMessageReceivedPayload = Schema.Struct({
  chatId: ChatIdSchema,
  from: MessageFrom,
  text: Schema.String
})

export const ChatMessageReceivedEvent = createEventSchema('chat.messageReceived', ChatMessageReceivedPayload)
export type ChatMessageReceivedEvent = Schema.Schema.Type<typeof ChatMessageReceivedEvent>

export const ChatMessageSentPayload = Schema.Struct({
  chatId: ChatIdSchema,
  text: Schema.String
})

export const ChatMessageSentEvent = createEventSchema('chat.messageSent', ChatMessageSentPayload)
export type ChatMessageSentEvent = Schema.Schema.Type<typeof ChatMessageSentEvent>

export const ChatAgentToggledPayload = Schema.Struct({
  chatId: ChatIdSchema,
  enabled: Schema.Boolean
})

export const ChatAgentToggledEvent = createEventSchema('chat.agentToggled', ChatAgentToggledPayload)
export type ChatAgentToggledEvent = Schema.Schema.Type<typeof ChatAgentToggledEvent>

// ============================================================================
// Dialog Script Events
// ============================================================================

export const DialogScriptAdvancedPayload = Schema.Struct({
  chatId: ChatIdSchema,
  step: Schema.Number
})

export const DialogScriptAdvancedEvent = createEventSchema('dialogScript.advanced', DialogScriptAdvancedPayload)
export type DialogScriptAdvancedEvent = Schema.Schema.Type<typeof DialogScriptAdvancedEvent>

export const DialogScriptCompletedPayload = Schema.Struct({
  chatId: ChatIdSchema
})

export const DialogScriptCompletedEvent = createEventSchema('dialogScript.completed', DialogScriptCompletedPayload)
export type DialogScriptCompletedEvent = Schema.Schema.Type<typeof DialogScriptCompletedEvent>

// ============================================================================
// Error Events
// ============================================================================

export const ErrorLoggedPayload = Schema.Struct({
  message: Schema.String,
  context: Schema.optional(Schema.Unknown)
})

export const ErrorLoggedEvent = createEventSchema('error.logged', ErrorLoggedPayload)
export type ErrorLoggedEvent = Schema.Schema.Type<typeof ErrorLoggedEvent>

// ============================================================================
// Event Union Type
// ============================================================================

export type DomainEvent =
  | SnapshotEvent
  | BotConnectedEvent
  | BotDisconnectedEvent
  | BotAuthFailedEvent
  | TaskCreatedEvent
  | TaskAssignedEvent
  | TaskStatusChangedEvent
  | FriendInviteSentEvent
  | FriendInviteAcceptedEvent
  | FriendInviteFailedEvent
  | ChatStartedEvent
  | ChatMessageReceivedEvent
  | ChatMessageSentEvent
  | ChatAgentToggledEvent
  | DialogScriptAdvancedEvent
  | DialogScriptCompletedEvent
  | ErrorLoggedEvent

// Union schema for validation
export const DomainEventSchema = Schema.Union(
  SnapshotEvent,
  BotConnectedEvent,
  BotDisconnectedEvent,
  BotAuthFailedEvent,
  TaskCreatedEvent,
  TaskAssignedEvent,
  TaskStatusChangedEvent,
  FriendInviteSentEvent,
  FriendInviteAcceptedEvent,
  FriendInviteFailedEvent,
  ChatStartedEvent,
  ChatMessageReceivedEvent,
  ChatMessageSentEvent,
  ChatAgentToggledEvent,
  DialogScriptAdvancedEvent,
  DialogScriptCompletedEvent,
  ErrorLoggedEvent
)

// ============================================================================
// Event Batch for SSE
// ============================================================================

export const EventBatch = Schema.Struct({
  events: Schema.Array(DomainEventSchema)
})
export type EventBatch = Schema.Schema.Type<typeof EventBatch>

// ============================================================================
// Type Guards using Conditional Types
// ============================================================================

export type EventKind = DomainEvent['type']

export const createEventTypeGuard = <T extends DomainEvent>(eventType: T['type']) =>
  (event: unknown): event is T =>
    typeof event === 'object' && 
    event !== null && 
    'type' in event && 
    (event as any).type === eventType

// Generate type guards for all events
export const isSnapshotEvent = createEventTypeGuard<SnapshotEvent>('snapshot')
export const isBotConnectedEvent = createEventTypeGuard<BotConnectedEvent>('bot.connected')
export const isBotDisconnectedEvent = createEventTypeGuard<BotDisconnectedEvent>('bot.disconnected')
export const isBotAuthFailedEvent = createEventTypeGuard<BotAuthFailedEvent>('bot.authFailed')
export const isTaskCreatedEvent = createEventTypeGuard<TaskCreatedEvent>('task.created')
export const isTaskAssignedEvent = createEventTypeGuard<TaskAssignedEvent>('task.assigned')
export const isTaskStatusChangedEvent = createEventTypeGuard<TaskStatusChangedEvent>('task.statusChanged')
export const isFriendInviteSentEvent = createEventTypeGuard<FriendInviteSentEvent>('friendInvite.sent')
export const isFriendInviteAcceptedEvent = createEventTypeGuard<FriendInviteAcceptedEvent>('friendInvite.accepted')
export const isFriendInviteFailedEvent = createEventTypeGuard<FriendInviteFailedEvent>('friendInvite.failed')
export const isChatStartedEvent = createEventTypeGuard<ChatStartedEvent>('chat.started')
export const isChatMessageReceivedEvent = createEventTypeGuard<ChatMessageReceivedEvent>('chat.messageReceived')
export const isChatMessageSentEvent = createEventTypeGuard<ChatMessageSentEvent>('chat.messageSent')
export const isChatAgentToggledEvent = createEventTypeGuard<ChatAgentToggledEvent>('chat.agentToggled')
export const isDialogScriptAdvancedEvent = createEventTypeGuard<DialogScriptAdvancedEvent>('dialogScript.advanced')
export const isDialogScriptCompletedEvent = createEventTypeGuard<DialogScriptCompletedEvent>('dialogScript.completed')
export const isErrorLoggedEvent = createEventTypeGuard<ErrorLoggedEvent>('error.logged')
