// ============================================================================
// Demo fixtures — the recommended set: one collectible, one music/electronics,
// one bulky/local. Each seed may carry pre-baked buyer messages so the
// dashboard shows live negotiation on first load. Kept dependency-free (no
// store import) to avoid a circular module dependency.
// ============================================================================

import type { ItemIntake } from "@/lib/types";

export interface SeedMessage {
  buyerName: string;
  text: string;
  offer?: number;
  agoMs?: number;
}

export interface DemoSeed {
  id: string;
  intake: ItemIntake;
  /** Buyer messages replayed through the operator after the item is created. */
  seedMessages?: SeedMessage[];
}

export const DEMO_INTAKES: DemoSeed[] = [
  {
    id: "demo_pokemon",
    intake: {
      clue: "I want to sell these Pokémon cards",
      photos: ["/img/pokemon.jpg"],
      notes: "A binder full, plus a few that look shiny.",
      answers: { language: "English", rares: "A few holos" },
    },
    // A buyer lowballs, gets countered — shows negotiation on first load.
    seedMessages: [
      { buyerName: "Marco (buyer)", text: "Would you take €50 for the binder?", offer: 50, agoMs: 1000 * 60 * 20 },
    ],
  },
  {
    id: "demo_pedal",
    intake: {
      clue: "I want to sell this guitar pedal",
      photos: ["/img/pedal.jpg"],
      notes: "Overdrive pedal, barely used.",
      answers: { working: "Works perfectly", box: "Box + adapter" },
    },
  },
  {
    id: "demo_furniture",
    intake: {
      clue: "I want to sell this chair / piece of furniture",
      photos: ["/img/furniture.jpg"],
      notes: "Solid wood chair, a bit heavy.",
      answers: { dims: "Standard size" },
    },
    // Buyer asks to ship a local-only item — shows the policy refusal.
    seedMessages: [
      { buyerName: "Lucia (buyer)", text: "Can you ship it to Madrid?", agoMs: 1000 * 60 * 10 },
    ],
  },
];
