import * as S from "effect/Schema";
import { typeid } from "typeid-js";
import { PayloadSchemas, type EventKind, type PayloadOf } from "./payloads";
import { EventMeta, type WireAction } from "./meta";

// Universal factory: action === event (validated)
export function createEventAction<K extends EventKind>(
  kind: K,
  inferAggregate: (p: PayloadOf<K>) => { type: "Bot"|"Chat"|"Task"|"System"; id: string }
) {
  const payloadSchema = PayloadSchemas[kind];

  function make(
    payload: PayloadOf<K>,
    meta?: Partial<Omit<EventMeta,"kind"|"aggregate"|"schemaVersion"> & { aggregate: EventMeta["aggregate"] }>
  ): WireAction {
    const checked = S.decodeUnknownSync(payloadSchema)(payload as any);
    return {
      type: kind,
      payload: checked,
      meta: {
        schemaVersion: 1,
        id: meta?.id ?? typeid("evt").toString(), // Event IDs use 'evt' prefix
        ts: meta?.ts ?? Date.now(),
        kind,
        aggregate: meta?.aggregate ?? inferAggregate(checked),
        source: meta?.source ?? "server",
        correlationId: meta?.correlationId,
        causationId:  meta?.causationId
      }
    };
  }

  // Validate incoming wire-action
  function decodeIncoming(u: unknown): WireAction {
    const base = S.decodeUnknownSync(S.Struct({ type: S.String, payload: S.Unknown, meta: EventMeta }))(u);
    if (base.meta.kind !== kind || base.type !== kind) throw new Error(`Kind/type mismatch: expected ${kind}`);
    const payload = S.decodeUnknownSync(payloadSchema)(base.payload);
    return { ...base, payload };
  }

  return { make, decodeIncoming, type: kind, kind };
}
