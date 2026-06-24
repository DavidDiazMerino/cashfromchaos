import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded, getItem, negotiate } from "@/lib/store";
import { parseOffer } from "@/lib/money";
import type { BuyerMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { itemId, text, buyerName } = body ?? {};
  if (!itemId || !text) {
    return NextResponse.json({ error: "Missing itemId or text" }, { status: 400 });
  }
  await ensureSeeded();
  const item = getItem(itemId);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const msg: BuyerMessage = {
    itemId,
    buyerName: buyerName || "Buyer",
    text: String(text),
    offer: typeof body.offer === "number" ? body.offer : parseOffer(String(text)),
    ts: Date.now(),
  };
  const reply = await negotiate(item, msg);
  return NextResponse.json({ reply, item });
}
