import { Schema } from 'effect'
import { pipe } from 'effect'
import * as R from 'ramda'
import { BotId, BotIdSchema, TaskId, TaskIdSchema, ChatId, ChatIdSchema } from '../domain/models'

// ============================================================================
// Command Response Types
// ============================================================================

export const CommandSuccessResponse = Schema.Struct({
  ok: Schema.Literal(true)
})
export type CommandSuccessResponse = Schema.Schema.Type<typeof CommandSuccessResponse>

export const CommandErrorResponse = Schema.Struct({
  ok: Schema.Literal(false),
  error: Schema.String
})
export type CommandErrorResponse = Schema.Schema.Type<typeof CommandErrorResponse>

export const CommandResponse = Schema.Union(CommandSuccessResponse, CommandErrorResponse)
export type CommandResponse = Schema.Schema.Type<typeof CommandResponse>

// ============================================================================
// Bot Commands
// ============================================================================

export const AddBotFromMaFileCommand = Schema.Struct({
  type: Schema.Literal('AddBotFromMaFile'),
  maFileJSON: Schema.String,
  proxyUrl: Schema.String,
  label: Schema.optional(Schema.String)
})
export type AddBotFromMaFileCommand = Schema.Schema.Type<typeof AddBotFromMaFileCommand>

export const RemoveBotCommand = Schema.Struct({
  type: Schema.Literal('RemoveBot'),
  botId: BotIdSchema
})
export type RemoveBotCommand = Schema.Schema.Type<typeof RemoveBotCommand>

// ============================================================================
// Task Commands
// ============================================================================

export const CreateTaskCommand = Schema.Struct({
  type: Schema.Literal('CreateTask'),
  taskId: Schema.optional(TaskIdSchema),
  playerSteamId64: Schema.String,
  item: Schema.String,
  priceMin: Schema.NonNegative,
  priceMax: Schema.NonNegative
})
export type CreateTaskCommand = Schema.Schema.Type<typeof CreateTaskCommand>

export const DisposeTaskCommand = Schema.Struct({
  type: Schema.Literal('DisposeTask'),
  taskId: TaskIdSchema,
  reason: Schema.optional(Schema.String)
})
export type DisposeTaskCommand = Schema.Schema.Type<typeof DisposeTaskCommand>

// ============================================================================
// Chat Commands
// ============================================================================

export const ToggleAgentCommand = Schema.Struct({
  type: Schema.Literal('ToggleAgent'),
  chatId: ChatIdSchema,
  enabled: Schema.Boolean
})
export type ToggleAgentCommand = Schema.Schema.Type<typeof ToggleAgentCommand>

export const SendMessageCommand = Schema.Struct({
  type: Schema.Literal('SendMessage'),
  chatId: ChatIdSchema,
  text: Schema.String
})
export type SendMessageCommand = Schema.Schema.Type<typeof SendMessageCommand>

// ============================================================================
// Command Union Type
// ============================================================================

export type Command =
  | AddBotFromMaFileCommand
  | RemoveBotCommand
  | CreateTaskCommand
  | DisposeTaskCommand
  | ToggleAgentCommand
  | SendMessageCommand

export const CommandSchema = Schema.Union(
  AddBotFromMaFileCommand,
  RemoveBotCommand,
  CreateTaskCommand,
  DisposeTaskCommand,
  ToggleAgentCommand,
  SendMessageCommand
)

// ============================================================================
// Command Type Guards using Conditional Types
// ============================================================================

export type CommandType = Command['type']

export const createCommandTypeGuard = <T extends Command>(commandType: T['type']) =>
  (command: unknown): command is T =>
    typeof command === 'object' && 
    command !== null && 
    'type' in command && 
    (command as any).type === commandType

export const isAddBotFromMaFileCommand = createCommandTypeGuard<AddBotFromMaFileCommand>('AddBotFromMaFile')
export const isRemoveBotCommand = createCommandTypeGuard<RemoveBotCommand>('RemoveBot')
export const isCreateTaskCommand = createCommandTypeGuard<CreateTaskCommand>('CreateTask')
export const isDisposeTaskCommand = createCommandTypeGuard<DisposeTaskCommand>('DisposeTask')
export const isToggleAgentCommand = createCommandTypeGuard<ToggleAgentCommand>('ToggleAgent')
export const isSendMessageCommand = createCommandTypeGuard<SendMessageCommand>('SendMessage')

// ============================================================================
// Command Validation Utilities
// ============================================================================

export const validateCommand = (command: unknown): Command | null => {
  const result = Schema.decodeUnknownEither(CommandSchema)(command)
  return result._tag === 'Right' ? result.right : null
}

export const validateCommandResponse = (response: unknown): CommandResponse | null => {
  const result = Schema.decodeUnknownEither(CommandResponse)(response)
  return result._tag === 'Right' ? result.right : null
}

// ============================================================================
// Command Factory Functions using Generics
// ============================================================================

type CommandFactory<T extends Command> = (
  params: Omit<T, 'type'>
) => T

export const createCommandFactory = <T extends Command>(
  type: T['type']
): CommandFactory<T> => 
  (params: Omit<T, 'type'>): T => ({
    type,
    ...params
  } as T)

// Command factory instances
export const addBotFromMaFile = createCommandFactory<AddBotFromMaFileCommand>('AddBotFromMaFile')
export const removeBot = createCommandFactory<RemoveBotCommand>('RemoveBot')
export const createTask = createCommandFactory<CreateTaskCommand>('CreateTask')
export const disposeTask = createCommandFactory<DisposeTaskCommand>('DisposeTask')
export const toggleAgent = createCommandFactory<ToggleAgentCommand>('ToggleAgent')
export const sendMessage = createCommandFactory<SendMessageCommand>('SendMessage')

// ============================================================================
// Command Collection
// ============================================================================

export const commands = {
  addBotFromMaFile,
  removeBot,
  createTask,
  disposeTask,
  toggleAgent,
  sendMessage
} as const

// ============================================================================
// Command Pipeline Utilities using FP
// ============================================================================

// Transform command before execution
export const transformCommand = <T extends Command, U extends Command>(
  transform: (cmd: T) => U
) => transform

// Create command middleware chain
export const createCommandMiddleware = <T extends Command>(
  ...middlewares: Array<(cmd: T) => T | Promise<T>>
) => async (cmd: T): Promise<T> => {
  let result = cmd
  for (const middleware of middlewares) {
    result = await middleware(result)
  }
  return result
}

// Command result mapper
export const mapCommandResult = <T, U>(
  onSuccess: (result: CommandSuccessResponse) => U,
  onError: (result: CommandErrorResponse) => U
) => (result: CommandResponse): U =>
  result.ok ? onSuccess(result) : onError(result)

// Create success response
export const createSuccessResponse = (): CommandSuccessResponse => ({ ok: true })

// Create error response
export const createErrorResponse = (error: string): CommandErrorResponse => ({ 
  ok: false, 
  error 
})
