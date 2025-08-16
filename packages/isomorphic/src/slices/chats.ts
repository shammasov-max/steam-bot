import { Schema } from '@effect/schema';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  createEntitySlice, 
  type EntityActionPayload,
  addEntity,
  type EntityState
} from '../base/createEntitySlice';
import { Draft } from '@reduxjs/toolkit';

// ============= Constants =============

const MAX_MESSAGES = 50; // Limit messages per chat to control snapshot size

// ============= Types =============

export type ChatMsgFrom = 'bot' | 'player';

export interface ChatMsg {
  readonly id: string;
  readonly from: ChatMsgFrom;
  readonly text: string;
  readonly ts: number;
}

export interface Chat {
  readonly chatId: string;
  readonly botId: string;
  readonly playerSteamId64: string;
  readonly agentEnabled: boolean;
  readonly messages: readonly ChatMsg[];
  readonly scriptStep?: number;
}

// ============= Schema =============

export const ChatMsgSchema = Schema.Struct({
  id: Schema.String,
  from: Schema.Union(
    Schema.Literal('bot'),
    Schema.Literal('player')
  ),
  text: Schema.String,
  ts: Schema.Number
});

export const ChatSchema = Schema.Struct({
  chatId: Schema.String,
  botId: Schema.String,
  playerSteamId64: Schema.String,
  agentEnabled: Schema.Boolean,
  messages: Schema.Array(ChatMsgSchema),
  scriptStep: Schema.optional(Schema.Number)
});

// ============= Helper Functions =============

function trimMessages(messages: ChatMsg[]): ChatMsg[] {
  if (messages.length > MAX_MESSAGES) {
    // Keep only the last MAX_MESSAGES messages
    return messages.slice(messages.length - MAX_MESSAGES);
  }
  return messages;
}

// ============= Create Slice =============

export const chatSlice = createEntitySlice({
  name: 'chat',
  
  entityReducers: {
    // Event: chat.messageReceived
    'messageReceived': (
      chat, 
      payload: EntityActionPayload<'chat', { 
        from: ChatMsgFrom;
        text: string;
        messageId: string;
        ts: number;
      }>
    ) => {
      const newMessage: ChatMsg = {
        id: payload.messageId,
        from: payload.from,
        text: payload.text,
        ts: payload.ts
      };
      
      chat.messages = trimMessages([...chat.messages, newMessage]);
    },
    
    // Event: chat.messageSent
    'messageSent': (
      chat,
      payload: EntityActionPayload<'chat', {
        text: string;
        messageId: string;
        ts: number;
      }>
    ) => {
      const newMessage: ChatMsg = {
        id: payload.messageId,
        from: 'bot',
        text: payload.text,
        ts: payload.ts
      };
      
      chat.messages = trimMessages([...chat.messages, newMessage]);
    },
    
    // Event: chat.agentToggled
    'agentToggled': (
      chat,
      payload: EntityActionPayload<'chat', { enabled: boolean }>
    ) => {
      chat.agentEnabled = payload.enabled;
    },
    
    // Event: dialogScript.advanced
    'dialogScript.advanced': (
      chat,
      payload: EntityActionPayload<'chat', { step: number }>
    ) => {
      chat.scriptStep = payload.step;
    },
    
    // Event: dialogScript.completed
    'dialogScript.completed': (
      chat,
      payload: EntityActionPayload<'chat'>
    ) => {
      delete chat.scriptStep;
    }
  },
  
  extraReducers: {
    // Event: chat.started - creates new entity
    'chat.started': (
      state: Draft<EntityState<Chat>>,
      action: PayloadAction<{
        chatId: string;
        botId: string;
        playerSteamId64: string;
      }>
    ) => {
      const newChat: Chat = {
        chatId: action.payload.chatId,
        botId: action.payload.botId,
        playerSteamId64: action.payload.playerSteamId64,
        agentEnabled: true,
        messages: []
      };
      
      addEntity(state, newChat, 'chat');
    }
  }
  
  // entitySchema: ChatSchema // TODO: Fix schema type compatibility
});

// ============= Exports =============

export default chatSlice;
