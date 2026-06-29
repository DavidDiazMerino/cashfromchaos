// ============================================================================
// Operator brain selection. Hermes is THE operator and the default. Override
// via OPERATOR_BRAIN env:
//   hermes | llm (default) → live operator backed by the local `hermes` CLI
//                            (see llmBrain.ts). Built on the deterministic
//                            policy engine below, so it can never breach policy.
//   fixture                → deterministic-only opt-out: no CLI, fully offline.
// The rest of the app only knows the OperatorBrain interface.
// ============================================================================

import type { OperatorBrain } from "@/lib/types";
import { FixtureBrain } from "@/lib/operator/fixtureBrain";

let cached: OperatorBrain | null = null;

export function getOperator(): OperatorBrain {
  if (cached) return cached;
  const mode = (process.env.OPERATOR_BRAIN ?? "hermes").toLowerCase();
  switch (mode) {
    case "fixture":
      // Explicit opt-out: pure deterministic engine, no CLI / child_process.
      cached = new FixtureBrain();
      break;
    case "llm":
    case "hermes":
    default: {
      // The default. HermesBrain extends FixtureBrain, so every policy-bound
      // decision stays deterministic and inside CommercePolicy; Hermes runs the
      // live model for the buyer-facing operation (listings + negotiation),
      // falling back to the deterministic path on any CLI failure.
      const { HermesBrain } = require("@/lib/operator/llmBrain") as typeof import("@/lib/operator/llmBrain");
      cached = new HermesBrain();
    }
  }
  return cached;
}
