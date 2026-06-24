import type { TransactionStatus } from "@/lib/types";

const FLOW: { key: TransactionStatus; label: string }[] = [
  { key: "analyzed", label: "Analyzed" },
  { key: "listed", label: "Listed" },
  { key: "buyer-engaged", label: "Buyer engaged" },
  { key: "offer-accepted", label: "Offer accepted" },
  { key: "paid", label: "Paid" },
  { key: "shipping-required", label: "Fulfillment" },
  { key: "in-transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "payout-released", label: "Payout" },
];

export function Timeline({ status }: { status: TransactionStatus }) {
  // analyzed and listed share the entry point; treat them together.
  const order = FLOW.map((f) => f.key);
  let current = order.indexOf(status);
  if (status === "escalated") current = 2; // sits at engagement
  if (current < 0) current = 1;

  function dot(done: boolean, active: boolean, i: number) {
    return (
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${
          done
            ? "border-cash bg-cash/20 text-cash"
            : active
            ? "border-cash bg-cash text-ink animate-pulseline"
            : "border-edge bg-panel2 text-muted"
        }`}
      >
        {done ? "✓" : i + 1}
      </span>
    );
  }

  return (
    <div className="panel p-4">
      {/* Mobile: vertical stepper — reads natively on a phone, no side-scroll. */}
      <ol className="space-y-2 sm:hidden">
        {FLOW.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step.key} className="flex items-center gap-3">
              {dot(done, active, i)}
              <span
                className={`text-sm ${active ? "font-semibold text-cash" : done ? "text-ink" : "text-muted"}`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal rail. */}
      <ol className="hidden min-w-max items-center gap-1 sm:flex">
        {FLOW.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step.key} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1">
                {dot(done, active, i)}
                <span
                  className={`whitespace-nowrap text-[10px] ${
                    active ? "text-cash" : done ? "text-ink" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < FLOW.length - 1 && (
                <span className={`mb-4 h-px w-8 ${done ? "bg-cash" : "bg-edge"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
