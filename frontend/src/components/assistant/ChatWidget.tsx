"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { localChatStream } from "@/lib/chat-fallback";
import type { ChatStreamEvent } from "@/lib/api";
import { ChatMarkdown } from "@/components/assistant/ChatMarkdown";
import { Button } from "@/components/ui/Button";

type ProductLink = { slug: string; name: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ProductLink[];
};

const WELCOME =
  "Hi! I'm KindSkin's skincare assistant. Ask me about **products**, **ingredients**, **shipping**, or **daily routines**.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    let assistantContent = "";
    let products: ProductLink[] = [];

    setMessages((prev) => [...prev, { role: "assistant", content: "", products: [] }]);

    function handleEvent(event: ChatStreamEvent) {
      if (event.type === "product") {
        products = [...products, { slug: event.slug, name: event.name }];
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
            products: [...products],
          };
          return updated;
        });
        return;
      }
      if (event.type === "token") {
        assistantContent += event.content;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
            products: [...products],
          };
          return updated;
        });
      }
    }

    try {
      for await (const event of localChatStream(userMsg)) {
        handleEvent(event as ChatStreamEvent);
      }
      if (!assistantContent.trim()) {
        throw new Error("empty response");
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "Here’s a quick snapshot:\n\n- **Aloe Vera Gel** — **₹100**\n- **Lip Balm** — **₹50**\n- **Abhyang Tel** — **₹120**\n\nAsk me anything about these, or visit [our products](/products).",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream shadow-lg hover:bg-forest-light transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        aria-label={open ? "Close chat" : "Open skincare assistant"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-1.5rem,420px)] flex-col rounded-2xl bg-white shadow-2xl border border-forest/10 overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-forest/5 bg-cream/80 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-cream">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-forest">KindSkin Assistant</p>
          </div>

          <div className="flex-1 max-h-[min(70vh,28rem)] overflow-y-auto px-4 py-4 space-y-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`min-w-0 flex-1 ${msg.role === "user" ? "flex justify-end" : ""}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[88%] rounded-2xl rounded-tr-md bg-forest px-3.5 py-2.5 text-[13.5px] leading-relaxed text-cream">
                      {msg.content}
                    </div>
                  ) : msg.content ? (
                    <div className="rounded-2xl rounded-tl-md bg-cream/60 px-3.5 py-3 border border-forest/5">
                      <ChatMarkdown content={msg.content} />
                    </div>
                  ) : loading && i === messages.length - 1 ? (
                    <div className="flex items-center gap-2 px-1 py-2 text-sm text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking…</span>
                    </div>
                  ) : null}

                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {msg.products.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/products/${p.slug}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-forest/10 bg-white px-2.5 py-1.5 text-xs font-medium text-forest shadow-sm hover:bg-forest hover:text-cream transition-colors"
                        >
                          {p.name}
                          <span aria-hidden>→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 border-t border-forest/5 bg-white p-3"
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Message KindSkin Assistant…"
              className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-forest/10 bg-cream/50 px-3.5 py-2.5 text-sm text-forest placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest/15"
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              className="h-[42px] w-[42px] shrink-0 rounded-xl p-0"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
