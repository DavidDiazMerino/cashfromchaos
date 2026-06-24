import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded, getItem, saveItem, setStatus, trace } from "@/lib/store";
import { netPayout } from "@/lib/payments";
import { eur } from "@/lib/money";

export const dynamic = "force-dynamic";

// Advance fulfillment: "ship" → in-transit, "deliver" → delivered + payout released.
export async function POST(req: NextRequest) {
  const { itemId, action } = await req.json();
  await ensureSeeded();
  const item = getItem(itemId);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  if (action === "ship") {
    setStatus(item, "in-transit");
    trace(item, "seller", "Package dropped at carrier", item.fulfillment?.carrier, "info");
  } else if (action === "deliver") {
    if (item.payment.status !== "held") {
      return NextResponse.json(
        { error: "Cannot release payout: payment is not held in custody yet." },
        { status: 409 }
      );
    }
    setStatus(item, "delivered");
    trace(item, "buyer", "Delivery confirmed", undefined, "info");
    // Release funds to seller.
    item.payment.status = "released";
    const net = netPayout(item);
    item.ledger.push({ label: "Payout released to seller", amount: 0, kind: "payout" });
    setStatus(item, "payout-released");
    trace(item, "stripe", "Funds released to seller", `net ${eur(net)}`, "money");
    trace(item, "system", "Transaction complete", `Net earned ${eur(net)}`, "money");
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  saveItem(item);
  return NextResponse.json({ item });
}
