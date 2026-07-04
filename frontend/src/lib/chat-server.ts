import kbEntries from "@/data/knowledge-base.json";
import type { KbEntry } from "@/lib/chat-fallback-types";
import { chunkForStreaming } from "@/lib/chat-format";
import { localChatAnswer } from "@/lib/chat-fallback";

type HistoryMessage = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are KindSkin Co.'s skincare assistant — warm, concise, and knowledgeable.
KindSkin sells natural skincare: Aloe Vera Gel (₹100), Nourishing Lip Balm (₹50), Abhyang Tel massage oil (₹120).
Use the knowledge context provided. Never repeat the same greeting twice in a conversation.
Be specific to the user's question. Use markdown sparingly (**bold** for product names and prices).
If you don't know, suggest browsing /products or the skincare quiz at /quiz.`;

async function callOpenAI(
  message: string,
  history: HistoryMessage[],
  context: string
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const messages = [
    { role: "system", content: `${SYSTEM}\n\nKnowledge base:\n${context}` },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function pickKbContext(message: string, limit = 4): string {
  const { content } = localChatAnswer(message);
  const hits = (kbEntries as KbEntry[])
    .filter((e) => {
      const q = message.toLowerCase();
      return (
        e.question.toLowerCase().includes(q.slice(0, 20)) ||
        e.category.toLowerCase().includes(q) ||
        e.answer.toLowerCase().includes(q.split(" ")[0] ?? "")
      );
    })
    .slice(0, limit);

  if (hits.length) {
    return hits.map((h) => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");
  }
  return content.slice(0, 1200);
}

function contextualFallback(
  message: string,
  history: HistoryMessage[]
): { content: string; products: ReturnType<typeof localChatAnswer>["products"] } {
  const priorAssistant = history
    .filter((m) => m.role === "assistant")
    .map((m) => m.content);

  const result = localChatAnswer(message);

  if (
    priorAssistant.some((p) => p.includes(result.content.slice(0, 80))) &&
    result.content.length > 100
  ) {
    const lower = message.toLowerCase();
    if (lower.includes("aloe")) {
      return {
        content:
          "**Aloe Vera Gel** is our bestseller for daily hydration — pure aloe, lightweight, **₹100**.\n\nGreat for face, body, and post-sun soothing. [View product](/products/aloe-vera-gel)",
        products: [{ slug: "aloe-vera-gel", name: "Aloe Vera Gel" }],
      };
    }
    if (lower.includes("lip")) {
      return {
        content:
          "**Nourishing Lip Balm** keeps lips soft all day — **₹50**, available in Strawberry, Apple, Mango, Vanilla & Chocolate.\n\n[View lip balm](/products/lip-balm)",
        products: [{ slug: "lip-balm", name: "Nourishing Lip Balm" }],
      };
    }
    if (lower.includes("abhyang") || lower.includes("oil") || lower.includes("tel")) {
      return {
        content:
          "**Abhyang Tel** is our Ayurvedic massage oil for body nourishment — **₹120**.\n\nPerfect for self-massage and daily wellness. [View Abhyang Tel](/products/abhyang-tel)",
        products: [{ slug: "abhyang-tel", name: "Abhyang Tel" }],
      };
    }
    return {
      content: `I'd love to help with something more specific! Try:\n\n- *"What's in the lip balm?"*\n- *"How do I use aloe vera gel?"*\n- *"Shipping and returns policy"*`,
      products: [],
    };
  }

  return result;
}

export async function generateChatReply(
  message: string,
  history: HistoryMessage[] = []
): Promise<{ content: string; products: Array<{ slug: string; name: string }> }> {
  const context = pickKbContext(message);
  const aiReply = await callOpenAI(message, history, context);

  if (aiReply) {
    const { products } = localChatAnswer(message);
    return { content: aiReply, products };
  }

  return contextualFallback(message, history);
}

export async function* streamChatReply(
  message: string,
  history: HistoryMessage[] = []
): AsyncGenerator<
  | { type: "status"; phase: "retrieving" | "generating" }
  | { type: "token"; content: string }
  | { type: "product"; slug: string; name: string }
  | { type: "done"; sources: unknown[]; cached: boolean }
> {
  yield { type: "status", phase: "retrieving" };
  await new Promise((r) => setTimeout(r, 200));

  const { content, products } = await generateChatReply(message, history);

  yield { type: "status", phase: "generating" };

  for (const product of products) {
    yield { type: "product", ...product };
  }

  for (const chunk of chunkForStreaming(content)) {
    yield { type: "token", content: chunk };
    await new Promise((r) => setTimeout(r, chunk.includes("\n") ? 30 : 14));
  }

  yield { type: "done", sources: [], cached: !process.env.OPENAI_API_KEY };
}
