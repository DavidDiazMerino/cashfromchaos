import Link from "next/link";

const LOOP = ["Camera", "Understand", "List", "Negotiate", "Paid", "Payout"];

const STEPS = [
  ["Point", "Send photos + a one-line clue: “I want to sell this.”"],
  ["Understand", "Hermes IDs the item, asks only the critical questions."],
  ["Route", "It picks the right marketplace — not just the default one."],
  ["Negotiate", "Bounded by your policy: floor, counters, escalation."],
  ["Collect", "Stripe-powered held payment, released on delivery."],
  ["Payout", "You just ship it. The net lands. Done."],
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="scanline relative overflow-hidden rounded-3xl border border-edge bg-panel/60 px-5 py-12 text-center sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <span className="chip mx-auto mb-6 border-cash/40 text-cash">
            autonomous recommerce operator
          </span>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Point your camera at things
            <br />
            you don’t want.
            <br />
            <span className="text-cash">Hermes sells them.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            You only need to know one thing:{" "}
            <span className="text-ink">“I don’t want this.”</span> CashFromChaos handles the
            whole operation — analysis, listing, negotiation, payment and payout.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/intake" className="btn-cash">
              Sell something →
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              See the operation
            </Link>
            <Link href="/market" className="btn-ghost">
              Open buyer sandbox
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-muted">
            “Thanks. Relax, enjoy your life. I’ll tell you when there’s a buyer.”
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-muted">
          Minimal human clue · maximal autonomous operation
        </h2>
        {/* Mobile: the operator loop at a glance — no walls of text. */}
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 sm:hidden">
          {LOOP.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="chip border-cash/30 text-cash">{s}</span>
              {i < LOOP.length - 1 && <span className="text-cash">→</span>}
            </span>
          ))}
        </div>
        {/* Desktop: the detailed step cards. */}
        <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <div key={t} className="panel p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-cash/15 font-mono text-xs text-cash">
                  {i + 1}
                </span>
                <span className="font-semibold">{t}</span>
              </div>
              <p className="text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel grid gap-6 p-7 md:grid-cols-3">
        <div>
          <div className="label">The moat</div>
          <p className="mt-1 text-sm text-muted">
            Not “AI writes listings.” That’s commodity. This is{" "}
            <span className="text-ink">policy-bound autonomous commerce over messy,
            real-world physical inventory</span>{" "}
            — pricing, scam risk, logistics, custody, payout.
          </p>
        </div>
        <div>
          <div className="label">It’s opinionated</div>
          <p className="mt-1 text-sm text-muted">
            It decides, it doesn’t list five options. “Don’t ship this chair. Local pickup only. List
            at €35, accept €25+, ignore buyers asking for shipping.”
          </p>
        </div>
        <div>
          <div className="label">Earns · spends · operates</div>
          <p className="mt-1 text-sm text-muted">
            Earns buyer payment via Stripe. Spends on shipping labels within policy. Runs the whole
            op: listing, negotiation, support, logistics, P&amp;L.
          </p>
        </div>
      </section>
    </div>
  );
}
