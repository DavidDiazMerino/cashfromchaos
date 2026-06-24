import { NextResponse } from "next/server";
import { listItems, resetDemo } from "@/lib/store";

export const dynamic = "force-dynamic";

// Re-seed the three demo items. Handy between video takes.
export async function POST() {
  await resetDemo();
  return NextResponse.json({ ok: true, items: listItems().length });
}
