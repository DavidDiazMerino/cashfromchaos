"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Item } from "@/lib/types";
import { eur } from "@/lib/money";
import { StatusBadge, ConfidenceBadge, TraceList, Section } from "@/components/ui";
import { Timeline } from "@/components/Timeline";

const TABS = [
  "Analysis",
  "Marketplace",
  "Listings",
  "Policy",
  "Buyer",
  "Payment",
  "Fulfillment",
  "P&L",
] as const;
type Tab = (typeof TABS)[number];

export function ItemDetail({ initial }: { initial: Item }) {
  const [item, setItem] = useState<Item>(initial);
  const [tab, setTab] = useState<Tab>("Analysis");

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/items/${item.id}`, { cache: "no-store" });
    if (res.ok) setItem((await res.json()).item);
  }, [item.id]);

  useEffect(() => {
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.intake.photos[0]}
            alt={item.analysis.title}
            className="h-24 w-24 rounded-xl border border-edge object-cover"
          />
          <div>
            <Link href="/dashboard" className="text-xs text-muted hover:text-cash">
              ← Operations
            </Link>
            <h1 className="text-2xl font-black tracking-tight">{item.analysis.title}</h1>
            <p className="text-sm text-muted">{item.analysis.category}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={item.status} />
              <ConfidenceBadge value={item.analysis.confidence} />
            </div>
          </div>
        </div>
        <Link href={`/market/${item.id}`} className="btn-ghost">
          Open buyer listing ↗
        </Link>
      </div>

      <Timeline status={item.status} />

      {/* Mobile (<lg): a scrollable operation dossier — no tab strip to fight
          on a phone. The live trace is part of the narrative, not a sidebar. */}
      <div className="space-y-5 lg:hidden">
        <Section title="Live operation trace">
          <TraceList events={item.trace} />
        </Section>
        <GroupHeader>Decision</GroupHeader>
        <AnalysisTab item={item} />
        <MarketplaceTab item={item} />
        <PolicyTab item={item} />
        <GroupHeader>Listing</GroupHeader>
        <ListingsTab item={item} />
        <GroupHeader>Buyer &amp; Payment</GroupHeader>
        <BuyerTab item={item} />
        <PaymentTab item={item} />
        <GroupHeader>Fulfillment &amp; Payout</GroupHeader>
        <FulfillmentTab item={item} onChange={refresh} />
        <PnLTab item={item} />
      </div>

      {/* Desktop (lg+): tabbed detail + sticky trace sidebar. */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === t ? "bg-cash text-ink font-semibold" : "bg-panel2 text-muted hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Analysis" && <AnalysisTab item={item} />}
          {tab === "Marketplace" && <MarketplaceTab item={item} />}
          {tab === "Listings" && <ListingsTab item={item} />}
          {tab === "Policy" && <PolicyTab item={item} />}
          {tab === "Buyer" && <BuyerTab item={item} />}
          {tab === "Payment" && <PaymentTab item={item} />}
          {tab === "Fulfillment" && <FulfillmentTab item={item} onChange={refresh} />}
          {tab === "P&L" && <PnLTab item={item} />}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Section title="Live operation trace">
            <TraceList events={item.trace} />
          </Section>
        </aside>
      </div>
    </div>
  );
}

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-l-2 border-cash pl-2 pt-1 text-xs font-black uppercase tracking-widest text-ink">
      {children}
    </h2>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-edge/50 py-1.5 text-sm">
      <span className="text-muted">{k}</span>
      <span className="text-right font-mono text-ink">{v}</span>
    </div>
  );
}

function AnalysisTab({ item }: { item: Item }) {
  const a = item.analysis;
  return (
    <div className="space-y-4">
      {a.description && (
        <Section title="Hermes' read on your item">
          <p className="text-sm text-ink">{a.description}</p>
          {a.sellingPoints && a.sellingPoints.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {a.sellingPoints.map((p) => (
                <span key={p} className="chip border-cash/30 text-cash">{p}</span>
              ))}
            </ul>
          )}
        </Section>
      )}
      <Section title="What Hermes understood">
        <div className="grid gap-x-8 sm:grid-cols-2">
          <KV k="Title" v={a.title} />
          <KV k="Category" v={a.category} />
          <KV k="Condition" v={a.condition} />
          <KV k="Confidence" v={a.confidence} />
          {Object.entries(a.detectedAttributes).map(([k, v]) => (
            <KV key={k} k={k} v={v} />
          ))}
          <KV k="Market estimate" v={`${eur(a.estimatedMarketLow)} – ${eur(a.estimatedMarketHigh)}`} />
        </div>
        {a.flags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {a.flags.map((f) => (
              <span key={f} className="chip border-chaos/40 text-chaos">⚑ {f}</span>
            ))}
          </div>
        )}
      </Section>
      <Section title="Decision trace (not raw chain-of-thought)">
        <ul className="space-y-2 text-sm text-muted">
          {a.rationale.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-cash">→</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Section>
      {a.missingInfo.length > 0 && (
        <Section title="Critical questions asked">
          <ul className="space-y-2 text-sm">
            {a.missingInfo.map((q) => (
              <li key={q.id} className="panel-2 p-3">
                <p className="text-ink">{q.question}</p>
                <p className="mt-0.5 text-xs text-muted">{q.reason}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function MarketplaceTab({ item }: { item: Item }) {
  const p = item.plan;
  return (
    <div className="space-y-4">
      <Section title="Channel routing (marketplace-agnostic)">
        <div className="space-y-2">
          {[p.primary, ...p.alternates].map((c, i) => (
            <div
              key={c.channelId}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                i === 0 ? "border-cash/50 bg-cash/5" : "border-edge"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {i === 0 && <span className="chip border-cash/40 text-cash">primary</span>}
                </div>
                <p className="text-xs text-muted">{c.reason}</p>
              </div>
              <div className="text-right font-mono text-xs text-muted">
                <div>fit {(c.fitScore * 100).toFixed(0)}%</div>
                <div>fee {c.feePct}%</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Strategy">
        <ul className="space-y-2 text-sm text-muted">
          {p.strategy.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-cash">→</span>
              <span>{s}</span>
            </li>
          ))}
          {p.bundleRecommended && (
            <li className="flex gap-2">
              <span className="text-gold">★</span>
              <span>Bundle listing recommended.</span>
            </li>
          )}
        </ul>
      </Section>
    </div>
  );
}

function ListingsTab({ item }: { item: Item }) {
  return (
    <div className="space-y-4">
      {item.listings.map((l) => (
        <Section key={l.channelId} title={l.channelId} right={<span className="font-mono text-cash">{eur(l.price)}</span>}>
          <p className="font-semibold">{l.title}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-muted">{l.body}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {l.tags.map((t) => (
              <span key={t} className="chip">#{t}</span>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function PolicyTab({ item }: { item: Item }) {
  const p = item.policy;
  return (
    <Section title="Safety / autonomy policy (the boundary every brain obeys)">
      <div className="grid gap-x-8 sm:grid-cols-2">
        <KV k="Target price" v={eur(p.targetPrice)} />
        <KV k="Floor price" v={eur(p.floorPrice)} />
        <KV k="Auto-accept at/above" v={eur(p.autoAcceptAtOrAbove)} />
        <KV k="Auto-counter down to" v={eur(p.autoCounterDownTo)} />
        <KV k="Human approval below" v={eur(p.requireHumanBelow)} />
        <KV k="Max fulfillment spend" v={eur(p.maxFulfillmentSpend)} />
        <KV k="Shipping allowed" v={p.shippingAllowed ? "yes" : "no"} />
        <KV k="Pickup allowed" v={p.pickupAllowed ? "yes" : "no"} />
        <KV k="Payment methods" v={p.allowedPaymentMethods.join(", ")} />
        <KV k="Escalate suspicious" v={p.suspiciousBuyerEscalation ? "yes" : "no"} />
      </div>
      <p className="mt-3 text-xs text-muted">
        The operator may accept, counter or escalate only within this range. It can never accept
        below floor without human approval, never spend above the fulfillment budget, and refuses
        off-platform payment.
      </p>
    </Section>
  );
}

function BuyerTab({ item }: { item: Item }) {
  if (item.messages.length === 0)
    return (
      <Section title="Buyer messages">
        <p className="text-sm text-muted">
          No buyer activity yet. Open the{" "}
          <Link href={`/market/${item.id}`} className="text-cash">buyer sandbox</Link> to negotiate.
        </p>
      </Section>
    );
  return (
    <Section title="Negotiation">
      <div className="space-y-3">
        {item.messages.map((m, i) => {
          const reply = item.agentReplies[i];
          return (
            <div key={i} className="space-y-2">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm border border-edge bg-panel2 p-3 text-sm">
                <div className="mb-0.5 text-xs text-gold">{m.buyerName}</div>
                {m.text}
              </div>
              {reply && (
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-cash/30 bg-cash/5 p-3 text-sm">
                  <div className="mb-0.5 text-xs text-cash">Hermes · {reply.decision}</div>
                  {reply.reply}
                  <p className="mt-1 font-mono text-[11px] text-muted">{reply.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function PaymentTab({ item }: { item: Item }) {
  const pay = item.payment;
  return (
    <Section title="Stripe-powered held payment">
      <div className="grid gap-x-8 sm:grid-cols-2">
        <KV k="Provider" v={pay.provider} />
        <KV k="Status" v={pay.status} />
        <KV k="Agreed amount" v={pay.amount ? eur(pay.amount) : "—"} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Escrow-like marketplace flow for demo purposes: funds are held after checkout and released
        to the seller on delivery confirmation. {pay.provider === "simulated" && "(Simulated — set STRIPE_SECRET_KEY for real test-mode Checkout.)"}
      </p>
    </Section>
  );
}

function FulfillmentTab({ item, onChange }: { item: Item; onChange: () => void }) {
  const f = item.fulfillment;
  async function act(action: "ship" | "deliver") {
    await fetch("/api/fulfillment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, action }),
    });
    onChange();
  }
  if (!f)
    return (
      <Section title="Fulfillment">
        <p className="text-sm text-muted">Planned after payment is captured.</p>
      </Section>
    );
  return (
    <Section title="Fulfillment">
      <div className="grid gap-x-8 sm:grid-cols-2">
        <KV k="Mode" v={f.mode} />
        {f.carrier && <KV k="Carrier" v={f.carrier} />}
        <KV k="Label cost" v={eur(f.labelCost)} />
        <KV k="Window" v={`${f.windowHours}h`} />
      </div>
      <p className="mt-2 text-sm text-ink">{f.instruction}</p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => act("ship")}
          disabled={item.status !== "shipping-required"}
          className="btn-ghost disabled:opacity-40"
        >
          Mark shipped / met buyer
        </button>
        <button
          onClick={() => act("deliver")}
          disabled={item.status === "payout-released" || item.payment.status !== "held"}
          className="btn-cash disabled:opacity-40"
        >
          Confirm delivery → release payout
        </button>
      </div>
    </Section>
  );
}

function PnLTab({ item }: { item: Item }) {
  const total = item.ledger.reduce((a, e) => a + e.amount, 0);
  if (item.ledger.length === 0)
    return (
      <Section title="P&L">
        <p className="text-sm text-muted">No financials yet — appears after payment.</p>
      </Section>
    );
  return (
    <Section title="P&L">
      <div className="space-y-1">
        {item.ledger
          .filter((e) => e.kind !== "payout")
          .map((e, i) => (
            <div key={i} className="flex justify-between border-b border-edge/50 py-1.5 text-sm">
              <span className="text-muted">{e.label}</span>
              <span className={`font-mono ${e.amount < 0 ? "text-chaos" : "text-ink"}`}>
                {e.amount < 0 ? "−" : ""}
                {eur(Math.abs(e.amount))}
              </span>
            </div>
          ))}
        <div className="flex justify-between pt-2 text-base font-bold">
          <span>Net to seller</span>
          <span className="font-mono text-cash">{eur(total)}</span>
        </div>
      </div>
      {item.payment.status === "released" && (
        <p className="mt-3 text-sm text-cash">
          ✓ Funds released. “I didn’t create a listing. I didn’t negotiate. I didn’t manage payment.
          I just shipped the thing.”
        </p>
      )}
    </Section>
  );
}
