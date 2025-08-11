// server/commands.ts (фрагмент)

import type { Command, CommandResult } from "@app/isomorphic/commands";
import { taskCreated, taskStatusChanged } from "@app/isomorphic/events/actions";
import type { WireAction } from "@app/isomorphic/events/meta";

// предположим, что есть store и broadcastBatch из вашего кода
declare const store: { dispatch: (a: WireAction) => void };
declare function broadcastBatch(actions: WireAction[]): void;

function genTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function handleCommand(cmd: Command): Promise<CommandResult> {
  switch (cmd.type) {
    case "AddBotFromMaFile": {
      // ... без изменений
      return { ok: true };
    }
    case "RemoveBot": {
      // ... без изменений
      return { ok: true };
    }
    case "ToggleAgent": {
      // ... без изменений
      return { ok: true };
    }
    case "SendMessage": {
      // ... без изменений
      return { ok: true };
    }

    // ✅ NEW
    case "CreateTask": {
      const taskId = cmd.payload.taskId ?? genTaskId();
      const evt = taskCreated.make({
        taskId,
        playerSteamId64: cmd.payload.playerSteamId64,
        item: cmd.payload.item,
        priceMin: cmd.payload.priceMin,
        priceMax: cmd.payload.priceMax
      });
      store.dispatch(evt);
      broadcastBatch([evt]);
      return { ok: true };
    }

    // ✅ NEW
    case "DisposeTask": {
      // меняем статус через существующее событие task.statusChanged
      const evt = taskStatusChanged.make({
        taskId: cmd.payload.taskId,
        status: "disposed"
      });
      store.dispatch(evt);
      broadcastBatch([evt]);
      return { ok: true };
    }

    default:
      return { ok: false, error: "Unsupported command" };
  }
}
