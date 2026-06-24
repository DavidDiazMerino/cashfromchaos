import Link from "next/link";
import { ensureSeeded, listItems } from "@/lib/store";
import { getOperator } from "@/lib/operator";
import { eur } from "@/lib/money";
import { netPayout } from "@/lib/payments";
import { StatusBadge, ConfidenceBadge } from "@/components/ui";
import { ResetButton } from "@/components/ResetButton";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await ensureSeeded();
  const items = listItems();
  const live = items.filter((i) => i.status !== "payout-released").length;
  const earned = items
    .filter((i) => i.payment.status === "released")
    .reduce((acc, i) => acc + netPayout(i), 0);
  const pipeline = items
    .filter((i) => i.payment.status !== "released")
    .reduce((acc, i) => acc + (i.payment.amount || i.policy.targetPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Operations</h1>
          <p className="mt-1 text-muted">Every decision is legible. No hidden magic.</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton />
          <Link href="/intake" className="btn-cash">
            + New item
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Active items" value={String(live)} />
        <Stat label="In pipeline" value={eur(pipeline)} tone="gold" />
        <Stat label="Net earned" value={eur(earned)} tone="cash" />
        <Stat label="Operator" value={`Hermes · ${getOperator().name}`} mono />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const lastReply = item.agentReplies[item.agentReplies.length - 1];
          return (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="panel group flex flex-col gap-4 p-4 transition hover:border-cash/40 sm:flex-row"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.intake.photos[0]}
                alt={item.analysis.title}
                className="h-40 w-full shrink-0 rounded-sm border border-edge object-cover sm:h-28 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-bold">{item.analysis.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted">{item.analysis.category}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="chip border-cash/30 text-cash">{item.plan.primary.name}</span>
                  <ConfidenceBadge value={item.analysis.confidence} />
                </div>
                <div className="mt-3 flex items-center gap-4 font-mono text-xs">
                  <span className="text-muted">
                    target <span className="text-ink">{eur(item.policy.targetPrice)}</span>
                  </span>
                  <span className="text-muted">
                    floor <span className="text-ink">{eur(item.policy.floorPrice)}</span>
                  </span>
                </div>
                <p className="mt-2 truncate text-xs text-muted">
                  <span className="text-cash">next:</span>{" "}
                  {lastReply?.reason ?? "Awaiting buyer engagement."}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: "cash" | "gold";
  mono?: boolean;
}) {
  const color = tone === "cash" ? "text-cash" : tone === "gold" ? "text-gold" : "text-ink";
  return (
    <div className="panel p-4">
      <div className="label">{label}</div>
      <div className={`mt-1 text-xl font-bold ${color} ${mono ? "font-mono text-base" : ""}`}>
        {value}
      </div>
    </div>
  );
}
