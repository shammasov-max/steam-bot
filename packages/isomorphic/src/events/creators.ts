import { pipe } from 'effect'
import * as R from 'ramda'
import {
  BotId,
  TaskId,
  ChatId,
  TaskStatus,
  AppState,
  MessageFrom
} from '../domain/models'
import {
  EventMeta,
  EventAggregate,
  WireAction,
  createEventMeta,
  ExtractAggregate,
  EventId
} from './meta'
import {
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
  ErrorLoggedEvent,
  DomainEvent
} from './schemas'

// ============================================================================
// Event Creator Factory using Generics and Higher-Order Functions
// ============================================================================

export type EventCreatorOptions = {
  causationId?: EventId
  correlationId?: string
  aggregateId?: string
}

export type EventCreator<T extends DomainEvent> = (
  payload: T['payload'],
  options?: EventCreatorOptions
) => T

// Generic event creator factory with type inference
export const createEventAction = <
  TKind extends DomainEvent['type'],
  TEvent extends Extract<DomainEvent, { type: TKind }>
>(
  kind: TKind,
  inferAggregate: ExtractAggregate<TKind> extends never ? EventAggregate : ExtractAggregate<TKind>
): EventCreator<TEvent> => {
  const aggregate = inferAggregate as EventAggregate
  
  return (payload: TEvent['payload'], options?: EventCreatorOptions): TEvent => {
    const meta = createEventMeta(
      kind,
      aggregate,
      options?.aggregateId,
      options?.causationId,
      options?.correlationId
    )
    
    return {
      type: kind,
      payload,
      meta
    } as TEvent
  }
}

// ============================================================================
// System Event Creators
// ============================================================================

export const createSnapshot = createEventAction<'snapshot', SnapshotEvent>(
  'snapshot',
  'system'
)

// ============================================================================
// Bot Event Creators
// ============================================================================

export const botConnected = createEventAction<'bot.connected', BotConnectedEvent>(
  'bot.connected',
  'bot'
)

export const botDisconnected = createEventAction<'bot.disconnected', BotDisconnectedEvent>(
  'bot.disconnected',
  'bot'
)

export const botAuthFailed = createEventAction<'bot.authFailed', BotAuthFailedEvent>(
  'bot.authFailed',
  'bot'
)

// ============================================================================
// Task Event Creators
// ============================================================================

export const taskCreated = createEventAction<'task.created', TaskCreatedEvent>(
  'task.created',
  'task'
)

export const taskAssigned = createEventAction<'task.assigned', TaskAssignedEvent>(
  'task.assigned',
  'task'
)

export const taskStatusChanged = createEventAction<'task.statusChanged', TaskStatusChangedEvent>(
  'task.statusChanged',
  'task'
)

// ============================================================================
// Friend Invite Event Creators
// ============================================================================

export const friendInviteSent = createEventAction<'friendInvite.sent', FriendInviteSentEvent>(
  'friendInvite.sent',
  'friendInvite'
)

export const friendInviteAccepted = createEventAction<'friendInvite.accepted', FriendInviteAcceptedEvent>(
  'friendInvite.accepted',
  'friendInvite'
)

export const friendInviteFailed = createEventAction<'friendInvite.failed', FriendInviteFailedEvent>(
  'friendInvite.failed',
  'friendInvite'
)

// ============================================================================
// Chat Event Creators
// ============================================================================

export const chatStarted = createEventAction<'chat.started', ChatStartedEvent>(
  'chat.started',
  'chat'
)

export const chatMessageReceived = createEventAction<'chat.messageReceived', ChatMessageReceivedEvent>(
  'chat.messageReceived',
  'chat'
)

export const chatMessageSent = createEventAction<'chat.messageSent', ChatMessageSentEvent>(
  'chat.messageSent',
  'chat'
)

export const chatAgentToggled = createEventAction<'chat.agentToggled', ChatAgentToggledEvent>(
  'chat.agentToggled',
  'chat'
)

// ============================================================================
// Dialog Script Event Creators
// ============================================================================

export const dialogScriptAdvanced = createEventAction<'dialogScript.advanced', DialogScriptAdvancedEvent>(
  'dialogScript.advanced',
  'dialogScript'
)

export const dialogScriptCompleted = createEventAction<'dialogScript.completed', DialogScriptCompletedEvent>(
  'dialogScript.completed',
  'dialogScript'
)

// ============================================================================
// Error Event Creators
// ============================================================================

export const errorLogged = createEventAction<'error.logged', ErrorLoggedEvent>(
  'error.logged',
  'error'
)

// ============================================================================
// Event Creator Collection (for easy access)
// ============================================================================

export const events = {
  // System
  createSnapshot,
  
  // Bot
  botConnected,
  botDisconnected,
  botAuthFailed,
  
  // Task
  taskCreated,
  taskAssigned,
  taskStatusChanged,
  
  // Friend Invite
  friendInviteSent,
  friendInviteAccepted,
  friendInviteFailed,
  
  // Chat
  chatStarted,
  chatMessageReceived,
  chatMessageSent,
  chatAgentToggled,
  
  // Dialog Script
  dialogScriptAdvanced,
  dialogScriptCompleted,
  
  // Error
  errorLogged
} as const

// ============================================================================
// Utility Functions using FP-TS and Ramda
// ============================================================================

// Create a pipeline of events
export const createEventPipeline = R.pipe

// Batch events together
export const batchEvents = (events: DomainEvent[]): { events: DomainEvent[] } => ({
  events
})

// Filter events by type using currying
export const filterEventsByType = R.curry(
  <T extends DomainEvent['type']>(
    eventType: T,
    events: DomainEvent[]
  ): Extract<DomainEvent, { type: T }>[] =>
    events.filter((e): e is Extract<DomainEvent, { type: T }> => 
      e.type === eventType
    )
)

// Map event payloads
export const mapEventPayloads = <T extends DomainEvent>(
  transform: (payload: T['payload']) => T['payload']
) => R.map(
  R.over(R.lensProp<T, 'payload'>('payload'), transform)
)

// Sort events by timestamp
export const sortEventsByTimestamp = R.sortBy<DomainEvent>(
  (event: DomainEvent) => event.meta.ts
)

// Group events by aggregate
export const groupEventsByAggregate = R.groupBy<DomainEvent>(
  (event: DomainEvent) => event.meta.aggregate
)

// Get events for specific aggregate ID
export const getEventsForAggregateId = R.curry(
  (aggregateId: string, events: DomainEvent[]) =>
    events.filter(e => e.meta.aggregateId === aggregateId)
)
