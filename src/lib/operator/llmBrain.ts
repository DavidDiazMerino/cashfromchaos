// ============================================================================
// HermesBrain — live operator backed by the local `hermes` CLI (Mode B).
// ----------------------------------------------------------------------------
// Design: HERMES PROVIDES THE VOICE, POLICY PROVIDES THE BOUNDARY.
//
// HermesBrain extends FixtureBrain, so every *decision* (which marketplace,
// the CommercePolicy numbers, accept/counter/escalate, the agreed price, the
// fulfillment mode and max spend) stays deterministic and clamped to the
// seller's CommercePolicy — exactly as the hard rule in CLAUDE.md requires.
// An LLM can never push a price below the floor or overspend, because it never
// owns those numbers.
//
// What Hermes genuinely operates is the buyer-facing negotiation:
//   - handleBuyerMessage → the natural-language reply text (decision unchanged)
//
// This is the most cinematic "the agent is operating" moment and it is exactly
// one CLI call per buyer message. Item analysis/routing/policy/listing copy stay
// on the instant deterministic path so seeding and first page load never block
// on the CLI. Every Hermes call is wrapped so any failure falls back to the
// deterministic fixture text: the demo gets smarter with Hermes running and
// never breaks without it.
// ============================================================================

import type {
  AgentReply,
  BuyerMessage,
  CommercePolicy,
  Item,
  ItemAnalysis,
  ItemIntake,
  ListingDraft,
  MarketplacePlan,
} from "@/lib/types";
import { FixtureBrain } from "@/lib/operator/fixtureBrain";
import { runHermes, runHermesJson } from "@/lib/operator/hermesCli";

/**
 * Recommended live model for the operator brain (see CLAUDE.md / claude-api):
 * Anthropic Claude Opus 4.8 — id "claude-opus-4-8". When unset, Hermes uses
 * its own configured default provider/model.
 */
export const RECOMMENDED_MODEL = "claude-opus-4-8";

export class HermesBrain extends FixtureBrain {
  readonly name = "hermes";

  /**
   * Analysis stays policy-bound: category, price band, confidence, flags and
   * the critical questions all come from the deterministic archetype logic
   * (super). Hermes only does what an LLM is genuinely good at — turn the
   * seller's raw clue + photo context into a clean marketplace TITLE and a
   * short DESCRIPTION of the actual item. One CLI call; any failure falls back
   * to the deterministic title and no description (the fixture body is used).
   */
  async analyzeItem(input: ItemIntake): Promise<ItemAnalysis> {
    const base = await super.analyzeItem(input);
    const answers = input.answers
      ? Object.entries(input.answers).map(([k, v]) => `${k}: ${v}`).join("; ")
      : "none";
    const prompt =
      `You are Hermes, an autonomous recommerce operator. A seller wants to sell an item.\n` +
      `Seller's clue: "${input.clue}".\n` +
      `Extra notes: ${input.notes || "none"}.\n` +
      `Seller's answers to questions: ${answers}.\n` +
      `Your category read: ${base.category}; condition: ${base.condition}; ` +
      `market estimate €${base.estimatedMarketLow}–€${base.estimatedMarketHigh}.\n` +
      `Write a concise, accurate second-hand listing for THIS specific item. ` +
      `Do not invent specs you can't infer. Keep it honest about condition.\n` +
      `Return JSON: {"title": string (max ~60 chars, marketplace-ready), ` +
      `"description": string (2-3 sentences, buyer-facing), ` +
      `"sellingPoints": string[] (2-4 short bullet phrases)}.`;
    try {
      const out = await runHermesJson<{
        title?: string;
        description?: string;
        sellingPoints?: string[];
      }>(prompt);
      const title = out.title?.trim().slice(0, 70);
      const description = out.description?.trim().slice(0, 600);
      const sellingPoints = Array.isArray(out.sellingPoints)
        ? out.sellingPoints.map((s) => String(s).trim()).filter(Boolean).slice(0, 4)
        : undefined;
      return {
        ...base,
        // Keep the deterministic title if Hermes returns nothing usable. The
        // category (used for routing/policy) is never overridden, so a custom
        // title can't break marketplace/policy selection downstream.
        title: title || base.title,
        description: description || undefined,
        sellingPoints,
      };
    } catch {
      return base; // deterministic analysis; fixture listing body will be used
    }
  }

  /**
   * If analysis carries a Hermes-generated description, build the primary
   * listing body from it (the item-specific copy the seller sees and the buyer
   * reads). Alternate channels keep the deterministic body. Falls back wholly
   * to the fixture drafts when no description was generated.
   */
  async draftListings(
    analysis: ItemAnalysis,
    plan: MarketplacePlan,
    policy: CommercePolicy
  ): Promise<ListingDraft[]> {
    const drafts = await super.draftListings(analysis, plan, policy);
    if (!analysis.description || drafts.length === 0) return drafts;

    const points = analysis.sellingPoints?.length
      ? "\n\n" + analysis.sellingPoints.map((p) => `• ${p}`).join("\n")
      : "";
    const primaryId = plan.primary.channelId;
    return drafts.map((d) =>
      d.channelId === primaryId
        ? {
            ...d,
            body:
              `${analysis.description}${points}\n\n` +
              d.body.split("\n\n").slice(-2).join("\n\n"), // keep shipping + CTA lines
          }
        : d
    );
  }

  /**
   * Decision + price come from the policy-bound fixture logic (unchanged and
   * safe). Only the reply prose is regenerated by Hermes, and only when a deal
   * is not being closed by a hard rule we must phrase precisely.
   */
  async handleBuyerMessage(item: Item, message: BuyerMessage): Promise<AgentReply> {
    const base = await super.handleBuyerMessage(item, message);
    const p = item.policy;
    const prompt =
      `You are Hermes, an autonomous recommerce operator negotiating on behalf of ` +
      `the SELLER — your job is to get the best price, not to please the buyer. ` +
      `Be confident and opinionated. Never sound desperate, never cave at the first ` +
      `push, never apologise for the price. Stay strictly on-platform (payment via ` +
      `Stripe only); never reveal the seller's address or personal contact before ` +
      `payment; don't fall for sob stories, fake urgency, "pay later/ship first", ` +
      `or implausibly high (overpayment-scam) offers.\n` +
      `Item: ${item.analysis.title}, listed at €${p.targetPrice} (floor the seller ` +
      `won't cross: €${p.floorPrice}).\n` +
      `Buyer said: "${message.text}".\n` +
      `Your decision is already fixed and you must not change it: ` +
      `${base.decision.toUpperCase()}` +
      (base.price !== undefined ? ` at €${base.price}` : "") +
      `. Internal reason: ${base.reason}\n` +
      `Write the reply you send to the buyer: one or two sentences, firm, ` +
      `confident, consistent with that decision and price. ` +
      `Do not contradict the decision or invent a different number. ` +
      `Output only the message text.`;
    try {
      const reply = (await runHermes(prompt)).slice(0, 400);
      return reply ? { ...base, reply } : base;
    } catch {
      return base; // fall back to deterministic reply
    }
  }
}

// Backwards-compatible alias: the old wiring referenced `LlmBrain`.
export { HermesBrain as LlmBrain };
