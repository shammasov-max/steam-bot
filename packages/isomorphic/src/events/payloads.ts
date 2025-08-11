import * as S from "effect/Schema";
import { BotId, ChatId, TaskId, SteamID64, TaskStatus } from "./core";

// Full registry of payload schemas (MVP + growth)
export const PayloadSchemas = {
  // Snapshot — only for the first SSE message
  "snapshot": S.Struct({ state: S.Unknown }),

  // Bots
  "bot.connected":     S.Struct({ botId: BotId }),
  "bot.disconnected":  S.Struct({ botId: BotId }),
  "bot.authFailed":    S.Struct({ botId: BotId, reason: S.String }),

  // Tasks
  "task.created": S.Struct({
    taskId: TaskId,
    playerSteamId64: SteamID64,
    item: S.String,
    priceMin: S.Number,
    priceMax: S.Number
  }),
  "task.assigned":      S.Struct({ taskId: TaskId, botId: BotId }),
  "task.statusChanged": S.Struct({ taskId: TaskId, status: TaskStatus }),

  // Invites
  "friendInvite.sent":     S.Struct({ botId: BotId, playerSteamId64: SteamID64 }),
  "friendInvite.accepted": S.Struct({ botId: BotId, playerSteamId64: SteamID64 }),
  "friendInvite.failed":   S.Struct({ botId: BotId, playerSteamId64: SteamID64, reason: S.String }),

  // Chats
  "chat.started":          S.Struct({ chatId: ChatId, botId: BotId, playerSteamId64: SteamID64 }),
  "chat.messageReceived":  S.Struct({ chatId: ChatId, from: S.Literals("player","bot"), text: S.String }),
  "chat.messageSent":      S.Struct({ chatId: ChatId, text: S.String }),
  "chat.agentToggled":     S.Struct({ chatId: ChatId, enabled: S.Boolean }),

  // Dialog script
  "dialogScript.advanced":  S.Struct({ chatId: ChatId, step: S.Number }),
  "dialogScript.completed": S.Struct({ chatId: ChatId }),

  // Logs
  "error.logged": S.Struct({ message: S.String, context: S.optional(S.Unknown) })
} as const;

export type EventKind = keyof typeof PayloadSchemas;
export type PayloadOf<K extends EventKind> = S.Schema.Type<(typeof PayloadSchemas)[K]>;
