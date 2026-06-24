import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded, getItem } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSeeded();
  const item = getItem(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}
