import type { KbEntry } from "@/lib/chat-fallback-types";

const PRODUCT_NAMES = ["Aloe Vera Gel", "Lip Balm", "Abhyang Tel", "KindSkin Co.", "KindSkin Co"];

export function enrichText(text: string): string {
  let out = text;
  for (const name of PRODUCT_NAMES) {
    out = out.replace(new RegExp(name.replace(".", "\\."), "g"), `**${name}**`);
  }
  out = out.replace(/(₹\d+)/g, "**$1**");
  return out;
}

export function formatGreeting(): string {
  return `Hello! Welcome to **KindSkin Co.** 👋

I'm your skincare assistant — happy to help with products, ingredients, routines, shipping, and returns.

**Our range**
- **Aloe Vera Gel** — **₹100** · Pure aloe hydration for face, body & hair
- **Lip Balm** — **₹50** · Nourishing care in Strawberry, Apple, Mango, Vanilla & Chocolate
- **Abhyang Tel** — **₹120** · Ayurvedic massage oil for body nourishment

What would you like to explore?`;
}

export function formatFallback(): string {
  return `I can help with **KindSkin** products and everyday skincare questions.

**Try asking about:**
- Product details & prices
- Ingredients and how to use
- Shipping, returns & orders
- Morning or night routines

Or browse our [product collection](/products) or take the [skincare quiz](/quiz) for personalised picks.`;
}

export function formatSingleAnswer(entry: KbEntry): string {
  const lead = entry.category !== "Brand" ? `**${entry.category}**\n\n` : "";
  return `${lead}${enrichText(entry.answer)}`;
}

export function formatMultipleAnswers(hits: KbEntry[], overview: boolean): string {
  if (!overview && hits.length === 1) {
    return formatSingleAnswer(hits[0]);
  }

  const grouped = new Map<string, KbEntry[]>();
  for (const hit of hits) {
    const list = grouped.get(hit.category) ?? [];
    list.push(hit);
    grouped.set(hit.category, list);
  }

  const sections: string[] = [];
  if (overview) {
    sections.push("Here's a quick overview of **KindSkin Co.** products:\n");
  } else {
    sections.push("Here's what I found:\n");
  }

  for (const [category, entries] of grouped) {
    sections.push(`### ${category}\n`);
    for (const entry of entries) {
      sections.push(`- ${enrichText(entry.answer)}`);
    }
    sections.push("");
  }

  if (overview) {
    sections.push("Want details on one product? Just ask — e.g. *\"tell me about lip balm\"*.");
  }

  return sections.join("\n").trim();
}

/** Simulate ChatGPT-style typing by splitting into word chunks */
export function chunkForStreaming(text: string): string[] {
  const tokens = text.match(/\S+\s*|\n/g) ?? [text];
  return tokens.length ? tokens : [text];
}
