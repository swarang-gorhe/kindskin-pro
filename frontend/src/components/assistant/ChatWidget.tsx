"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { localChatStream } from "@/lib/chat-fallback";
import type { ChatStreamEvent } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type ProductLink = { slug: string; name: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ProductLink[];
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm KindSkin's skincare assistant. Ask me about ingredients, products, shipping, or routines.",
    },
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
            "I can help with Aloe Vera Gel (₹100), Lip Balm (₹50), and Abhyang Tel (₹120), plus shipping and skincare tips. What would you like to know?",
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
        <div className="fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl bg-white shadow-2xl border border-forest/10 overflow-hidden">
          <div className="bg-forest px-4 py-3">
            <p className="text-sm font-medium text-cream">KindSkin Assistant</p>
          </div>

          <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-forest text-cream"
                      : "bg-cream-dark text-forest"
                  }`}
                >
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="flex items-center gap-2 text-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      One moment…
                    </span>
                  ) : null)}
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.products.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        className="rounded-full border border-forest/15 bg-white px-3 py-1 text-xs font-medium text-forest hover:bg-forest hover:text-cream transition-colors"
                      >
                        {p.name} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-forest/5 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skincare..."
              className="flex-1 rounded-full bg-cream px-4 py-2 text-sm text-forest placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-forest/20"
              disabled={loading}
            />
            <Button type="submit" size="sm" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
