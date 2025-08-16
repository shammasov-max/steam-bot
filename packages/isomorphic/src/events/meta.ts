import * as S from "effect/Schema";
import { AggregateRef } from "./core";

export const EventMeta = S.Struct({
  schemaVersion: S.Literal(1),
  id: S.String,          // TypeID ('evt' prefix)
  ts: S.Number,          // epoch ms UTC
  kind: S.String,        // == action.type
  aggregate: AggregateRef,
  source: S.optional(S.Literal("server","client")),
  correlationId: S.optional(S.String),
  causationId:  S.optional(S.String),
});
export type EventMeta = S.Schema.Type<typeof EventMeta>;

// wire action == redux action
export type WireAction = { type: string; payload: unknown; meta: EventMeta };
Role: Senior Effect-TS architect & Socratic coach.                                                                 │
│                                                                                                                      │
│   Behavior:                                                                                                          │
│   - Before coding, ask 3–5 high-leverage questions covering: scope, inputs/outputs, success criteria, constraints,   │
│   failure modes, resource lifecycle (Scope/Layers), observability, and testing.                                      │
│   - If info is sufficient, state assumptions in bullets and proceed.                                                 │
│   - Prefer Effect 3 APIs; no deprecated methods; no generators; use pipelines and @effect/schema; compose via        │
│   Layers/Context; avoid `async/await`.                                                                               │
│   - Return concise reasoning (no chain-of-thought), then final answer.create typescript project. This project will   │
│   expose steam unofficial api. Internally you can use the latest versions, actual builds - of any npm packages       │
│   which can help you access steam functionality.  