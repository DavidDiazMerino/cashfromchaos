# CashFromChaos — 1–3 min demo script

Run `npm run dev`, open `http://localhost:3000`. Hit **Reset demo** on the
dashboard first for a clean state. Suggested hero item: the guitar pedal
(strong ticket, clean accept path). The Pokémon binder and the chair show
routing + policy variety.

---

## Scene 1 — Seller hook (15s)
On camera: **“I don’t want this.”** Turn the camera to a real object:
**“I want to sell this guitar pedal.”**

Screen: the landing page — *“Point your camera at things you don’t want.
Hermes sells them.”*

## Scene 2 — Guided intake (20s)
Go to **/intake**. Pick the pedal photo, the clue is filled in. Hand it to
Hermes. It asks only the critical questions:
- *Does it power on and pass signal cleanly?* → **Works perfectly**
- *Original box and adapter?* → **Box + adapter**

Tap **Confirm — go live**. Big reassurance: **“Relax. I’ll handle it.”**

> UX principle on screen: minimal human clue + maximal autonomous operation.

## Scene 3 — Operational thinking (25s)
**/item/[id] → Analysis + Marketplace + Policy.** Show the legible decision
trace (not raw chain-of-thought): category, confidence, market estimate,
routing reason, and the policy:

```
target ≈ €138 · floor ≈ €82 · auto-counter to ≈ €110 · human approval below floor
fulfillment: tracked shipping · max spend €8
```

## Scene 4 — Marketplace routing (15s)
Point out it’s **marketplace-agnostic**: the pedal routes to the music channel
first (not the default generalist); the chair routes to **local pickup only**;
the Pokémon binder routes to a **collector channel** with a bundle strategy.

## Scene 5 — Buyer persona (25s)
Switch to the buyer (David + fake moustache 🥸). Open **/market → the pedal**.
Chat with Hermes:
- *“Would you take €50?”* → Hermes escalates / counters (below floor).
- *“How about €110?”* → counters toward target.
- *“Fine, €135 today.”* → **accept**, deal agreed.

Each reply shows the decision + reason, bounded by policy. (Bonus: on the
chair, ask *“Can you ship it?”* → Hermes refuses, local pickup only.)

## Scene 6 — Stripe payment & custody (20s)
Click **Pay with Stripe**. Funds land as **held pending delivery**. Back on the
operation page → **Payment** + **Fulfillment**:

```
Buyer paid: €135 · status: held
Shipping label generated (€4.90)
Drop at Correos within 48h · expected payout €130.10
```

## Scene 7 — Fulfillment & completion (15s)
Mark shipped, then **Confirm delivery → release payout**. The timeline
completes and **P&L** shows the net.

```
Delivery confirmed → funds released → transaction complete.
```

Closing line on camera:
> “I didn’t create a listing. I didn’t negotiate. I didn’t manage payment.
> I just shipped the thing.”

---

### Status reference
`Analyzed → Listed → Buyer engaged → Offer accepted → Paid → Shipping required
→ In transit → Delivered → Payout released`
