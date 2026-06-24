// ============================================================================
// Marketplace registry — adapters as interfaces with mock implementations.
// The operator is marketplace-agnostic; it routes by item, not by default.
// Real adapters (Wallapop/eBay/Cardmarket) can be added behind this interface
// later without touching the UI or the operator brain.
// ============================================================================

import type { ListingDraft } from "@/lib/types";

export interface ListingResult {
  channelId: string;
  externalId: string;
  url: string;
  status: "live" | "pending" | "rejected";
}

export interface MarketplaceAdapter {
  id: string;
  name: string;
  kind: "shipping" | "local" | "collector" | "generalist";
  feePct: number;
  shippingFriendly: boolean;
  blurb: string;
  /** Category keywords this channel is strong for. */
  strengths: string[];
  supportsCategory(category: string): boolean;
  createListing(draft: ListingDraft): Promise<ListingResult>;
}

function mockAdapter(
  cfg: Omit<MarketplaceAdapter, "supportsCategory" | "createListing">
): MarketplaceAdapter {
  return {
    ...cfg,
    supportsCategory(category: string) {
      const c = category.toLowerCase();
      return cfg.strengths.some((s) => c.includes(s) || s.includes(c));
    },
    async createListing(draft: ListingDraft): Promise<ListingResult> {
      // Mock: pretend we posted. Real adapter would call the channel API.
      return {
        channelId: cfg.id,
        externalId: `${cfg.id}_${Math.random().toString(36).slice(2, 9)}`,
        url: `/market/listing`,
        status: "live",
      };
    },
  };
}

export const ADAPTERS: Record<string, MarketplaceAdapter> = {
  "cashfromchaos-sandbox": mockAdapter({
    id: "cashfromchaos-sandbox",
    name: "CashFromChaos Sandbox",
    kind: "generalist",
    feePct: 0,
    shippingFriendly: true,
    blurb: "Internal demo marketplace where the fake buyer browses and pays.",
    strengths: ["", "general", "electronics", "music", "collectibles", "furniture", "kids"],
  }),
  "collector-forum-mock": mockAdapter({
    id: "collector-forum-mock",
    name: "Cardmarket-style Collector Channel",
    kind: "collector",
    feePct: 5,
    shippingFriendly: true,
    blurb: "Specialist collector demand for trading cards & collectibles.",
    strengths: ["collectibles", "trading cards", "pokemon", "tcg", "cards"],
  }),
  "reverb-mock": mockAdapter({
    id: "reverb-mock",
    name: "Reverb-style Music Gear Channel",
    kind: "shipping",
    feePct: 5,
    shippingFriendly: true,
    blurb: "Buyers specifically hunting instruments & music electronics.",
    strengths: ["music", "instrument", "guitar", "pedal", "audio", "electronics"],
  }),
  "wallapop-mock": mockAdapter({
    id: "wallapop-mock",
    name: "Wallapop-style Generalist (mock)",
    kind: "generalist",
    feePct: 0,
    shippingFriendly: true,
    blurb: "Broad local + shipping marketplace. Good generalist fallback.",
    strengths: ["electronics", "general", "music", "kids", "home"],
  }),
  "ebay-mock": mockAdapter({
    id: "ebay-mock",
    name: "eBay-style Global (mock)",
    kind: "shipping",
    feePct: 11,
    shippingFriendly: true,
    blurb: "Global reach fallback for rare or niche items.",
    strengths: ["electronics", "collectibles", "music", "rare"],
  }),
  "local-pickup-mock": mockAdapter({
    id: "local-pickup-mock",
    name: "Local Pickup Channel (mock)",
    kind: "local",
    feePct: 0,
    shippingFriendly: false,
    blurb: "Bulky items, local pickup only. No stupid shipping spend.",
    strengths: ["furniture", "home", "bulky", "appliance"],
  }),
};

export function getAdapter(id: string): MarketplaceAdapter | undefined {
  return ADAPTERS[id];
}

export function allAdapters(): MarketplaceAdapter[] {
  return Object.values(ADAPTERS);
}
