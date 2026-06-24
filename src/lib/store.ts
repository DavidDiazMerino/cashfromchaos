// ============================================================================
// In-memory store + orchestration. Single source of truth for the demo.
// Persisted on globalThis so it survives Next.js dev hot-reloads and is shared
// across API routes within a server process. No DB required for the demo;
// Supabase can back this later behind the same functions.
// ============================================================================

import { eur } from "@/lib/money";
import { getOperator } from "@/lib/operator";
import { FixtureBrain } from "@/lib/operator/fixtureBrain";
import type {
  AgentReply,
  BuyerMessage,
  Item,
  ItemIntake,
  OperatorBrain,
  TraceEvent,
  TransactionStatus,
} from "@/lib/types";

interface Store {
  items: Map<string, Item>;
  seeded: boolean;
}

const g = globalThis as unknown as { __cfc_store?: Store };
function store(): Store {
  if (!g.__cfc_store) g.__cfc_store = { items: new Map(), seeded: false };
  return g.__cfc_store;
}

let counter = 0;
export function newId(prefix = "item"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function trace(
  item: Item,
  actor: TraceEvent["actor"],
  label: string,
  detail?: string,
  level: TraceEvent["level"] = "info"
): void {
  item.trace.push({ ts: Date.now(), actor, label, detail, level });
}

// ---------------------------------------------------------------------------
// Build a full Item by running the operator brain pipeline.
// ---------------------------------------------------------------------------
export async function createItemFromIntake(
  intake: ItemIntake,
  opts: { id?: string; createdAt?: number } = {}
): Promise<Item> {
  const op = getOperator();
  const analysis = await op.analyzeItem(intake);
  const plan = await op.chooseMarketplace(analysis);
  const policy = await op.buildPolicy(analysis, plan);
  const listings = await op.draftListings(analysis, plan, policy);

  const item: Item = {
    id: opts.id ?? newId(),
    createdAt: opts.createdAt ?? Date.now(),
    intake,
    analysis,
    plan,
    policy,
    listings,
    status: "listed",
    messages: [],
    agentReplies: [],
    payment: { provider: "simulated", status: "none", amount: 0 },
    ledger: [],
    trace: [],
  };

  trace(item, "seller", "Item submitted", `"${intake.clue}"`);
  trace(
    item,
    "operator",
    `Analyzed: ${analysis.title}`,
    `${analysis.category} · confidence ${analysis.confidence} · est ${eur(
      analysis.estimatedMarketLow
    )}–${eur(analysis.estimatedMarketHigh)}`,
    "decision"
  );
  if (analysis.missingInfo.length) {
    trace(
      item,
      "operator",
      `Needs ${analysis.missingInfo.length} critical detail(s)`,
      analysis.missingInfo.map((q) => q.question).join(" | "),
      "warn"
    );
  }
  trace(
    item,
    "operator",
    `Routed to ${plan.primary.name}`,
    `fit ${(plan.primary.fitScore * 100).toFixed(0)}% · ${plan.primary.reason}`,
    "decision"
  );
  trace(
    item,
    "operator",
    `Policy set`,
    `target ${eur(policy.targetPrice)} · floor ${eur(policy.floorPrice)} · auto-counter to ${eur(
      policy.autoCounterDownTo
    )} · human approval below ${eur(policy.requireHumanBelow)}`,
    "decision"
  );
  trace(item, "system", `Listing live on ${plan.primary.name}`, listings[0]?.title);

  store().items.set(item.id, item);
  return item;
}

export function getItem(id: string): Item | undefined {
  return store().items.get(id);
}

export function listItems(): Item[] {
  return [...store().items.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function saveItem(item: Item): void {
  store().items.set(item.id, item);
}

export function setStatus(item: Item, status: TransactionStatus): void {
  item.status = status;
  saveItem(item);
}

// ---------------------------------------------------------------------------
// Negotiation: record a buyer message, run the brain, record the reply.
// ---------------------------------------------------------------------------
export async function negotiate(
  item: Item,
  msg: BuyerMessage,
  brain?: OperatorBrain
): Promise<AgentReply> {
  const op = brain ?? getOperator();
  item.messages.push(msg);
  trace(
    item,
    "buyer",
    `${msg.buyerName}: ${msg.text}`,
    msg.offer !== undefined ? `offer ${eur(msg.offer)}` : undefined
  );
  if (item.status === "listed") setStatus(item, "buyer-engaged");

  const reply = await op.handleBuyerMessage(item, msg);
  item.agentReplies.push(reply);
  trace(
    item,
    "operator",
    `Hermes → ${reply.decision}`,
    reply.reason,
    reply.decision === "accept" ? "money" : "decision"
  );

  if (reply.dealAgreed && reply.agreedPrice !== undefined) {
    item.payment = {
      provider: item.payment.provider,
      status: "none",
      amount: reply.agreedPrice,
    };
    setStatus(item, "offer-accepted");
    trace(item, "operator", `Deal agreed at ${eur(reply.agreedPrice)}`, "Awaiting Stripe payment", "money");
  }
  saveItem(item);
  return reply;
}

// ---------------------------------------------------------------------------
// Seed the three demo items (collectible / music / bulky-local).
// ---------------------------------------------------------------------------
let seedPromise: Promise<void> | null = null;

/** Wipe all items and re-seed the three demo fixtures (for clean video takes). */
export async function resetDemo(): Promise<void> {
  const s = store();
  s.items.clear();
  s.seeded = false;
  seedPromise = null;
  await ensureSeeded();
}

export function ensureSeeded(): Promise<void> {
  const s = store();
  if (s.seeded) return Promise.resolve();
  if (!seedPromise) {
    s.seeded = true; // set first to avoid re-entry while async seeds run
    seedPromise = seedDemo();
  }
  return seedPromise;
}

async function seedDemo(): Promise<void> {
  const { DEMO_INTAKES } = await import("@/fixtures/items");
  // Pre-canned demo history is always generated by the deterministic fixture
  // brain so seeding (and Reset) stays instant even when OPERATOR_BRAIN=hermes.
  // The live Hermes operator only kicks in for new buyer messages typed during
  // the demo, via getOperator() in negotiate().
  const seedBrain = new FixtureBrain();
  let t = Date.now() - 1000 * 60 * 60;
  for (const seed of DEMO_INTAKES) {
    const item = await createItemFromIntake(seed.intake, { id: seed.id, createdAt: (t += 60000) });
    for (const m of seed.seedMessages ?? []) {
      await negotiate(
        item,
        {
          itemId: item.id,
          buyerName: m.buyerName,
          text: m.text,
          offer: m.offer,
          ts: Date.now() - (m.agoMs ?? 0),
        },
        seedBrain
      );
    }
    saveItem(item);
  }
}
