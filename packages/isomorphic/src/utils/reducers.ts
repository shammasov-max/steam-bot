import { pipe } from 'effect'
import * as R from 'ramda'
import {
  AppState,
  Bot,
  Task,
  Chat,
  BotId,
  TaskId,
  ChatId,
  Message,
  TaskStatus,
  BotStatus,
  botsLens,
  tasksLens,
  chatsLens,
  systemLens
} from '../domain/models'
import { DomainEvent } from '../events/schemas'
import { generateMessageId } from './typeid'

// ============================================================================
// Reducer Type Definitions
// ============================================================================

export type Reducer<TState, TAction> = (state: TState, action: TAction) => TState

export type EventReducer = Reducer<AppState, DomainEvent>

// ============================================================================
// Initial State Factory
// ============================================================================

export const createInitialAppState = (): AppState => ({
  bots: {},
  tasks: {},
  chats: {},
  system: {
    roundRobin: {
      pointer: 0,
      eligibleBotIds: []
    },
    rateLimits: {}
  }
})

// ============================================================================
// Entity Update Helpers using Lenses
// ============================================================================

// Generic entity updater
export const updateEntity = <TId extends string, TEntity>(
  lens: R.Lens<AppState, Record<TId, TEntity>>
) => (id: TId, updater: (entity: TEntity | undefined) => TEntity | undefined) => 
  (state: AppState): AppState => {
    const entities = R.view(lens, state)
    const updated = updater(entities[id])
    
    if (updated === undefined) {
      const newEntities = { ...entities }
      delete newEntities[id]
      return R.set(lens, newEntities as Record<TId, TEntity>, state)
    }
    
    return R.set(lens, { ...entities, [id]: updated }, state)
  }

// Specific entity updaters
export const updateBot = updateEntity<BotId, Bot>(botsLens)
export const updateTask = updateEntity<TaskId, Task>(tasksLens)
export const updateChat = updateEntity<ChatId, Chat>(chatsLens)

// Add entity helper
export const addEntity = <TId extends string, TEntity>(
  lens: R.Lens<AppState, Record<TId, TEntity>>,
  id: TId,
  entity: TEntity
) => (state: AppState): AppState =>
  R.over(lens, R.assoc(id, entity), state)

// Remove entity helper
export const removeEntity = <TId extends string, TEntity>(
  lens: R.Lens<AppState, Record<TId, TEntity>>,
  id: TId
) => (state: AppState): AppState => {
  const entities = R.view(lens, state)
  const newEntities = { ...entities }
  delete newEntities[id]
  return R.set(lens, newEntities as Record<TId, TEntity>, state)
}

// ============================================================================
// Event Reducers using Pattern Matching
// ============================================================================

const reduceSnapshotEvent = (state: AppState, event: DomainEvent): AppState => {
  if (event.type !== 'snapshot') return state
  return event.payload.state
}

const reduceBotEvents = (state: AppState, event: DomainEvent): AppState => {
  switch (event.type) {
    case 'bot.connected': {
      const stateWithBot = updateBot(event.payload.botId, () => ({
        id: event.payload.botId,
        steamId64: '',  // Will be set by backend
        proxyUrl: '',   // Will be set by backend
        status: 'connected' as BotStatus,
        lastSeen: Date.now()
      }))(state)
      
      return {
        ...stateWithBot,
        system: {
          ...stateWithBot.system,
          roundRobin: {
            ...stateWithBot.system.roundRobin,
            eligibleBotIds: [...stateWithBot.system.roundRobin.eligibleBotIds, event.payload.botId]
          }
        }
      }
    }
    
    case 'bot.disconnected': {
      const stateWithBot = updateBot(event.payload.botId, bot => 
        bot ? { ...bot, status: 'disconnected' as BotStatus, lastSeen: Date.now() } : undefined
      )(state)
      
      return {
        ...stateWithBot,
        system: {
          ...stateWithBot.system,
          roundRobin: {
            ...stateWithBot.system.roundRobin,
            eligibleBotIds: stateWithBot.system.roundRobin.eligibleBotIds.filter(
              id => id !== event.payload.botId
            )
          }
        }
      }
    }
    
    case 'bot.authFailed':
      return updateBot(event.payload.botId, bot =>
        bot ? { ...bot, status: 'authFailed' as BotStatus, lastSeen: Date.now() } : undefined
      )(state)
    
    default:
      return state
  }
}

const reduceTaskEvents = (state: AppState, event: DomainEvent): AppState => {
  switch (event.type) {
    case 'task.created':
      return addEntity(tasksLens, event.payload.taskId, {
        id: event.payload.taskId,
        playerSteamId64: event.payload.playerSteamId64,
        item: event.payload.item,
        priceMin: event.payload.priceMin,
        priceMax: event.payload.priceMax,
        status: 'created' as TaskStatus,
        assignedBotId: undefined
      })(state)
    
    case 'task.assigned':
      return updateTask(event.payload.taskId, task =>
        task ? { ...task, status: 'assigned' as TaskStatus, assignedBotId: event.payload.botId } : undefined
      )(state)
    
    case 'task.statusChanged':
      return updateTask(event.payload.taskId, task =>
        task ? { ...task, status: event.payload.status } : undefined
      )(state)
    
    default:
      return state
  }
}

const reduceFriendInviteEvents = (state: AppState, event: DomainEvent): AppState => {
  switch (event.type) {
    case 'friendInvite.sent':
      // Update rate limit for bot
      return {
        ...state,
        system: {
          ...state.system,
          rateLimits: {
            ...state.system.rateLimits,
            [event.payload.botId]: {
              ...state.system.rateLimits[event.payload.botId],
              lastInviteAt: Date.now()
            }
          }
        }
      }
    
    case 'friendInvite.accepted':
      // Update related task status if any
      const tasksToUpdate = Object.values(state.tasks).filter(
        task => task.assignedBotId === event.payload.botId && 
                task.playerSteamId64 === event.payload.playerSteamId64
      )
      
      return tasksToUpdate.reduce(
        (acc, task) => updateTask(task.id, t => 
          t ? { ...t, status: 'accepted' as TaskStatus } : undefined
        )(acc),
        state
      )
    
    case 'friendInvite.failed':
      // Update related task status to failed
      const failedTasks = Object.values(state.tasks).filter(
        task => task.assignedBotId === event.payload.botId && 
                task.playerSteamId64 === event.payload.playerSteamId64
      )
      
      return failedTasks.reduce(
        (acc, task) => updateTask(task.id, t => 
          t ? { ...t, status: 'failed' as TaskStatus } : undefined
        )(acc),
        state
      )
    
    default:
      return state
  }
}

const reduceChatEvents = (state: AppState, event: DomainEvent): AppState => {
  switch (event.type) {
    case 'chat.started':
      return addEntity(chatsLens, event.payload.chatId, {
        id: event.payload.chatId,
        botId: event.payload.botId,
        playerSteamId64: event.payload.playerSteamId64,
        agentEnabled: true,
        messages: [],
        scriptStep: 0
      })(state)
    
    case 'chat.messageReceived':
    case 'chat.messageSent': {
      const message: Message = {
        id: generateMessageId(),
        from: event.type === 'chat.messageReceived' ? event.payload.from : 'bot',
        text: event.type === 'chat.messageReceived' ? event.payload.text : event.payload.text,
        ts: Date.now()
      }
      
      return updateChat(event.payload.chatId, chat =>
        chat ? { ...chat, messages: [...chat.messages, message] } : undefined
      )(state)
    }
    
    case 'chat.agentToggled':
      return updateChat(event.payload.chatId, chat =>
        chat ? { ...chat, agentEnabled: event.payload.enabled } : undefined
      )(state)
    
    default:
      return state
  }
}

const reduceDialogScriptEvents = (state: AppState, event: DomainEvent): AppState => {
  switch (event.type) {
    case 'dialogScript.advanced':
      return updateChat(event.payload.chatId, chat =>
        chat ? { ...chat, scriptStep: event.payload.step } : undefined
      )(state)
    
    case 'dialogScript.completed':
      return updateChat(event.payload.chatId, chat =>
        chat ? { ...chat, scriptStep: undefined } : undefined
      )(state)
    
    default:
      return state
  }
}

// ============================================================================
// Main Reducer Composer
// ============================================================================

export const rootReducer: EventReducer = (state = createInitialAppState(), event: DomainEvent): AppState => {
  // Compose all reducers
  return pipe(
    state,
    s => reduceSnapshotEvent(s, event),
    s => reduceBotEvents(s, event),
    s => reduceTaskEvents(s, event),
    s => reduceFriendInviteEvents(s, event),
    s => reduceChatEvents(s, event),
    s => reduceDialogScriptEvents(s, event)
  )
}

// ============================================================================
// Reducer Utilities
// ============================================================================

// Combine multiple reducers
export const combineReducers = <TState, TAction>(
  ...reducers: Array<Reducer<TState, TAction>>
): Reducer<TState, TAction> =>
  (state: TState, action: TAction): TState =>
    reducers.reduce((s, reducer) => reducer(s, action), state)

// Apply middleware to reducer
export const applyReducerMiddleware = <TState, TAction>(
  middleware: (state: TState, action: TAction, next: Reducer<TState, TAction>) => TState,
  reducer: Reducer<TState, TAction>
): Reducer<TState, TAction> =>
  (state: TState, action: TAction): TState =>
    middleware(state, action, reducer)

// Create reducer with logging
export const withLogging = <TState, TAction>(
  reducer: Reducer<TState, TAction>
): Reducer<TState, TAction> =>
  applyReducerMiddleware(
    (state, action, next) => {
      console.log('[Reducer] Action:', action)
      const newState = next(state, action)
      console.log('[Reducer] New State:', newState)
      return newState
    },
    reducer
  )

// Create time-travel reducer
export const createTimeTravelReducer = <TState, TAction>(
  reducer: Reducer<TState, TAction>,
  maxHistory = 100
) => {
  const history: TState[] = []
  let currentIndex = -1
  
  return {
    reducer: (state: TState, action: TAction): TState => {
      const newState = reducer(state, action)
      
      // Add to history
      history.splice(currentIndex + 1)
      history.push(newState)
      
      // Limit history size
      if (history.length > maxHistory) {
        history.shift()
      } else {
        currentIndex++
      }
      
      return newState
    },
    
    undo: (): TState | null => {
      if (currentIndex > 0) {
        currentIndex--
        return history[currentIndex]!
      }
      return null
    },
    
    redo: (): TState | null => {
      if (currentIndex < history.length - 1) {
        currentIndex++
        return history[currentIndex]!
      }
      return null
    }
  }
}
