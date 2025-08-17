import { Schema } from '@effect/schema';
import { Draft } from '@reduxjs/toolkit';
import { createEntitySlice, type EntityActionPayload } from '../base/createEntitySlice';

// ============= Types =============

export type BotStatus = 'connecting' | 'connected' | 'disconnected' | 'authFailed';

export interface Bot {
  readonly botId: string;
  readonly steamId64: string;
  readonly label?: string;
  readonly proxyUrl: string;
  readonly status: BotStatus;
  readonly lastSeen?: number;
}

// ============= Schema =============

export const BotSchema = Schema.Struct({
  botId: Schema.String,
  steamId64: Schema.String,
  label: Schema.optional(Schema.String),
  proxyUrl: Schema.String,
  status: Schema.Union(
    Schema.Literal('connecting'),
    Schema.Literal('connected'),
    Schema.Literal('disconnected'),
    Schema.Literal('authFailed')
  ),
  lastSeen: Schema.optional(Schema.Number)
});

// ============= Create Slice =============

export const botSlice = createEntitySlice({
  name: 'bot',
  initialEntities: [] as Draft<Bot>[],
  entityReducers: {
    // Event: bot.connected
    connected: (bot: Draft<Bot>, payload: EntityActionPayload<'bot', { ts: number }>) => {
      bot.status = 'connected';
      bot.lastSeen = payload.ts;
    },
    
    // Event: bot.disconnected
    disconnected: (bot: Draft<Bot>, payload: EntityActionPayload<'bot', { ts: number }>) => {
      bot.status = 'disconnected';
      bot.lastSeen = payload.ts;
    },
    
    // Event: bot.authenticationFailed
    authenticationFailed: (bot: Draft<Bot>, payload: EntityActionPayload<'bot', { reason?: string }>) => {
      bot.status = 'authFailed';
      // Note: reason is available in payload but not stored in entity per spec
    }
  }
  
  // entitySchema: BotSchema, // TODO: Fix schema type compatibility
  
  // No extraReducers needed - bots are created via commands/snapshot, not events
});

// ============= Exports =============

export default botSlice;
