import { Schema } from '@effect/schema';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  createEntitySlice, 
  type EntityActionPayload,
  addEntity,
  type EntityState
} from '../base/createEntitySlice';
import { Draft } from '@reduxjs/toolkit';

// ============= Types =============

export type TaskStatus = 'created' | 'assigned' | 'invited' | 'accepted' | 'failed' | 'disposed' | 'resolved';

export interface Task {
  readonly taskId: string;
  readonly playerSteamId64: string;
  readonly item: string;
  readonly priceMin: number;
  readonly priceMax: number;
  readonly status: TaskStatus;
  readonly assignedBotId?: string;
}

// ============= Schema =============

export const TaskSchema = Schema.Struct({
  taskId: Schema.String,
  playerSteamId64: Schema.String,
  item: Schema.String,
  priceMin: Schema.Number,
  priceMax: Schema.Number,
  status: Schema.Union(
    Schema.Literal('created'),
    Schema.Literal('assigned'),
    Schema.Literal('invited'),
    Schema.Literal('accepted'),
    Schema.Literal('failed'),
    Schema.Literal('disposed'),
    Schema.Literal('resolved')
  ),
  assignedBotId: Schema.optional(Schema.String)
});

// ============= Create Slice =============

export const taskSlice = createEntitySlice({
  name: 'task',
  
  entityReducers: {
    // Event: task.assigned
    assigned: (task, payload: EntityActionPayload<'task', { botId: string }>) => {
      task.assignedBotId = payload.botId;
      task.status = 'assigned';
    },
    
    // Event: task.statusChanged
    statusChanged: (task, payload: EntityActionPayload<'task', { status: TaskStatus }>) => {
      task.status = payload.status;
    }
  },
  
  extraReducers: {
    // Event: task.created - creates new entity
    created: (
      state: Draft<EntityState<Task>>, 
      action: PayloadAction<{
        taskId: string;
        playerSteamId64: string;
        item: string;
        priceMin: number;
        priceMax: number;
      }>
    ) => {
      const newTask: Task = {
        taskId: action.payload.taskId,
        playerSteamId64: action.payload.playerSteamId64,
        item: action.payload.item,
        priceMin: action.payload.priceMin,
        priceMax: action.payload.priceMax,
        status: 'created'
      };
      
      addEntity(state, newTask, 'task');
    }
  }
  
  // entitySchema: TaskSchema // TODO: Fix schema type compatibility
});

// ============= Exports =============

export default taskSlice;
