# Architecture Decision — Where should CashFromChaos run?

Date: 2026-06-16
Status: proposed

## Decision summary

Do **not** start by deploying a full autonomous Hermes operator to VPS.

Start with a **local-first demo app** that has a clean operator interface and can later swap between:

1. fixture brain for reliable video;
2. LLM brain for live demos;
3. Hermes brain for authentic agent operation.

Recommended initial mode: **hybrid demo architecture**.

## Why

The hackathon deliverable is a 1–3 minute demo video plus writeup. The critical risk is not backend scale; it is making the product story feel magical and reliable:

> object photos → operational decisions → buyer negotiation → Stripe payment → fulfillment → payout.

A VPS/full Hermes deployment too early adds failure modes:

- webhook/auth complexity;
- long-running process management;
- secrets and marketplace credentials;
- Stripe webhook exposure;
- live availability during demo;
- harder local iteration with real objects/photos.

## Recommended phases

### Phase 1 — Local cinematic prototype

Run on David’s main machine.

Components:

- Next.js/React app;
- local or hosted Supabase optional;
- Stripe sandbox;
- marketplace sandbox route inside the app;
- fixture/operator-brain implementation;
- demo scenarios based on real object photos.

Purpose:

- capture the video;
- prove UX and narrative;
- avoid live integration fragility.

### Phase 2 — Dockerized local demo

Add Docker Compose if needed.

Components:

- app container;
- database container if not using Supabase;
- optional local webhook tunnel for Stripe.

Purpose:

- move to another computer if useful;
- reproducible local environment;
- safer handoff to Claude Code or other agents.

### Phase 3 — Public/shareable demo

Use if the hackathon requires live testers or judges to click something.

Suggested deployment:

- Vercel for Next.js;
- Supabase hosted DB;
- Stripe sandbox or test mode;
- marketplace sandbox public route;
- operator brain as fixture/LLM service.

Hermes itself does not need to be public yet.

### Phase 4 — Real Hermes operator

Only after the demo path works.

Options:

#### A. Second computer at home

Run Hermes there as a long-running operator with gateway/webhooks.

Pros:
- uses existing hardware;
- good for dogfooding;
- avoids VPS costs.

Cons:
- network exposure/tunnels needed for public webhooks;
- uptime depends on home setup;
- remote debugging can be annoying.

#### B. VPS

Run Hermes and a backend service on VPS.

Pros:
- stable public endpoint;
- easier Stripe webhooks;
- easier live demo access.

Cons:
- secrets/security burden;
- need process supervision;
- more time spent on infrastructure.

#### C. App-hosted LLM operator, Hermes as narrative/optional backend

Use standard serverless/API calls for operator decisions while keeping Hermes as orchestration concept or optional local adapter.

Pros:
- easiest public deployment;
- least moving parts;
- good enough for hackathon if UI shows Hermes-like operations.

Cons:
- less authentic Hermes dogfooding.

## Recommendation for hackathon

Use **Phase 1 → Phase 3** as the main path.

- Build the app and video path locally.
- Deploy to Vercel/Supabase only if a live URL is useful/required.
- Keep a clean `OperatorBrain` interface so Hermes can be plugged in without changing UI.
- Add a short technical writeup explaining how the fixture brain maps to Hermes tools/skills/workflows.

## Does this need another Hermes instance?

Not at the beginning.

Current Hermes can help build and operate the project. For the product runtime, another Hermes instance is useful only when we want a persistent autonomous operator that receives events and acts independently.

Possible future Hermes setup:

- create a dedicated Hermes profile, e.g. `cashfromchaos`, with isolated memory/skills/config;
- enable only required toolsets: web, browser if needed, terminal/file for local operations, messaging/webhook, Stripe skills when available;
- run it on second computer or VPS;
- expose a narrow app-to-Hermes webhook/API boundary;
- keep marketplace credentials and payment credentials scoped to that profile.

But for the first build, this is overkill.

## Docker?

Docker is useful, but not mandatory on day one.

Use Docker when:

- moving the demo to the second computer;
- needing reproducible local setup;
- running a background operator service;
- adding local Postgres/Redis/worker processes.

Avoid Docker if it slows UI iteration.

## Stripe flow recommendation

Use real Stripe test mode for the payment moment.

For custody/escrow wording:

- avoid claiming legal escrow unless implemented/compliant;
- say “Stripe-powered held payment” or “marketplace payout flow”; 
- for MVP, it is acceptable to simulate release after delivery confirmation while using real test-mode Checkout/PaymentIntent.

## Marketplace integrations

Do not start with real Wallapop/Vinted/eBay.

Build adapters as interfaces:

```ts
interface MarketplaceAdapter {
  id: string;
  name: string;
  supportsCategory(category: string): boolean;
  createListing(draft: ListingDraft): Promise<ListingResult>;
  receiveMessage(message: BuyerMessage): Promise<void>;
}
```

Initial implementations:

- `cashfromchaos-sandbox` — internal demo marketplace;
- `wallapop-mock` — shows what would be posted;
- `collector-forum-mock` — for Pokémon/collectibles;
- `local-pickup-mock` — for furniture.

Later implementations:

- Wallapop API if ToS-safe and feasible;
- eBay API;
- Vinted if feasible;
- Cardmarket/collector channels if feasible.

## Non-goals for the first implementation

- Full production marketplace automation.
- Real legal escrow.
- Multi-user auth system.
- Complex inventory scanning of whole rooms.
- Real shipping label purchase unless trivial.
- Native mobile app.

## First implementation shape

Preferred stack:

- Next.js App Router;
- TypeScript;
- Tailwind/shadcn if useful for fast UI;
- Supabase optional;
- Stripe test mode;
- fixture data for 3 demo objects;
- file upload stored locally or in Supabase storage;
- operator brain interface with fixture implementation.

## Demo URL decision

If the Nous Discord submission expects only a Tweet/X demo video and form, a live URL is optional.

If judges/testers can click links, deploy a public demo.

In either case, the video must be self-contained and understandable without a live backend.
