# CashFromChaos — Claude Code Operating Brief

You are working on **CashFromChaos**, a hackathon demo/product prototype for the **Hermes Agent Accelerated Business Hackathon** by Nous Research × NVIDIA × Stripe.

This is **not** a generic SaaS generator and not merely a Wallapop automation tool.

## One-line product

> **Point your camera at things you don’t want. Hermes sells them.**

CashFromChaos is an autonomous recommerce operator: a user sends photos of a real object they no longer want, gives minimal context, and Hermes handles the selling operation end-to-end: understand the item, ask only critical questions, decide where it should sell, price it, create listings, negotiate with buyers under policy, collect payment with Stripe, guide shipping/pickup, and release payout when the transaction completes.

## Core promise

The user should only need to know:

> “I don’t want this.”

The system should respond:

> “Thanks. Relax, enjoy your life. I’ll tell you when there’s a buyer.”

The seller should do only two things:

1. point at the object / provide photos and minimal missing details;
2. ship it or meet the buyer when Hermes tells them exactly what to do.

Everything else is autonomous operation.

## Product thesis

Most hackathon teams will build agents that generate a SaaS, landing page, or digital business. That is conceptually easy to copy with AI.

CashFromChaos operates on messy real-world inventory:

- unique physical objects;
- imperfect photos;
- missing details;
- category-specific marketplaces;
- uncertain pricing;
- human negotiation;
- scam risk;
- shipping/pickup decisions;
- payment custody and payout;
- operational traceability.

The differentiator is not “AI writes listings”. The differentiator is **policy-bound autonomous commerce over physical inventory**.

## Hackathon judging alignment

CashFromChaos demonstrates agents that:

- **earn**: buyer payment via Stripe;
- **spend**: shipping labels, boosts, packaging, verification, marketplace fees, or fulfillment costs within policy;
- **run real operations**: listing, negotiation, customer support, payment, logistics, delivery confirmation, P&L.

It should be demoable as a working artifact, not just a concept.

## Target demo narrative

Build toward a 1–3 minute demo video.

### Scene 1 — Seller hook

David faces camera:

> “I don’t want this.”

He turns the camera toward a concrete real object and says something minimal:

> “I want to sell these Pokémon cards.”
> “I want to sell this guitar pedal.”
> “I want to sell this kid’s stroller.”
> “I want to sell this piece of furniture.”

The user should give a **small clue** about the target object. Do not make the primary UX “scan an entire room and infer ten things”. That is impressive but less reliable and less clear.

### Scene 2 — Guided intake

The app/Hermes receives photos and analyzes the item.

It should ask only critical missing details, for example:

- exact model / serial number;
- condition;
- whether it works;
- accessories/manual/box;
- dimensions for bulky items;
- pickup vs shipping preferences;
- minimum acceptable price.

UX principle:

> **Minimal human clue + maximal autonomous operation.**

### Scene 3 — Operational thinking

Show a visual dashboard or log with legible decisions, not hidden magic.

Example:

```txt
Item: Pokémon card binder
Category: collectibles / trading cards
Confidence: medium-high

Missing info:
- Need close-ups of rare/holographic cards
- Need language/edition if visible

Market strategy:
- Avoid local marketplace first
- Better expected demand in collector channels
- Bundle listing recommended unless rare cards found

Target price: €90
Floor price: €65
Autonomy: counteroffer down to €75
Human approval required below €65
Fulfillment: tracked shipping
Max spend: €8
```

### Scene 4 — Marketplace routing

The system is **marketplace-agnostic**. It should choose where to sell based on the item, not default to Wallapop.

Examples:

- Pokémon cards → collector marketplace / Cardmarket-like marketplace / specialist forum / eBay fallback.
- Instrument/music gear → Reverb-like channel / Wallapop / eBay.
- Furniture → local pickup only, Wallapop/Facebook Marketplace-like channel.
- Children’s items → local marketplaces / parent groups / Vinted if clothing.
- Generic electronics → Wallapop first, eBay fallback if rare.

For the hackathon MVP, real adapters are optional. A marketplace sandbox is acceptable if the app clearly models adapters and actions.

### Scene 5 — Buyer persona

Demo can use David with a fake moustache as the buyer.

Buyer opens the marketplace/sandbox and messages the listing:

> “Would you take €50?”

Hermes negotiates under policy:

```txt
Buyer offer: €50
Floor: €65
Decision: reject and counter at €75
Reason: below seller floor and market comps support higher price.
```

Response:

> “I can do €75 if you pay today. Tracked shipping included / pickup available.”

### Scene 6 — Stripe payment and custody

Buyer pays with Stripe.

Use language carefully: implement or simulate an **escrow-like marketplace flow**; do not overclaim legal escrow unless actually compliant.

Acceptable wording:

- “Stripe-powered held payment”;
- “marketplace payout flow”;
- “funds released after delivery confirmation”;
- “escrow-like flow for demo purposes”.

Demo timeline:

```txt
Buyer paid: €75
Payment status: held pending delivery
Shipping label: generated (€4.90)
Seller instruction: drop package at Correos within 48h
Expected payout: €70.10
```

### Scene 7 — Fulfillment and completion

When buyer confirms delivery:

```txt
Delivery confirmed.
Funds released to seller.
Transaction complete.
Net earned: €70.10
```

Closing line:

> “I didn’t create a listing. I didn’t negotiate. I didn’t manage payment. I just shipped the thing.”

## Objects available for David’s real demo

Likely candidates:

1. **Pokémon cards**
   - Very visual.
   - Great for demonstrating marketplace routing beyond Wallapop.
   - If low-value, sell as a binder/bundle and ask for close-ups of rare cards.

2. **Musical instruments / gear**
   - Stronger ticket size.
   - Connects with David’s identity without turning Trantor into a product.
   - Agent can ask about model, power supply, working state, serial number, noise, case.

3. **Furniture**
   - Shows logistics intelligence: local pickup only, no shipping.
   - Good example of the agent avoiding stupid fulfillment spend.

4. **Children’s item / toy / stroller**
   - Universal, emotionally clear, common household recommerce use case.
   - Good for parent/local channels.

Recommended demo set: 3 items total — one collectible, one music/electronics item, one bulky/local item.

## Design principles

### 1. Memorable before corporate

This is a hackathon demo. The UI and video need a strong hook.

Name: **CashFromChaos**.

Tone:

- slightly cinematic;
- confident;
- operational;
- not twee;
- not generic B2B SaaS;
- “your stuff wants to become money”.

### 2. Opinionated software

The product should make decisions, not just generate options.

Bad:

> “Here are five possible marketplaces.”

Good:

> “Do not ship this chair. It is local pickup only. List at €35, accept €25+, and ignore buyers asking for shipping.”

### 3. Human-in-the-loop only where necessary

The system should not ask the seller to fill a long form.

Ask only when:

- the image cannot establish a critical fact;
- authenticity/condition affects price materially;
- seller preference changes operational policy;
- accepting an offer would violate the policy;
- risk/scam/compliance issue detected.

### 4. Show operational state

The demo must show the agent thinking in business terms:

- target price;
- floor price;
- confidence;
- channel strategy;
- autonomy policy;
- buyer messages;
- payment state;
- fulfillment state;
- net payout.

Do not expose raw chain-of-thought. Show concise decision traces and reasons.

### 5. Physical-world moat

Avoid framing the product as “AI listing generator”. That is commodity.

Frame as:

> autonomous liquidation of personal inventory.

## Safety / autonomy policy

Implement a visible policy layer.

Suggested policy fields:

```ts
type CommercePolicy = {
  targetPrice: number;
  floorPrice: number;
  autoAcceptAtOrAbove: number;
  autoCounterDownTo: number;
  requireHumanBelow: number;
  maxFulfillmentSpend: number;
  allowedPaymentMethods: string[];
  allowedChannels: string[];
  shippingAllowed: boolean;
  pickupAllowed: boolean;
  suspiciousBuyerEscalation: boolean;
};
```

Rules:

- Accept or counter only within seller-approved range.
- Never accept below floor without explicit human approval.
- Never spend above max fulfillment budget.
- Avoid off-platform / suspicious payment requests.
- Do not reveal personal address until policy says pickup/shipping flow is safe.
- Escalate restricted/prohibited goods.
- Escalate authenticity-sensitive items if confidence is low.

## MVP scope

Do **not** try to integrate every real marketplace in the first build.

A strong hackathon MVP can be:

1. web app with seller intake and item dashboard;
2. image upload flow;
3. Hermes/LLM analysis step;
4. marketplace router with mock/sandbox adapters;
5. listing generator per channel;
6. buyer simulation UI;
7. negotiation agent under policy;
8. Stripe sandbox payment link / checkout;
9. shipping/fulfillment simulation or label-provider stub;
10. transaction timeline and P&L dashboard.

If time allows, add one real adapter, preferably Wallapop only if its API is easy and ToS-safe. Do not block the core demo on Wallapop.

## Suggested app screens

### Seller mobile-ish intake

- Upload/take photos.
- Prompt: “What do you want to sell?”
- Minimal chat.
- Big reassuring confirmation: “Relax. I’ll handle it.”

### Operations dashboard

Cards for items:

- photo;
- detected object;
- channel;
- status;
- target/floor price;
- confidence;
- next action.

### Item detail

Tabs/sections:

- Analysis;
- Marketplace strategy;
- Listing drafts;
- Negotiation policy;
- Buyer messages;
- Stripe payment;
- Fulfillment;
- P&L.

### Buyer marketplace sandbox

A public-ish listing page where the fake buyer can:

- view item;
- ask questions;
- make offer;
- pay via Stripe sandbox.

### Transaction timeline

Statuses:

```txt
Analyzed → Listed → Buyer engaged → Offer accepted → Paid → Shipping required → Delivered → Payout released
```

## Architecture direction

Prefer a simple web app first.

Recommended stack unless David says otherwise:

- **Next.js / React / TypeScript** for app and demo UI.
- **Supabase** for persistence if useful: items, listings, messages, transactions, policies.
- **Stripe sandbox** for checkout/payment demonstration.
- **Hermes integration** via one of:
  - API/webhook to a running Hermes agent;
  - local CLI wrapper for prototype;
  - in-process LLM calls that mimic Hermes decisions for the UI while the demo narrative presents Hermes as operator.
- **Marketplace adapters** as interfaces with mock implementations first.
- **Docker** optional, mainly for reproducible demo/deploy.

Important: This is a hackathon demo. Optimize for a reliable, cinematic path through the product.

## Hermes runtime strategy — open decision

This repo should not assume it must run inside the current Hermes instance.

Possible modes:

### Mode A — Demo app with simulated Hermes decisions

Fastest and most reliable. The app calls an LLM or uses fixtures to generate decisions. Hermes is represented as the operator in the UX.

Pros: easiest to deploy, least fragile for video.
Cons: less dogfooding of Hermes.

### Mode B — App talks to a local Hermes process

Run Hermes on David’s machine or another computer and expose a small local API/webhook. The app sends item events; Hermes returns plans/actions.

Pros: authentic Hermes system.
Cons: more moving parts.

### Mode C — VPS-hosted Hermes operator

Run the app and a Hermes agent/service on a VPS.

Pros: shareable live demo, external testers.
Cons: secrets, auth, uptime, costs, gateway/security complexity.

### Mode D — Hybrid

For hackathon video: app uses deterministic fixtures + real Stripe sandbox.
For technical writeup: show Hermes can run as operator via local/webhook mode.

Recommended initial path: **Mode D**.

Build the app so the operator is behind an interface:

```ts
interface OperatorBrain {
  analyzeItem(input: ItemIntake): Promise<ItemAnalysis>;
  chooseMarketplace(input: ItemAnalysis): Promise<MarketplacePlan>;
  draftListings(input: MarketplacePlan): Promise<ListingDraft[]>;
  handleBuyerMessage(input: BuyerMessage): Promise<AgentReply>;
  decideFulfillment(input: Transaction): Promise<FulfillmentPlan>;
}
```

Then implementation can be swapped:

- fixture brain for reliable video;
- LLM brain for live demo;
- Hermes brain for real integration.

## Deployment thinking

Do not overbuild deployment before demo path is stable.

Recommended phases:

1. **Local-first prototype**
   - Runs on David’s machine.
   - Uses Stripe sandbox.
   - Uses mock marketplace.
   - Best for fast iteration and video.

2. **Dockerized local demo**
   - Docker Compose for app + optional db.
   - Useful if moving to another computer.

3. **Public demo deployment**
   - Vercel for Next.js frontend/app routes.
   - Supabase hosted DB.
   - Stripe webhooks.
   - Mock marketplace public route.
   - Hermes operator either simulated or running as separate backend.

4. **Real operator deployment**
   - VPS or second computer only if needed for long-running Hermes/gateway/webhook execution.

## What not to do yet

- Do not implement real marketplace automation before the demo loop works.
- Do not spend days on Wallapop API before proving the product story.
- Do not create a generic SaaS landing-page generator.
- Do not require users to create stores or configure channels manually.
- Do not ask the seller 15 form fields.
- Do not hide the business operation; the operation is the demo.

## Initial implementation tasks for Claude Code

When implementation begins, start with this order:

1. Create project skeleton and run it locally.
2. Build static demo screens with hardcoded fixture data.
3. Add item intake/upload UI.
4. Add operator brain interface and fixture implementation.
5. Add buyer marketplace sandbox page.
6. Add negotiation simulation.
7. Add Stripe sandbox checkout/payment flow.
8. Add transaction timeline and P&L.
9. Add optional LLM/Hermes adapter.
10. Polish for video.

Every task must end with a runnable check. Do not claim completion without running the app/tests/build.

## Acceptance criteria for hackathon MVP

The demo should show, end-to-end:

- seller submits real item photos;
- system asks at most 1–3 critical questions;
- system chooses marketplace/channel and explains why;
- listing exists in a demo marketplace page;
- fake buyer can message and negotiate;
- agent replies under policy;
- buyer pays with Stripe sandbox;
- seller receives shipping/pickup instruction;
- transaction completes and payout/net revenue is shown.

## Repository conventions

- Keep implementation simple and demo-reliable.
- Prefer typed data models for item/listing/transaction/policy.
- Keep fixture scenarios under `fixtures/` or `src/fixtures/`.
- Keep demo copy crisp and cinematic.
- Use Spanish internally with David when helpful, but app/demo copy can be English for hackathon judges.
- Avoid boilerplate patterns unless they directly improve demo reliability.

## Source context from David’s Obsidian

Related vault notes:

- `/home/david/Documents/Ideas/proyectos/cashfromchaos.md`
- `/home/david/Documents/Ideas/ideas/agente_wallapop.md`
- `/home/david/Documents/Ideas/plans/wallapop_plan.md`
- `/home/david/Documents/Ideas/_archivos/wallapop-informe.md`
- `/home/david/Documents/Ideas/proyectos/merinos-lab-inventario-misiones.md`

Key pre-existing facts:

- Wallapop automation was already a Tier 1 idea in the vault.
- Prior market research found little/no direct Wallapop/Vinted automation competition.
- Wallapop PRO pricing in research: around 39–59€/month.
- Estimated manual listing time: 7–13 minutes per item.
- Hackathon framing should be broader than Wallapop: marketplace-agnostic recommerce operator.

## Final product mantra

> **I don’t want this. CashFromChaos sells it.**
