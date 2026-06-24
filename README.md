# CashFromChaos

> **I don’t want this. CashFromChaos sells it.**

Autonomous, policy-bound recommerce operator for the **Hermes Agent Accelerated
Business Hackathon** (Nous Research × NVIDIA × Stripe).

You send photos of a real object you no longer want and a one-line clue. Hermes
runs the whole operation: understands the item, asks only the critical
questions, routes it to the right marketplace, prices it, drafts listings,
negotiates with buyers under an explicit policy, collects a Stripe-held payment,
guides shipping/pickup, and releases payout on delivery.

> Point your camera at things you don’t want. Hermes sells them.

## Status — working demo (local-first)

This is a runnable Next.js app, not just planning docs. The full loop works
end-to-end with deterministic decisions for a reliable demo video.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Build / checks:

```bash
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run start        # serve the production build
```

No environment variables are required — payments run in a fully **simulated
held-payment** mode out of the box. To use real Stripe test-mode Checkout, copy
`.env.example` to `.env.local` and set `STRIPE_SECRET_KEY` (sk_test_…).

## What to click (demo path)

1. **/** — the hook. “Point your camera at things you don’t want.”
2. **/intake** — pick a demo photo + clue, answer the 1–3 critical questions,
   go live. (“Relax. I’ll handle it.”)
3. **/dashboard** — operations view: every item, channel, target/floor price,
   confidence, next action. `↺ Reset demo` re-seeds for a clean take.
4. **/item/[id]** — the operation in detail: Analysis · Marketplace · Listings ·
   Policy · Buyer · Payment · Fulfillment · P&L, plus a live decision trace.
5. **/market** — the **buyer sandbox**. Open a listing, haggle with Hermes
   (“Would you take €50?”), reach a deal, and pay with Stripe.
6. Back on **/item/[id] → Fulfillment**, mark shipped, then confirm delivery →
   funds released → net payout shown.

See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the scene-by-scene video script.

## How it’s built

- **Next.js 14 (App Router) + TypeScript + Tailwind.** No DB required; an
  in-memory store seeds three demo items (collectible / music / bulky-local).
- **`OperatorBrain` interface** (`src/lib/types.ts`) — the operator is swappable:
  - `fixture` (default) — deterministic, reliable for the video;
  - `hermes` (alias `llm`) — **live operator backed by the local `hermes` CLI**
    (`src/lib/operator/llmBrain.ts` → `hermes -z`). Policy-bound by design:
    decisions and prices stay deterministic (it extends the fixture brain), and
    Hermes writes the buyer-facing negotiation replies, falling back to fixture
    text on any failure. Run live with `OPERATOR_BRAIN=hermes npm run dev`
    (uses whatever provider `hermes status` reports — no API key needed here).
  Selected via `OPERATOR_BRAIN`.
- **Marketplace-agnostic routing.** Adapters are interfaces with mock
  implementations (`src/lib/marketplace/registry.ts`): collector channel,
  music channel, generalist, global, local-pickup. Hermes picks by item.
- **Visible policy layer** (`CommercePolicy`): target/floor, auto-accept,
  auto-counter, human-approval floor, max fulfillment spend, allowed channels
  /payments, shipping vs pickup. Every brain must obey it — it can never accept
  below floor without human approval, overspend, or take off-platform payment.
- **Stripe-powered held payment** — escrow-like marketplace flow for demo
  purposes; funds release after delivery confirmation. Real test-mode Checkout
  when a key is present, otherwise simulated.

## Architecture & decisions

- `CLAUDE.md` — full operating brief / product thesis.
- `ARCHITECTURE_DECISION.md` — runtime/deployment recommendation (local-first →
  optional Vercel/Supabase → optional real Hermes operator).

## Not in this MVP (by design)

Real marketplace automation, legal escrow, multi-user auth, whole-room
inventory scanning. The differentiator is **policy-bound autonomous commerce
over messy physical inventory**, demoed as a reliable, cinematic loop.
