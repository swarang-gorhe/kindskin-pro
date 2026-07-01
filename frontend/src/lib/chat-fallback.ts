import kbEntries from "@/data/knowledge-base.json";

type KbEntry = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "need", "i", "me",
  "my", "we", "our", "you", "your", "it", "its", "they", "them", "their",
  "this", "that", "these", "those", "am", "to", "of", "in", "for", "on",
  "with", "at", "by", "from", "as", "into", "about", "what", "how", "when",
  "where", "who", "which", "why", "give", "tell", "please", "get", "show",
]);

const GREETINGS = new Set([
  "hi", "hello", "hey", "hiya", "howdy", "good", "morning", "evening", "afternoon",
]);

const PRODUCT_OVERVIEW_PHRASES = [
  "product detail",
  "product info",
  "your product",
  "what product",
  "what do you sell",
  "what products",
  "tell me about your product",
  "show me product",
  "all product",
  "kindskin product",
];

const PRODUCT_SUMMARY_IDS = [
  "aloe-001",
  "aloe-006",
  "lip-001",
  "lip-005",
  "abhyang-001",
  "abhyang-004",
];

const CATEGORY_TO_PRODUCT: Record<string, { slug: string; name: string }> = {
  "Aloe Vera Gel": { slug: "aloe-vera-gel", name: "Aloe Vera Gel" },
  "Lip Balm": { slug: "lip-balm", name: "Nourishing Lip Balm" },
  "Abhyang Tel": { slug: "abhyang-tel", name: "Abhyang Tel" },
};

const FALLBACK =
  "I'm here to help with KindSkin products, ingredients, shipping, and skincare tips. Try asking about Aloe Vera Gel, Lip Balm, Abhyang Tel, or our shipping policy — or take our quiz at /quiz.";

const GREETING_REPLY =
  "Hello! Welcome to KindSkin Co. I can help with our products (Aloe Vera Gel ₹100, Lip Balm ₹50, Abhyang Tel ₹120), ingredients, shipping, returns, and daily skincare routines. What would you like to know?";

/** Fix common typos before search */
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/alovera|aloevera|aloevar|alovera/g, "aloe vera")
    .replace(/lipbalm/g, "lip balm")
    .replace(/abhyangtel/g, "abhyang tel")
    .replace(/how much/g, "price");
}

function tokenize(text: string): Set<string> {
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return new Set(tokens.filter((t) => !STOPWORDS.has(t) && t.length > 1));
}

function isGreeting(query: string): boolean {
  const normalized = normalizeQuery(query).trim();
  if (["hi", "hello", "hey", "hi!", "hello!"].includes(normalized)) return true;
  const tokens = tokenize(normalized);
  return tokens.size > 0 && [...tokens].every((t) => GREETINGS.has(t));
}

function isProductOverview(query: string): boolean {
  const normalized = normalizeQuery(query).trim();
  if (normalized === "product" || normalized === "products") return true;
  return PRODUCT_OVERVIEW_PHRASES.some((p) => normalized.includes(p));
}

function productOverviewAnswer(): string {
  const byId = Object.fromEntries((kbEntries as KbEntry[]).map((e) => [e.id, e]));
  return PRODUCT_SUMMARY_IDS.map((id) => byId[id]?.answer)
    .filter(Boolean)
    .join("\n\n");
}

function keywordSearch(query: string, topK = 5): KbEntry[] {
  const normalized = normalizeQuery(query);

  if (isProductOverview(normalized)) {
    const byId = Object.fromEntries((kbEntries as KbEntry[]).map((e) => [e.id, e]));
    return PRODUCT_SUMMARY_IDS.map((id) => byId[id]).filter(Boolean) as KbEntry[];
  }

  const queryTokens = tokenize(normalized);
  if (queryTokens.size === 0) return [];

  const priceIntent =
    normalized.includes("price") ||
    normalized.includes("how much") ||
    normalized.includes("cost") ||
    [...queryTokens].some((t) => ["price", "cost", "much"].includes(t));

  const scored = (kbEntries as KbEntry[])
    .map((entry) => {
      const qTokens = tokenize(entry.question);
      const aTokens = tokenize(entry.answer);
      const cTokens = tokenize(entry.category);

      let score =
        [...queryTokens].filter((t) => qTokens.has(t)).length * 3 +
        [...queryTokens].filter((t) => aTokens.has(t)).length +
        [...queryTokens].filter((t) => cTokens.has(t)).length * 2.5;

      // Fuzzy: "aloe" + "gel" in query matches Aloe Vera Gel entries
      if (queryTokens.has("aloe") || queryTokens.has("vera") || normalized.includes("aloe vera")) {
        if (entry.category === "Aloe Vera Gel") score += 5;
      }
      if (queryTokens.has("lip") || queryTokens.has("balm")) {
        if (entry.category === "Lip Balm") score += 5;
      }
      if (queryTokens.has("abhyang") || queryTokens.has("tel") || queryTokens.has("oil")) {
        if (entry.category === "Abhyang Tel") score += 5;
      }

      const qLower = entry.question.toLowerCase();
      if (priceIntent && (qLower.includes("price") || qLower.includes("cost") || qLower.includes("how much"))) {
        score += 6;
      }

      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (priceIntent) {
    const priceHits = scored
      .filter(({ entry }) => {
        const q = entry.question.toLowerCase();
        return q.includes("price") || q.includes("cost") || q.includes("how much");
      })
      .map(({ entry }) => entry);
    if (priceHits.length) return priceHits.slice(0, topK);
  }

  return scored.slice(0, topK).map(({ entry }) => entry);
}

function relatedProducts(entries: KbEntry[]): { slug: string; name: string }[] {
  const seen = new Set<string>();
  const products: { slug: string; name: string }[] = [];
  for (const entry of entries) {
    const product = CATEGORY_TO_PRODUCT[entry.category];
    if (product && !seen.has(product.slug)) {
      seen.add(product.slug);
      products.push(product);
    }
  }
  return products;
}

export function localChatAnswer(message: string): {
  content: string;
  products: { slug: string; name: string }[];
} {
  if (isGreeting(message)) {
    return { content: GREETING_REPLY, products: [] };
  }

  const hits = keywordSearch(message);
  if (!hits.length) {
    return { content: FALLBACK, products: [] };
  }

  const products = relatedProducts(hits);
  const content =
    hits.length > 1 && isProductOverview(message)
      ? hits.map((h) => h.answer).join("\n\n")
      : hits.slice(0, 3).map((h) => h.answer).join("\n\n");

  return { content, products };
}

export async function* localChatStream(
  message: string
): AsyncGenerator<
  | { type: "status"; phase: "retrieving" | "generating" }
  | { type: "token"; content: string }
  | { type: "product"; slug: string; name: string }
  | { type: "done"; sources: unknown[]; cached: boolean }
> {
  yield { type: "status", phase: "retrieving" };
  const { content, products } = localChatAnswer(message);
  for (const product of products) {
    yield { type: "product", ...product };
  }
  yield { type: "token", content };
  yield { type: "done", sources: [], cached: true };
}
