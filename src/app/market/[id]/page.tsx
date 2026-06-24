import { notFound } from "next/navigation";
import { ensureSeeded, getItem } from "@/lib/store";
import { BuyerListing } from "@/components/BuyerListing";

export const dynamic = "force-dynamic";

export default async function MarketItem({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string };
}) {
  await ensureSeeded();
  const item = getItem(params.id);
  if (!item) notFound();
  return <BuyerListing initial={item} paid={searchParams.paid === "1"} />;
}
