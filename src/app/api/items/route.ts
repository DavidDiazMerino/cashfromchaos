import { NextRequest, NextResponse } from "next/server";
import { createItemFromIntake, ensureSeeded, getItem, listItems } from "@/lib/store";
import type { ItemIntake } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  return NextResponse.json({ items: listItems() });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<ItemIntake> & { id?: string };
  if (!body?.clue || typeof body.clue !== "string") {
    return NextResponse.json({ error: "Missing 'clue'." }, { status: 400 });
  }
  const intake: ItemIntake = {
    clue: body.clue,
    photos: body.photos?.length ? body.photos : ["/img/generic.svg"],
    notes: body.notes,
    answers: body.answers,
  };
  // When the seller answers the critical questions, the intake UI re-submits
  // with the original item id so we OVERWRITE the same record instead of
  // creating a second entry. Preserve its createdAt to keep dashboard ordering.
  const existing = body.id ? getItem(body.id) : undefined;
  const item = await createItemFromIntake(
    intake,
    existing ? { id: existing.id, createdAt: existing.createdAt } : {}
  );
  return NextResponse.json({ item }, { status: existing ? 200 : 201 });
}
