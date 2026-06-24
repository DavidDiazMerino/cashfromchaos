import Link from "next/link";
import { ensureSeeded, listItems } from "@/lib/store";
import { eur } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function MarketList() {
  await ensureSeeded();
  const items = listItems();
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-edge bg-panel2 p-5">
        <h1 className="text-2xl font-black tracking-tight">Buyer sandbox</h1>
        <p className="mt-1 text-sm text-muted">
          This is what a buyer sees. Message a listing, haggle with Hermes, and pay — David with a
          fake moustache plays the buyer in the demo. 🥸
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id} href={`/market/${item.id}`} className="panel group overflow-hidden transition hover:border-cash/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.intake.photos[0]} alt={item.analysis.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="truncate font-bold">{item.analysis.title}</h3>
                <span className="font-mono text-cash">{eur(item.policy.targetPrice)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted">{item.analysis.category}</p>
              <p className="mt-2 line-clamp-2 text-xs text-muted">{item.listings[0]?.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
