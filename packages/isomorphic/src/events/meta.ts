import { Schema } from 'effect'
import { pipe } from 'effect'
import * as R from 'ramda'
import { EventId, EventIdSchema } from '../domain/models'

// Re-export EventId
export type { EventId }

// ============================================================================
// Event Meta Schema
// ============================================================================

export const EventMeta = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  id: EventIdSchema,
  ts: Schema.Number,
  kind: Schema.String,
  aggregate: Schema.String,
  aggregateId: Schema.optional(Schema.String),
  causationId: Schema.optional(EventIdSchema),
  correlationId: Schema.optional(Schema.String)
})
export type EventMeta = Schema.Schema.Type<typeof EventMeta>

// ============================================================================
// Base Event Structure
// ============================================================================

export const createEventSchema = <
  TKind extends string,
  TPayload extends Schema.Schema.Any
>(
  kind: TKind,
  payloadSchema: TPayload
) => Schema.Struct({
  type: Schema.Literal(kind),
  payload: payloadSchema,
  meta: EventMeta
})

// Type helper for extracting event type
export type EventType<T extends { type: string }> = T['type']

// Type helper for extracting payload type
export type EventPayload<T extends { payload: unknown }> = T['payload']

// ============================================================================
// Event Action Type (Redux Compatible)
// ============================================================================

export type WireAction<
  TType extends string = string,
  TPayload = unknown
> = {
  readonly type: TType
  readonly payload: TPayload
  readonly meta: EventMeta
}

// Type guard for wire actions
export const isWireAction = (action: unknown): action is WireAction =>
  pipe(
    action,
    R.allPass([
      R.is(Object),
      R.has('type'),
      R.has('payload'),
      R.has('meta')
    ])
  )

// ============================================================================
// Event Aggregate Types
// ============================================================================

export const EventAggregate = Schema.Literal(
  'system',
  'bot',
  'task',
  'friendInvite',
  'chat',
  'dialogScript',
  'error'
)
export type EventAggregate = Schema.Schema.Type<typeof EventAggregate>

// Mapped type for aggregate-specific event kinds
export type AggregateEventKinds = {
  system: 'snapshot'
  bot: 'bot.connected' | 'bot.disconnected' | 'bot.authFailed'
  task: 'task.created' | 'task.assigned' | 'task.statusChanged'
  friendInvite: 'friendInvite.sent' | 'friendInvite.accepted' | 'friendInvite.failed'
  chat: 'chat.started' | 'chat.messageReceived' | 'chat.messageSent' | 'chat.agentToggled'
  dialogScript: 'dialogScript.advanced' | 'dialogScript.completed'
  error: 'error.logged'
}

// Type helper to extract aggregate from event kind
export type ExtractAggregate<TKind extends string> = 
  TKind extends `${infer Aggregate}.${string}` 
    ? Aggregate 
    : TKind extends 'snapshot' 
      ? 'system' 
      : never

// ============================================================================
// Meta Creation Utilities
// ============================================================================

export const createEventMeta = (
  kind: string,
  aggregate: EventAggregate,
  aggregateId?: string,
  causationId?: EventId,
  correlationId?: string
): EventMeta => ({
  schemaVersion: 1,
  id: `evt_${crypto.randomUUID()}` as EventId,
  ts: Date.now(),
  kind,
  aggregate,
  aggregateId,
  causationId,
  correlationId
})

// Curried version for partial application
export const createMetaFor = R.curry(
  (aggregate: EventAggregate, kind: string, aggregateId?: string): EventMeta =>
    createEventMeta(kind, aggregate, aggregateId)
)

// Lens for meta updates
export const metaLens = R.lensProp<WireAction, 'meta'>('meta')
export const metaTsLens = R.lensPath<WireAction, number>(['meta', 'ts'])
export const metaIdLens = R.lensPath<WireAction, EventId>(['meta', 'id'])
