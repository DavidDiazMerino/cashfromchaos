// ============================================================================
// Payments + payout custody. Real Stripe test-mode Checkout when a key is set;
// otherwise a fully-simulated held-payment flow so the demo runs offline.
//
// Wording per CLAUDE.md: this is an *escrow-like* marketplace flow for demo
// purposes — "Stripe-powered held payment", "funds released after delivery
// confirmation". We do not claim legal escrow.
// ============================================================================

import { round2 } from "@/lib/money";
import type { Item, LedgerEntry } from "@/lib/types";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

/**
 * Create a Checkout session for an agreed item. Returns a URL to redirect the
 * buyer to. Uses real Stripe test mode if STRIPE_SECRET_KEY is present, else a
 * simulated success URL handled inside the app.
 */
export async function createCheckout(
  item: Item,
  origin?: string
): Promise<{
  url: string;
  sessionId: string;
  provider: "stripe" | "simulated";
}> {
  // Redirect back to the exact host the buyer is using (Tailscale IP, MagicDNS
  // name, or localhost), falling back to NEXT_PUBLIC_BASE_URL. This avoids the
  // Next.js gotcha where NEXT_PUBLIC_* gets frozen into the build at build time.
  const base = origin || baseUrl();
  const amount = item.payment.amount;
  if (!stripeConfigured()) {
    const sessionId = `sim_${item.id}`;
    return {
      provider: "simulated",
      sessionId,
      url: `${base}/api/checkout/confirm?item=${item.id}&session=${sessionId}&sim=1`,
    };
  }
  // Real Stripe test-mode Checkout.
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: item.analysis.title,
            description: `CashFromChaos held payment · released on delivery confirmation`,
          },
        },
      },
    ],
    success_url: `${base}/api/checkout/confirm?item=${item.id}&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/market/${item.id}?canceled=1`,
    metadata: { itemId: item.id },
  });
  return {
    provider: "stripe",
    sessionId: session.id,
    url: session.url ?? `${base}/market/${item.id}`,
  };
}

// ---------------------------------------------------------------------------
// Ledger / P&L. Built when payment is captured; payout finalizes on delivery.
// ---------------------------------------------------------------------------
export function buildLedger(item: Item): LedgerEntry[] {
  const gross = item.payment.amount;
  const channel = item.plan.primary;
  const feePct = channel.feePct ?? 0;
  const fee = round2((gross * feePct) / 100);
  const shipping = item.fulfillment?.labelCost ?? 0;
  const entries: LedgerEntry[] = [
    { label: `Buyer payment (${channel.name})`, amount: gross, kind: "revenue" },
  ];
  if (fee > 0)
    entries.push({ label: `Marketplace fee (${feePct}%)`, amount: -fee, kind: "fee" });
  if (shipping > 0)
    entries.push({
      label: `Shipping label (${item.fulfillment?.carrier ?? "carrier"})`,
      amount: -shipping,
      kind: "shipping",
    });
  return entries;
}

export function netPayout(item: Item): number {
  return round2(item.ledger.reduce((acc, e) => acc + e.amount, 0));
}
