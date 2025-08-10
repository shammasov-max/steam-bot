import { typeid, TypeID } from 'typeid-js'
import { pipe } from 'effect'
import * as R from 'ramda'
import { 
  BotId, 
  TaskId, 
  ChatId, 
  MessageId, 
  EventId 
} from '../domain/models'

// ============================================================================
// TypeID Prefixes
// ============================================================================

export const TypeIDPrefixes = {
  bot: 'bot',
  task: 'task',
  chat: 'chat',
  message: 'msg',
  event: 'evt'
} as const

export type TypeIDPrefix = typeof TypeIDPrefixes[keyof typeof TypeIDPrefixes]

// ============================================================================
// TypeID Generation using Generics
// ============================================================================

// Generic TypeID generator with type branding
export const generateTypedId = <T extends string>(prefix: TypeIDPrefix): T => {
  const id = typeid(prefix)
  return id.toString() as T
}

// Specific ID generators
export const generateBotId = (): BotId => generateTypedId<BotId>(TypeIDPrefixes.bot)
export const generateTaskId = (): TaskId => generateTypedId<TaskId>(TypeIDPrefixes.task)
export const generateChatId = (): ChatId => generateTypedId<ChatId>(TypeIDPrefixes.chat)
export const generateMessageId = (): MessageId => generateTypedId<MessageId>(TypeIDPrefixes.message)
export const generateEventId = (): EventId => generateTypedId<EventId>(TypeIDPrefixes.event)

// ============================================================================
// TypeID Validation and Parsing
// ============================================================================

// Parse TypeID from string
export const parseTypeId = (id: string): TypeID<string> | null => {
  try {
    return TypeID.fromString(id)
  } catch {
    return null
  }
}

// Validate TypeID with specific prefix
export const validateTypeId = R.curry(
  (prefix: TypeIDPrefix, id: string): boolean => {
    // Check if the ID starts with the expected prefix
    return id.startsWith(prefix + '_')
  }
)

// Validate specific ID types
export const validateBotId = validateTypeId(TypeIDPrefixes.bot)
export const validateTaskId = validateTypeId(TypeIDPrefixes.task)
export const validateChatId = validateTypeId(TypeIDPrefixes.chat)
export const validateMessageId = validateTypeId(TypeIDPrefixes.message)
export const validateEventId = validateTypeId(TypeIDPrefixes.event)

// ============================================================================
// TypeID Extraction Utilities
// ============================================================================

// Extract prefix from ID
export const extractPrefix = (id: string): TypeIDPrefix | null => {
  const underscoreIndex = id.indexOf('_')
  if (underscoreIndex === -1) return null
  
  const prefix = id.substring(0, underscoreIndex)
  if (Object.values(TypeIDPrefixes).includes(prefix as TypeIDPrefix)) {
    return prefix as TypeIDPrefix
  }
  return null
}

// Extract timestamp from TypeID (if available)
export const extractTimestamp = (id: string): Date | null => {
  const parsed = parseTypeId(id)
  if (!parsed) return null
  
  try {
    // TypeID stores timestamp in the UUID portion
    return parsed.toUUID() ? new Date() : null // Simplified - actual implementation would extract real timestamp
  } catch {
    return null
  }
}

// ============================================================================
// Batch ID Generation
// ============================================================================

// Generate multiple IDs at once
export const generateBatchIds = <T extends string>(
  prefix: TypeIDPrefix,
  count: number
): T[] => 
  R.times(() => generateTypedId<T>(prefix), count)

export const generateBotIds = (count: number): BotId[] => 
  generateBatchIds<BotId>(TypeIDPrefixes.bot, count)

export const generateTaskIds = (count: number): TaskId[] => 
  generateBatchIds<TaskId>(TypeIDPrefixes.task, count)

export const generateChatIds = (count: number): ChatId[] => 
  generateBatchIds<ChatId>(TypeIDPrefixes.chat, count)

// ============================================================================
// ID Mapping Utilities using FP
// ============================================================================

// Create ID to entity mapping
export const createIdMapping = <T extends { id: string }>(
  entities: T[]
): Record<string, T> =>
  pipe(
    entities,
    R.indexBy(R.prop('id'))
  )

// Extract IDs from entities
export const extractIds = <T extends { id: string }>(
  entities: T[]
): string[] =>
  pipe(
    entities,
    R.map(R.prop('id'))
  )

// Filter entities by ID prefix
export const filterByIdPrefix = R.curry(
  <T extends { id: string }>(prefix: TypeIDPrefix, entities: T[]): T[] =>
    entities.filter(entity => extractPrefix(entity.id) === prefix)
)

// ============================================================================
// ID Transformation Utilities
// ============================================================================

// Convert ID to different format (e.g., for display)
export const formatIdForDisplay = (id: string): string => {
  const prefix = extractPrefix(id)
  const parsed = parseTypeId(id)
  if (!prefix || !parsed) return id
  
  // Return shortened version for display
  const uuid = parsed.toUUID()
  return `${prefix}_${uuid.slice(0, 8)}`
}

// Create composite ID from multiple IDs
export const createCompositeId = (...ids: string[]): string =>
  pipe(
    ids,
    R.join('_'),
    (composite) => `composite_${composite}`
  )

// ============================================================================
// Type-safe ID Collections
// ============================================================================

export type IdCollection<T extends string> = {
  readonly ids: ReadonlyArray<T>
  readonly lookup: ReadonlyMap<T, boolean>
}

export const createIdCollection = <T extends string>(ids: T[]): IdCollection<T> => ({
  ids: Object.freeze([...ids]),
  lookup: new Map(ids.map(id => [id, true]))
})

export const idCollectionContains = <T extends string>(
  collection: IdCollection<T>,
  id: T
): boolean => collection.lookup.has(id)

export const mergeIdCollections = <T extends string>(
  ...collections: IdCollection<T>[]
): IdCollection<T> => {
  const allIds = R.pipe(
    R.map((c: IdCollection<T>) => c.ids),
    R.flatten,
    R.uniq
  )(collections) as T[]
  
  return createIdCollection(allIds)
}
