// ============= Bots Slice =============
export { 
  botSlice, 
  type Bot, 
  type BotStatus, 
  BotSchema 
} from './bots';

// ============= Tasks Slice =============
export { 
  taskSlice, 
  type Task, 
  type TaskStatus, 
  TaskSchema 
} from './tasks';

// ============= Chats Slice =============
export { 
  chatSlice, 
  type Chat, 
  type ChatMsg,
  type ChatMsgFrom,
  ChatSchema,
  ChatMsgSchema
} from './chats';

// ============= System Slice =============
export { 
  systemSlice, 
  type System,
  type RoundRobinState,
  type RateLimitEntry,
  SystemSchema,
  RoundRobinSchema,
  RateLimitEntrySchema
} from './system';

// ============= Re-export all slices for convenient store setup =============

import { botSlice } from './bots';
import { taskSlice } from './tasks';
import { chatSlice } from './chats';
import { systemSlice } from './system';

/**
 * All slice reducers ready to be mounted in the store
 * Keys are pluralized as per createEntitySlice convention
 */
export const sliceReducers = {
  bots: botSlice.reducer,
  tasks: taskSlice.reducer,
  chats: chatSlice.reducer,
  systems: systemSlice.reducer // Note: 'systems' plural even though it's singleton
} as const;

/**
 * All slice actions for convenient access
 */
export const sliceActions = {
  bots: botSlice.actions,
  tasks: taskSlice.actions,
  chats: chatSlice.actions,
  systems: systemSlice.actions
} as const;

/**
 * All slice selectors for convenient access
 */
export const sliceSelectors = {
  bots: {
    selectEntity: botSlice.selectEntity,
    selectAllEntities: botSlice.selectAllEntities,
    selectEntityIds: botSlice.selectEntityIds
  },
  tasks: {
    selectEntity: taskSlice.selectEntity,
    selectAllEntities: taskSlice.selectAllEntities,
    selectEntityIds: taskSlice.selectEntityIds
  },
  chats: {
    selectEntity: chatSlice.selectEntity,
    selectAllEntities: chatSlice.selectAllEntities,
    selectEntityIds: chatSlice.selectEntityIds
  },
  systems: {
    selectEntity: systemSlice.selectEntity,
    selectAllEntities: systemSlice.selectAllEntities,
    selectEntityIds: systemSlice.selectEntityIds,
    // Helper selector for the singleton system entity
    selectSystem: (state: ReturnType<typeof systemSlice.reducer>) => 
      systemSlice.selectEntity(state, 'system')
  }
} as const;

// ============= Type exports for store setup =============

export type RootState = {
  bots: ReturnType<typeof botSlice.reducer>;
  tasks: ReturnType<typeof taskSlice.reducer>;
  chats: ReturnType<typeof chatSlice.reducer>;
  systems: ReturnType<typeof systemSlice.reducer>;
};
