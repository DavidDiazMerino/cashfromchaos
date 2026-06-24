import { notFound } from "next/navigation";
import { ensureSeeded, getItem } from "@/lib/store";
import { ItemDetail } from "@/components/ItemDetail";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: { id: string } }) {
  await ensureSeeded();
  const item = getItem(params.id);
  if (!item) notFound();
  return <ItemDetail initial={item} />;
}
