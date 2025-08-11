import { createEventAction } from "./factory";

// System (snapshot as a dedicated event — handy to replace state)
export const snapshot = createEventAction(
  "snapshot",
  _ => ({ type: "System", id: "snapshot" })
);

// Bots
export const botConnected     = createEventAction("bot.connected",    p => ({ type: "Bot", id: p.botId }));
export const botDisconnected  = createEventAction("bot.disconnected", p => ({ type: "Bot", id: p.botId }));
export const botAuthFailed    = createEventAction("bot.authFailed",   p => ({ type: "Bot", id: p.botId }));

// Tasks
export const taskCreated       = createEventAction("task.created",       p => ({ type: "Task", id: p.taskId }));
export const taskAssigned      = createEventAction("task.assigned",      p => ({ type: "Task", id: p.taskId }));
export const taskStatusChanged = createEventAction("task.statusChanged", p => ({ type: "Task", id: p.taskId }));

// Invites
export const friendInviteSent     = createEventAction("friendInvite.sent",     p => ({ type: "Bot", id: p.botId }));
export const friendInviteAccepted = createEventAction("friendInvite.accepted", p => ({ type: "Bot", id: p.botId }));
export const friendInviteFailed   = createEventAction("friendInvite.failed",   p => ({ type: "Bot", id: p.botId }));

// Chats
export const chatStarted         = createEventAction("chat.started",         p => ({ type: "Chat", id: p.chatId }));
export const chatMessageReceived = createEventAction("chat.messageReceived", p => ({ type: "Chat", id: p.chatId }));
export const chatMessageSent     = createEventAction("chat.messageSent",     p => ({ type: "Chat", id: p.chatId }));
export const agentToggled        = createEventAction("chat.agentToggled",    p => ({ type: "Chat", id: p.chatId }));

// Dialog script
export const dialogScriptAdvanced  = createEventAction("dialogScript.advanced",  p => ({ type: "Chat", id: p.chatId }));
export const dialogScriptCompleted = createEventAction("dialogScript.completed", p => ({ type: "Chat", id: p.chatId }));

// Logs
export const errorLogged = createEventAction("error.logged", _ => ({ type: "System", id: "error" }));
