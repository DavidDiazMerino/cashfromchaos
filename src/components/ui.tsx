import type { TransactionStatus, TraceEvent, Confidence } from "@/lib/types";

const STATUS_LABEL: Record<TransactionStatus, string> = {
  analyzed: "Analyzed",
  listed: "Listed",
  "buyer-engaged": "Buyer engaged",
  "offer-accepted": "Offer accepted",
  paid: "Paid",
  "shipping-required": "Shipping required",
  "in-transit": "In transit",
  delivered: "Delivered",
  "payout-released": "Payout released",
  escalated: "Escalated",
};

const STATUS_TONE: Record<TransactionStatus, string> = {
  analyzed: "text-muted border-edge",
  listed: "text-sky-600 border-sky-500/30 bg-sky-500/10",
  "buyer-engaged": "text-gold border-gold/30 bg-gold/10",
  "offer-accepted": "text-gold border-gold/40 bg-gold/10",
  paid: "text-cash border-cash/40 bg-cash/10",
  "shipping-required": "text-orange-300 border-orange-500/30 bg-orange-500/10",
  "in-transit": "text-orange-300 border-orange-500/30 bg-orange-500/10",
  delivered: "text-cash border-cash/40 bg-cash/10",
  "payout-released": "text-cash border-cash/50 bg-cash/15",
  escalated: "text-chaos border-chaos/40 bg-chaos/10",
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span className={`chip ${STATUS_TONE[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value: Confidence }) {
  const tone =
    value === "high"
      ? "text-cash border-cash/40"
      : value === "medium-high"
      ? "text-gold border-gold/40"
      : value === "medium"
      ? "text-gold/80 border-gold/30"
      : "text-chaos border-chaos/40";
  return <span className={`chip ${tone}`}>confidence: {value}</span>;
}

const ACTOR_TONE: Record<TraceEvent["actor"], string> = {
  operator: "text-cash",
  buyer: "text-gold",
  seller: "text-sky-600",
  system: "text-muted",
  stripe: "text-[#635bff]",
};

const LEVEL_DOT: Record<NonNullable<TraceEvent["level"]>, string> = {
  info: "bg-muted",
  decision: "bg-cash",
  money: "bg-gold",
  warn: "bg-chaos",
};

export function TraceList({ events }: { events: TraceEvent[] }) {
  return (
    <ol className="relative space-y-3 pl-4">
      <span className="absolute left-[5px] top-1 bottom-1 w-px bg-edge" />
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span
            className={`absolute -left-[11px] top-1.5 h-2.5 w-2.5 rounded-full ${
              LEVEL_DOT[e.level ?? "info"]
            }`}
          />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${ACTOR_TONE[e.actor]}`}>
              {e.actor}
            </span>
            <span className="text-sm text-ink">{e.label}</span>
          </div>
          {e.detail && <p className="mt-0.5 font-mono text-xs text-muted">{e.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

export function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}
