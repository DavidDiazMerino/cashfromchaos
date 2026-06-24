"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AgentReply, Item } from "@/lib/types";
import { eur } from "@/lib/money";

interface ChatLine {
  who: "buyer" | "hermes";
  text: string;
  decision?: AgentReply["decision"];
}

export function BuyerListing({ initial, paid }: { initial: Item; paid: boolean }) {
  const [item, setItem] = useState<Item>(initial);
  const [chat, setChat] = useState<ChatLine[]>(() =>
    initial.messages.flatMap((m, i): ChatLine[] => {
      const r = initial.agentReplies[i];
      const lines: ChatLine[] = [{ who: "buyer", text: m.text }];
      if (r) lines.push({ who: "hermes", text: r.reply, decision: r.decision });
      return lines;
    })
  );
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [dealPrice, setDealPrice] = useState<number | null>(
    initial.payment.amount && initial.status === "offer-accepted" ? initial.payment.amount : null
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chat]);

  async function send(message?: string) {
    const t = (message ?? text).trim();
    if (!t || busy) return;
    setText("");
    setBusy(true);
    setChat((c) => [...c, { who: "buyer", text: t }]);
    const res = await fetch("/api/negotiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, text: t, buyerName: "You (buyer)" }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return;
    const reply: AgentReply = data.reply;
    setItem(data.item);
    setChat((c) => [...c, { who: "hermes", text: reply.reply, decision: reply.decision }]);
    if (reply.dealAgreed && reply.agreedPrice) setDealPrice(reply.agreedPrice);
  }

  async function pay() {
    setBusy(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.url) window.location.href = data.url;
  }

  const isPaid = paid || item.payment.status === "held" || item.payment.status === "released";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
      {/* 1 — media + price (always first). */}
      <div className="order-1 space-y-4 lg:col-start-1 lg:row-start-1">
        <Link href="/market" className="text-xs text-muted hover:text-cash">← All listings</Link>
        <div className="panel overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.intake.photos[0]} alt={item.analysis.title} className="h-56 w-full object-cover sm:h-72" />
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-2xl font-black">{item.analysis.title}</h1>
              <span className="font-mono text-xl text-cash">{eur(item.policy.targetPrice)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{item.analysis.category}</p>
          </div>
        </div>
      </div>

      {/* 3 — long description + tags (below the negotiation on mobile). */}
      <div className="order-3 lg:order-2 lg:col-start-1 lg:row-start-2">
        <div className="panel p-5">
          <p className="whitespace-pre-line text-sm text-muted">{item.listings[0]?.body}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.listings[0]?.tags.map((t) => (
              <span key={t} className="chip">#{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 2 — Hermes negotiation + payment (right column on desktop, but right
          after the photo on mobile so the "agent earns money" moment is up top). */}
      <aside className="order-2 lg:order-3 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-20 lg:self-start">
        <div className="panel flex h-[560px] flex-col">
          <div className="border-b border-edge p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cash text-ink font-black text-xs">H</span>
              <div>
                <div className="text-sm font-semibold">Hermes (seller’s agent)</div>
                <div className="text-[11px] text-cash">● online · negotiates under policy</div>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {chat.length === 0 && (
              <p className="text-center text-xs text-muted">
                Ask a question or make an offer. Try “Would you take €50?”
              </p>
            )}
            {chat.map((l, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-2xl p-3 text-sm ${
                  l.who === "buyer"
                    ? "ml-auto rounded-tr-sm border border-edge bg-panel2"
                    : "rounded-tl-sm border border-cash/30 bg-cash/5"
                }`}
              >
                {l.who === "hermes" && (
                  <div className="mb-0.5 text-[11px] text-cash">Hermes{l.decision ? ` · ${l.decision}` : ""}</div>
                )}
                {l.text}
              </div>
            ))}
            {busy && <div className="text-xs text-muted">Hermes is typing…</div>}
          </div>

          {isPaid ? (
            <div className="border-t border-edge p-4 text-center">
              <div className="text-sm font-semibold text-cash">✓ Paid · {eur(item.payment.amount)} held</div>
              <p className="mt-1 text-xs text-muted">
                Funds released on delivery. Track it on the{" "}
                <Link href={`/item/${item.id}`} className="text-cash">operation page</Link>.
              </p>
            </div>
          ) : dealPrice ? (
            <div className="space-y-2 border-t border-edge p-4">
              <div className="text-center text-sm">
                Deal agreed at <span className="font-mono text-cash">{eur(dealPrice)}</span>
              </div>
              <button onClick={pay} disabled={busy} className="btn-cash w-full">
                Pay {eur(dealPrice)} with Stripe →
              </button>
            </div>
          ) : (
            <div className="border-t border-edge p-4">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {["Would you take €50?", "Does it work?", "Can you ship it?"].map((q) => (
                  <button key={q} onClick={() => send(q)} className="chip cursor-pointer hover:border-cash/50">
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Make an offer or ask…"
                  className="flex-1 rounded-xl border border-edge bg-panel2 px-3 py-2 text-sm outline-none focus:border-cash/60"
                />
                <button onClick={() => send()} disabled={busy} className="btn-cash">Send</button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
