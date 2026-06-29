import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded, getItem, saveItem, trace } from "@/lib/store";
import { createCheckout } from "@/lib/payments";
import { eur } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { itemId } = await req.json();
  await ensureSeeded();
  const item = getItem(itemId);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  if (item.payment.amount <= 0) {
    return NextResponse.json({ error: "No agreed price yet" }, { status: 400 });
  }

  // Build the post-payment redirect from the host the buyer actually used, so
  // Stripe returns them to the same address (Tailscale IP / MagicDNS / localhost).
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const origin = host ? `${proto}://${host}` : undefined;

  const session = await createCheckout(item, origin);
  item.payment = {
    ...item.payment,
    provider: session.provider,
    status: "pending",
    sessionId: session.sessionId,
    checkoutUrl: session.url,
  };
  trace(
    item,
    "stripe",
    `Checkout created (${session.provider})`,
    `${eur(item.payment.amount)} held pending delivery`,
    "money"
  );
  saveItem(item);
  return NextResponse.json({ url: session.url, provider: session.provider });
}
