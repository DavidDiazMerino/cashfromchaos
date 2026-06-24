// ============================================================================
// Item archetypes — the operator's product knowledge.
// Keyword-driven so the fixture brain can route ANY seller clue, while the
// three demo items (collectible / music / bulky-local) hit rich, cinematic
// paths. Each archetype encodes category knowledge: where it sells, the price
// band, fulfillment posture, and the critical questions worth asking.
// ============================================================================

import type {
  Confidence,
  CriticalQuestion,
  FulfillmentMode,
  ItemCondition,
} from "@/lib/types";

export interface Archetype {
  id: string;
  keywords: string[];
  title: string;
  category: string;
  confidence: Confidence;
  defaultCondition: ItemCondition;
  attributes: Record<string, string>;
  rationale: string[];
  flags: string[];
  marketLow: number;
  marketHigh: number;
  /** ranked channel ids, best first */
  channels: string[];
  bundleRecommended: boolean;
  strategy: string[];
  fulfillment: FulfillmentMode;
  questions: CriticalQuestion[];
  /** image used in fixtures + sandbox */
  image: string;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "pokemon-cards",
    keywords: ["pokemon", "pokémon", "card", "cards", "tcg", "trading card", "binder"],
    title: "Pokémon Trading Card Binder",
    category: "collectibles / trading cards",
    confidence: "medium-high",
    defaultCondition: "good",
    attributes: {
      type: "Trading cards (bundle)",
      visibleCount: "~120 cards",
      language: "unknown — needs confirmation",
      notableCards: "possible holos — needs close-ups",
    },
    rationale: [
      "Detected a trading-card binder — value is driven by a few rare cards, not the bulk.",
      "Local generalist marketplaces underprice collectibles; collector channels pay more.",
      "Recommend bundle listing unless close-ups reveal high-value singles to split out.",
    ],
    flags: ["authenticity-sensitive", "value-in-tail"],
    marketLow: 65,
    marketHigh: 110,
    channels: ["collector-forum-mock", "ebay-mock", "cashfromchaos-sandbox"],
    bundleRecommended: true,
    strategy: [
      "Avoid local generalist first — collectors pay a premium.",
      "List as a bundle; pull rare holos into singles only if confirmed valuable.",
      "Tracked shipping — small, light, high theft/scam appeal.",
    ],
    fulfillment: "shipping",
    questions: [
      {
        id: "rares",
        reason: "A single rare/holo can multiply the price; the photo can't confirm it.",
        question: "Are there any holographic / first-edition / graded cards? A close-up helps.",
        options: ["No idea", "A few holos", "Nothing special"],
      },
      {
        id: "language",
        reason: "Edition/language materially changes collector demand and price.",
        question: "What language/edition are the cards (EN / ES / JP)?",
        options: ["English", "Spanish", "Japanese", "Mixed"],
      },
    ],
    image: "/img/pokemon.svg",
  },
  {
    id: "guitar-pedal",
    keywords: ["pedal", "guitar", "effects", "stompbox", "overdrive", "amp", "music", "synth"],
    title: "Guitar Effects Pedal",
    category: "musical instruments / gear",
    confidence: "high",
    defaultCondition: "like-new",
    attributes: {
      type: "Effects pedal",
      power: "9V — confirm adapter included",
      working: "unknown — needs confirmation",
      box: "unknown",
    },
    rationale: [
      "Music gear holds value and has a dedicated buyer pool that pays for condition.",
      "Specialist music channel beats generalist marketplaces on price for working gear.",
      "Working state + original box are the two facts that move the price most.",
    ],
    flags: ["condition-sensitive"],
    marketLow: 70,
    marketHigh: 120,
    channels: ["reverb-mock", "wallapop-mock", "ebay-mock"],
    bundleRecommended: false,
    strategy: [
      "Lead on specialist music channel; generalist as fallback.",
      "Emphasize working state, true bypass, and included power supply.",
      "Tracked shipping with padded packaging — small but knock-sensitive.",
    ],
    fulfillment: "shipping",
    questions: [
      {
        id: "working",
        reason: "A working unit vs. faulty changes the price band entirely.",
        question: "Does it power on and pass signal cleanly (no crackle)?",
        options: ["Works perfectly", "Works, minor noise", "Not sure", "Faulty"],
      },
      {
        id: "box",
        reason: "Original box + adapter adds resale value on music channels.",
        question: "Do you still have the original box and power adapter?",
        options: ["Box + adapter", "Adapter only", "Neither"],
      },
    ],
    image: "/img/pedal.svg",
  },
  {
    id: "smartwatch",
    keywords: [
      "garmin", "vivoactive", "vívoactive", "forerunner", "fenix", "fēnix", "instinct", "venu",
      "fitbit", "apple watch", "smartwatch", "smart watch", "wearable", "polar", "galaxy watch",
      "amazfit", "suunto", "watch", "tracker",
    ],
    title: "GPS Smartwatch / Fitness Watch",
    category: "electronics / wearables",
    confidence: "high",
    defaultCondition: "good",
    attributes: {
      type: "Smartwatch / fitness tracker",
      brand: "from photo/clue — confirm exact model",
      battery: "unknown — health affects price most",
      accessories: "charger / extra strap / box?",
    },
    rationale: [
      "Wearables have strong, liquid second-hand demand and ship cheaply (small, light).",
      "Exact model + battery health are the two facts that move the price most.",
      "Generalist marketplace works well; global channel as fallback for rarer/premium models.",
    ],
    flags: ["condition-sensitive", "data-wipe-recommended"],
    marketLow: 55,
    marketHigh: 130,
    channels: ["wallapop-mock", "ebay-mock", "cashfromchaos-sandbox"],
    bundleRecommended: false,
    strategy: [
      "Generalist marketplace first; global channel as fallback for premium/rare models.",
      "Lead on exact model, battery health and included charger.",
      "Factory-reset and remove the account before shipping — buyers check this.",
      "Tracked shipping — small, light, high theft/scam appeal.",
    ],
    fulfillment: "shipping",
    questions: [
      {
        id: "model",
        reason: "The exact model decides the price band; the photo alone often can't confirm it.",
        question: "What's the exact model (e.g. Vivoactive 4, Venu 2, Forerunner 245)?",
        options: ["I'll check the back", "It's in the clue", "Not sure"],
      },
      {
        id: "battery",
        reason: "Battery health is the #1 price driver for a used wearable.",
        question: "How's the battery — does it still hold a full-day charge?",
        options: ["Like new", "Holds a day", "Weak", "Not sure"],
      },
      {
        id: "accessories",
        reason: "Original charger + spare strap add resale value and buyer trust.",
        question: "Do you have the charger and original strap/box?",
        options: ["Charger + box", "Charger only", "Neither"],
      },
    ],
    image: "/img/generic.svg",
  },
  {
    id: "furniture",
    keywords: ["chair", "sofa", "table", "desk", "furniture", "shelf", "wardrobe", "couch", "cabinet"],
    title: "Furniture Piece",
    category: "home / furniture",
    confidence: "medium-high",
    defaultCondition: "good",
    attributes: {
      type: "Furniture",
      dimensions: "unknown — needed for buyers",
      material: "wood/upholstery — confirm",
      assembly: "unknown",
    },
    rationale: [
      "Bulky furniture: shipping cost would destroy the margin — local pickup only.",
      "Buyers need dimensions before they commit; that's the one blocking fact.",
      "Local generalist + pickup channel is the right route; ignore shipping requests.",
    ],
    flags: ["bulky", "local-only"],
    marketLow: 25,
    marketHigh: 55,
    channels: ["local-pickup-mock", "wallapop-mock"],
    bundleRecommended: false,
    strategy: [
      "Local pickup ONLY — do not ship, do not spend on logistics.",
      "List with clear dimensions; filter out buyers asking for shipping.",
      "Cash/Stripe on pickup; meet in a safe public spot.",
    ],
    fulfillment: "local-pickup",
    questions: [
      {
        id: "dims",
        reason: "Buyers won't commit to bulky furniture without dimensions.",
        question: "Roughly what are the dimensions (W×D×H in cm)?",
        options: ["I'll measure", "Standard size", "Not sure"],
      },
    ],
    image: "/img/furniture.svg",
  },
  {
    id: "stroller",
    keywords: ["stroller", "pram", "buggy", "pushchair", "kid", "baby", "toy", "child"],
    title: "Children's Stroller",
    category: "kids / baby gear",
    confidence: "medium-high",
    defaultCondition: "good",
    attributes: {
      type: "Stroller / pushchair",
      foldable: "likely",
      cleanliness: "confirm — matters for baby gear",
      accessories: "rain cover? confirm",
    },
    rationale: [
      "Baby gear sells fast in local parent channels; cleanliness drives trust.",
      "Often bulky-ish: local pickup preferred, shipping optional if foldable.",
      "Safety/recall status worth a quick check for trust.",
    ],
    flags: ["hygiene-sensitive"],
    marketLow: 30,
    marketHigh: 70,
    channels: ["wallapop-mock", "local-pickup-mock"],
    bundleRecommended: false,
    strategy: [
      "Lead local/parent channels; pickup preferred.",
      "Lead photos on cleanliness + fold mechanism.",
      "Offer pickup; shipping only if buyer covers the (higher) cost.",
    ],
    fulfillment: "either",
    questions: [
      {
        id: "clean",
        reason: "Cleanliness is the #1 trust factor for second-hand baby gear.",
        question: "Is it cleaned and free of damage/stains?",
        options: ["Spotless", "Minor wear", "Needs a clean"],
      },
    ],
    image: "/img/stroller.svg",
  },
];

export const GENERIC_ARCHETYPE: Archetype = {
  id: "generic-electronics",
  keywords: [],
  title: "Pre-owned Item",
  category: "general / electronics",
  confidence: "medium",
  defaultCondition: "good",
  attributes: {
    type: "General item",
    working: "unknown",
    accessories: "unknown",
  },
  rationale: [
    "No strong category signal — treat as a generalist sale.",
    "Start on a broad generalist marketplace; escalate to global reach if rare.",
    "Confirm working state and accessories before pricing firmly.",
  ],
  flags: [],
  marketLow: 20,
  marketHigh: 60,
  channels: ["wallapop-mock", "ebay-mock", "cashfromchaos-sandbox"],
  bundleRecommended: false,
  strategy: [
    "Generalist marketplace first; eBay-style fallback if demand is thin or item is rare.",
    "Tracked shipping for anything small and valuable.",
  ],
  fulfillment: "either",
  questions: [
    {
      id: "working",
      reason: "Working state is the baseline fact for pricing any used item.",
      question: "Does it work fully? Any defects?",
      options: ["Fully working", "Minor issues", "Faulty"],
    },
  ],
  image: "/img/generic.svg",
};

export function matchArchetype(clue: string): Archetype {
  const c = clue.toLowerCase();
  let best: { a: Archetype; score: number } | null = null;
  for (const a of ARCHETYPES) {
    const score = a.keywords.reduce((acc, k) => (c.includes(k) ? acc + k.length : acc), 0);
    if (score > 0 && (!best || score > best.score)) best = { a, score };
  }
  return best ? best.a : GENERIC_ARCHETYPE;
}
