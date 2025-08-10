// ============================================================================
// @steam-bot/isomorphic - Isomorphic Package for Steam Multichat
// ============================================================================

// Re-export domain models
export * from './domain/models'
export type {
  Bot,
  BotId,
  BotStatus,
  Task,
  TaskId,
  TaskStatus,
  Chat,
  ChatId,
  Message,
  MessageId,
  MessageFrom,
  EventId,
  AppState,
  SystemState,
  RoundRobinState,
  RateLimitInfo,
  ExtractId,
  EntityLookup,
  EntityCollection,
  OptionalFields,
  RequiredFields
} from './domain/models'

// Re-export event meta
export * from './events/meta'
export type {
  EventMeta,
  WireAction,
  EventAggregate,
  AggregateEventKinds,
  ExtractAggregate,
  EventType,
  EventPayload
} from './events/meta'

// Re-export event schemas
export * from './events/schemas'
export type {
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
  DomainEvent,
  EventBatch,
  EventKind
} from './events/schemas'

// Re-export event creators
export * from './events/creators'
export {
  events,
  createEventAction,
  createSnapshot,
  botConnected,
  botDisconnected,
  botAuthFailed,
  taskCreated,
  taskAssigned,
  taskStatusChanged,
  friendInviteSent,
  friendInviteAccepted,
  friendInviteFailed,
  chatStarted,
  chatMessageReceived,
  chatMessageSent,
  chatAgentToggled,
  dialogScriptAdvanced,
  dialogScriptCompleted,
  errorLogged,
  batchEvents,
  filterEventsByType,
  mapEventPayloads,
  sortEventsByTimestamp,
  groupEventsByAggregate,
  getEventsForAggregateId
} from './events/creators'

// Re-export command schemas
export * from './commands/schemas'
export type {
  Command,
  CommandType,
  CommandResponse,
  CommandSuccessResponse,
  CommandErrorResponse,
  AddBotFromMaFileCommand,
  RemoveBotCommand,
  CreateTaskCommand,
  DisposeTaskCommand,
  ToggleAgentCommand,
  SendMessageCommand
} from './commands/schemas'

export {
  commands,
  addBotFromMaFile,
  removeBot,
  createTask,
  disposeTask,
  toggleAgent,
  sendMessage,
  validateCommand,
  validateCommandResponse,
  createSuccessResponse,
  createErrorResponse,
  mapCommandResult
} from './commands/schemas'

// Re-export utilities
export * from './utils/typeid'
export {
  TypeIDPrefixes,
  generateBotId,
  generateTaskId,
  generateChatId,
  generateMessageId,
  generateEventId,
  parseTypeId,
  validateBotId,
  validateTaskId,
  validateChatId,
  validateMessageId,
  validateEventId,
  extractPrefix,
  extractTimestamp,
  generateBotIds,
  generateTaskIds,
  generateChatIds,
  createIdMapping,
  extractIds,
  filterByIdPrefix,
  formatIdForDisplay,
  createCompositeId,
  createIdCollection,
  idCollectionContains,
  mergeIdCollections
} from './utils/typeid'

export * from './utils/sse'
export type {
  SSEMessage,
  SSESnapshot,
  SSEBatch,
  SSEPing,
  SSEMessageType,
  ParsedSSEMessage,
  SSEConnectionState,
  SSEConnection,
  ReconnectionStrategy,
  SSEHeaders
} from './utils/sse'

export {
  createSSESnapshot,
  createSSEBatch,
  createSSEPing,
  isSSESnapshot,
  isSSEBatch,
  isSSEPing,
  formatSSEMessage,
  formatSSEMessageWithRetry,
  parseSSEMessage,
  EventBuffer,
  createInitialSSEConnection,
  transitionSSEConnection,
  setSSEError,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  setLastEventId,
  defaultReconnectionStrategy,
  calculateReconnectDelay,
  shouldReconnect,
  createSSEHeaders
} from './utils/sse'

export * from './utils/reducers'
export type {
  Reducer,
  EventReducer
} from './utils/reducers'

export {
  rootReducer,
  createInitialAppState,
  updateEntity,
  updateBot,
  updateTask,
  updateChat,
  addEntity,
  removeEntity,
  combineReducers,
  applyReducerMiddleware,
  withLogging,
  createTimeTravelReducer
} from './utils/reducers'

// ============================================================================
// Type Aliases for Convenience
// ============================================================================

import { DomainEvent as DomainEventType } from './events/schemas'
import { AppState as AppStateType } from './domain/models'

export type Action = DomainEventType
export type State = AppStateType

// ============================================================================
// Constants
// ============================================================================

export const SCHEMA_VERSION = 1 as const
export const DEFAULT_BATCH_INTERVAL = 100 as const // ms
export const DEFAULT_RATE_LIMIT_PER_BOT = 60000 as const // 1 minute in ms
export const DEFAULT_DIALOG_STEPS = 5 as const

// ============================================================================
// Configuration Types
// ============================================================================

export type IsomorphicConfig = {
  readonly schemaVersion: typeof SCHEMA_VERSION
  readonly batchInterval: number
  readonly rateLimitPerBot: number
  readonly dialogSteps: number
  readonly enableLogging: boolean
}

export const defaultConfig: IsomorphicConfig = {
  schemaVersion: SCHEMA_VERSION,
  batchInterval: DEFAULT_BATCH_INTERVAL,
  rateLimitPerBot: DEFAULT_RATE_LIMIT_PER_BOT,
  dialogSteps: DEFAULT_DIALOG_STEPS,
  enableLogging: false
}

// ============================================================================
// Version and Package Info
// ============================================================================

export const packageInfo = {
  name: '@steam-bot/isomorphic',
  version: '0.1.0',
  description: 'Isomorphic package for Steam Multichat with AI Agents'
} as const
