// ============================================================================
// FixtureBrain — deterministic OperatorBrain implementation.
// Reliable for the demo video; the same interface can be backed by an LLM or a
// real Hermes operator (see llmBrain.ts) without any UI change.
// ============================================================================

import { round2, niceRound, parseOffer } from "@/lib/money";
import type {
  AgentReply,
  BuyerMessage,
  CommercePolicy,
  FulfillmentPlan,
  Item,
  ItemAnalysis,
  ItemIntake,
  ListingDraft,
  MarketplaceOption,
  MarketplacePlan,
  OperatorBrain,
} from "@/lib/types";
import { getAdapter } from "@/lib/marketplace/registry";
import { matchArchetype, type Archetype } from "@/lib/operator/archetypes";

function channelOption(id: string, rank: number, category: string): MarketplaceOption {
  const a = getAdapter(id);
  if (!a) {
    return {
      channelId: id,
      name: id,
      fitScore: 0.5,
      reason: "Fallback channel.",
      feePct: 0,
      shippingFriendly: true,
    };
  }
  const fit = a.supportsCategory(category) ? 0.92 - rank * 0.12 : 0.6 - rank * 0.12;
  return {
    channelId: a.id,
    name: a.name,
    fitScore: Math.max(0.3, round2(fit)),
    reason: a.blurb,
    feePct: a.feePct,
    shippingFriendly: a.shippingFriendly,
  };
}

/** Apply seller answers to refine condition + price band. */
function refineWithAnswers(a: Archetype, intake: ItemIntake): { low: number; high: number; notes: string[] } {
  let low = a.marketLow;
  let high = a.marketHigh;
  const notes: string[] = [];
  const ans = intake.answers ?? {};
  for (const v of Object.values(ans).map((x) => x.toLowerCase())) {
    if (/(faulty|not work|broken|for parts)/.test(v)) {
      low = round2(low * 0.45);
      high = round2(high * 0.5);
      notes.push("Seller reports faulty/for-parts → price band cut materially.");
    } else if (/(perfect|spotless|box \+ adapter|works perfectly|english|a few holos)/.test(v)) {
      low = round2(low * 1.08);
      high = round2(high * 1.12);
      notes.push("Positive condition/accessory signal → band nudged up.");
    } else if (/(minor|some|needs a clean|adapter only)/.test(v)) {
      notes.push("Minor wear noted → band held, mention honestly in listing.");
    }
  }
  return { low, high, notes };
}

export class FixtureBrain implements OperatorBrain {
  readonly name: string = "fixture";

  async analyzeItem(input: ItemIntake): Promise<ItemAnalysis> {
    const a = matchArchetype(input.clue + " " + (input.notes ?? ""));
    const { low, high, notes } = refineWithAnswers(a, input);
    // If the seller already answered an archetype question, drop it from missingInfo.
    const answered = new Set(Object.keys(input.answers ?? {}));
    const missing = a.questions.filter((q) => !answered.has(q.id));
    return {
      title: a.title,
      category: a.category,
      detectedAttributes: a.attributes,
      condition: a.defaultCondition,
      confidence: a.confidence,
      rationale: [...a.rationale, ...notes],
      missingInfo: missing,
      flags: a.flags,
      estimatedMarketLow: low,
      estimatedMarketHigh: high,
    };
  }

  async chooseMarketplace(input: ItemAnalysis): Promise<MarketplacePlan> {
    const a = matchArchetype(input.title + " " + input.category);
    const opts = a.channels.map((id, i) => channelOption(id, i, input.category));
    const [primary, ...alternates] = opts;
    return {
      primary,
      alternates,
      bundleRecommended: a.bundleRecommended,
      strategy: a.strategy,
    };
  }

  async buildPolicy(analysis: ItemAnalysis, plan: MarketplacePlan): Promise<CommercePolicy> {
    const a = matchArchetype(analysis.title + " " + analysis.category);
    const mid = (analysis.estimatedMarketLow + analysis.estimatedMarketHigh) / 2;
    // Natural-looking prices (e.g. €120 / €75 / €55) instead of €119.6 / €73.75.
    const target = niceRound(analysis.estimatedMarketHigh * 0.92);
    const floor = niceRound(analysis.estimatedMarketLow);
    const shippingAllowed = a.fulfillment !== "local-pickup";
    const pickupAllowed = a.fulfillment !== "shipping";
    return {
      currency: "EUR",
      targetPrice: target,
      floorPrice: floor,
      autoAcceptAtOrAbove: niceRound(Math.max(mid, target * 0.95)),
      autoCounterDownTo: niceRound((floor + mid) / 2),
      requireHumanBelow: floor,
      maxFulfillmentSpend: shippingAllowed ? 8 : 0,
      allowedPaymentMethods: ["stripe"],
      allowedChannels: [plan.primary.channelId, ...plan.alternates.map((o) => o.channelId)],
      shippingAllowed,
      pickupAllowed,
      suspiciousBuyerEscalation: true,
    };
  }

  async draftListings(
    analysis: ItemAnalysis,
    plan: MarketplacePlan,
    policy: CommercePolicy
  ): Promise<ListingDraft[]> {
    const channels = [plan.primary, ...plan.alternates];
    const attrs = Object.entries(analysis.detectedAttributes)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join("\n");
    return channels.map((c) => {
      const ship = c.shippingFriendly && policy.shippingAllowed
        ? "Tracked shipping available."
        : "Local pickup only — no shipping.";
      return {
        channelId: c.channelId,
        title: `${analysis.title} — ${analysis.condition}`,
        body:
          `${analysis.title} in ${analysis.condition} condition.\n\n` +
          `${attrs}\n\n${ship}\n\nPriced to move. Serious buyers only.`,
        tags: analysis.category.split(/[\/,]/).map((s) => s.trim()).filter(Boolean),
        price: policy.targetPrice,
        currency: "EUR",
      };
    });
  }

  async handleBuyerMessage(item: Item, message: BuyerMessage): Promise<AgentReply> {
    const p = item.policy;
    const a = item.analysis;
    const text = message.text.toLowerCase();
    const offer = message.offer ?? parseOffer(message.text);

    // Negotiation memory: never undercut a counter we've already made (a buyer
    // can't grind us down round after round), and get firmer as rounds add up.
    const priorCounters = item.agentReplies
      .filter(
        (r) =>
          r.decision === "counter" &&
          typeof r.price === "number" &&
          (r.price as number) < p.targetPrice // genuine concessions only, not "hold at ask"
      )
      .map((r) => r.price as number);
    const counterFloor = priorCounters.length ? Math.min(...priorCounters) : 0;
    const lastCounter = priorCounters.length ? priorCounters[priorCounters.length - 1] : undefined;
    const buyerOffers = item.messages.filter(
      (m) => (m.offer ?? parseOffer(m.text)) !== undefined
    ).length;
    const firm = buyerOffers >= 2;
    // Don't haggle over a couple of euros: if the buyer essentially meets our
    // number, close it. ~3% of the asking price, min €2.
    const tol = Math.max(2, Math.round(p.targetPrice * 0.03));

    // --- Scam / off-platform / overpayment detection ---
    const scammy = /(whatsapp|western union|bizum to|paypal friends|gift card|wire transfer|click this link|shipping company i use|overpay|cashier'?s? che(que|ck)|send.*extra|pay (you )?more than|agent will (collect|pick))/.test(
      text
    );
    if (scammy) {
      return {
        decision: "escalate-human",
        reply:
          "Not happening — I keep everything on-platform with Stripe-protected payment, and I don't do overpayment or off-platform arrangements. Pay the asking price here and it's yours.",
        reason: "Off-platform/overpayment/suspicious request → refuse + escalate per policy.",
        dealAgreed: false,
      };
    }

    // --- Personal-info extraction → withhold until paid ---
    const probing = /(your address|where do you live|home address|your phone|phone number|whatsapp|instagram|tik ?tok|your email|post ?code|zip code|meet at your|come to your (home|place|house)|full name|real name|exact (location|address))/.test(
      text
    );
    if (probing) {
      return {
        decision: "answer",
        reply:
          "I don't share the seller's address or personal contact before payment. Pay via Stripe and you'll get tracked shipping or a safe public pickup spot — that protects us both.",
        reason: "Buyer probing for personal/contact details → withheld per privacy policy.",
        dealAgreed: false,
      };
    }

    // --- Shipping requested on a local-only item ---
    if (!p.shippingAllowed && /(ship|send|courier|post|delivery|envío|enviar)/.test(text)) {
      return {
        decision: "answer",
        reply:
          "This one is local pickup only — it's too bulky to ship sensibly. I can hold it for pickup if you're nearby.",
        reason: "Item is local-pickup-only; declined shipping per fulfillment policy.",
        dealAgreed: false,
      };
    }

    // --- Manipulation / urgency / "pay later" / "send first" with no real offer ---
    const manipulative = /(trust me|pay (you )?later|pay after|i'?ll pay (you )?(tomorrow|later|when)|send (it )?(first|before)|ship (it )?(first|before)|reserve (it|this)|hold (it|this) for|deposit later|do me a favou?r|my kid|sick|emergency|urgent|last (bit of )?money|i'?m broke|for free|charity|give it to me)/.test(
      text
    );
    if (manipulative && offer === undefined) {
      return {
        decision: "answer",
        reply: `I hear you, but the terms are firm: €${p.targetPrice}, paid now through Stripe, then it ships. No holds, no pay-later — that's how I keep it fair for everyone.`,
        reason: "Manipulation/urgency tactic, no concrete offer → hold terms, zero concession.",
        dealAgreed: false,
      };
    }

    // --- No price named: confident, informational ---
    if (offer === undefined) {
      return {
        decision: "answer",
        reply:
          `Happy to answer anything. It's €${p.targetPrice}, condition exactly as described — ` +
          `fair price for what it is. Want it?`,
        reason: "No offer named → confident informational reply, no price movement.",
        dealAgreed: false,
      };
    }

    // --- Implausibly high offer → don't take the bait (troll / overpayment scam) ---
    const implausible = offer > Math.max(p.targetPrice * 1.5, a.estimatedMarketHigh * 1.4);
    if (implausible) {
      return {
        decision: "counter",
        price: p.targetPrice,
        reply: `Appreciate the enthusiasm, but I'm not going to pretend that's a serious offer. The price is €${p.targetPrice} — pay that today via Stripe and it's yours. I don't do overpayment deals.`,
        reason: `Offer €${offer} implausibly above market (target €${p.targetPrice}, high €${a.estimatedMarketHigh}) → likely troll/overpayment scam; hold at asking price, no inflated "deal".`,
        dealAgreed: false,
      };
    }

    // --- Below the human-approval floor → firm, escalate ---
    if (offer < p.requireHumanBelow) {
      const hold = niceRound(Math.max(p.autoCounterDownTo, counterFloor));
      return {
        decision: "escalate-human",
        price: p.floorPrice,
        reply:
          `€${offer} is below what the seller will take and I'm not going under €${p.floorPrice}. ` +
          `€${hold} is a fair price for this and I can close today.`,
        reason: `Offer €${offer} < floor €${p.floorPrice} → requires human approval; held at €${hold}.`,
        dealAgreed: false,
      };
    }

    // --- Accept: strong offer, OR the buyer met our number within tolerance ---
    const metOurCounter = lastCounter !== undefined && offer >= lastCounter - tol;
    if (offer >= p.autoAcceptAtOrAbove - tol || metOurCounter) {
      return {
        decision: "accept",
        price: offer,
        reply: `€${offer} works — deal. I'll send a secure Stripe payment link now. Pay today and it's yours.`,
        reason: metOurCounter
          ? `Offer €${offer} meets our €${lastCounter} counter within €${tol} → accept (no haggling over a few euros).`
          : `Offer €${offer} ≥ auto-accept €${p.autoAcceptAtOrAbove} (±€${tol}) → accept.`,
        dealAgreed: true,
        agreedPrice: offer,
      };
    }

    // --- Counter band: anchor near target, concede little, ratchet (don't cave) ---
    // Concede only ~30% of the gap from the buyer's offer toward target, and
    // never below our own previous counter or the policy counter-down.
    if (offer >= p.autoCounterDownTo) {
      const concession = p.targetPrice - (p.targetPrice - offer) * 0.3;
      const counter = niceRound(
        Math.min(p.targetPrice, Math.max(p.autoCounterDownTo, counterFloor, concession))
      );
      return {
        decision: "counter",
        price: counter,
        reply: firm
          ? `€${counter}, paid today via Stripe. That's my best — it's a fair price and I've got other buyers watching.`
          : `€${offer}'s a little under it. I can do €${counter} if you pay today via Stripe. Deal?`,
        reason: `Offer €${offer} in counter band → counter €${counter} (concede ~30% of gap toward target €${p.targetPrice}; ratchet ≥ €${niceRound(Math.max(p.autoCounterDownTo, counterFloor))}${firm ? "; firm, round " + buyerOffers : ""}).`,
        dealAgreed: false,
      };
    }

    // --- Between floor and counter-down: hold firm, don't drift toward floor ---
    const hold = niceRound(Math.max(p.autoCounterDownTo, counterFloor));
    return {
      decision: "counter",
      price: hold,
      reply: `€${offer}'s too low for the condition. €${hold} is the best I'll do and it's a fair deal — take it or leave it.`,
      reason: `Offer €${offer} below counter-down €${p.autoCounterDownTo} but above floor → hold firm at €${hold} (no caving).`,
      dealAgreed: false,
    };
  }

  async decideFulfillment(item: Item): Promise<FulfillmentPlan> {
    const a = matchArchetype(item.analysis.title + " " + item.analysis.category);
    if (a.fulfillment === "local-pickup") {
      return {
        mode: "local-pickup",
        labelCost: 0,
        instruction:
          "Meet the buyer at a safe public spot. Confirm the item, take Stripe payment on pickup, done. No shipping.",
        windowHours: 72,
      };
    }
    const labelCost = Math.min(4.9, item.policy.maxFulfillmentSpend);
    return {
      mode: "shipping",
      carrier: "Correos",
      labelCost,
      instruction: `Drop the packaged item at Correos within 48h. Prepaid tracked label (€${labelCost.toFixed(
        2
      )}) is generated. Payout releases on delivery confirmation.`,
      windowHours: 48,
    };
  }
}
