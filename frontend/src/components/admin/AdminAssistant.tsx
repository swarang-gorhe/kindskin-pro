"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { adminFetch, AdminApiError } from "@/lib/admin-api";
import { ChatMarkdown } from "@/components/assistant/ChatMarkdown";
import { Button } from "@/components/ui/Button";

type Message = {
  role: "user" | "assistant";
  content: string;
  actions?: Array<{ tool: string; success: boolean; summary: string }>;
};

const WELCOME = `Hello! I'm your **KindSkin Admin Agent**.

I can manage your store for you:

- **Products** — add, edit names & images, adjust stock
- **Orders** — check status and recent orders
- **Discounts** — generate coupon codes
- **Dashboard** — revenue & low-stock alerts

Try: *"List all products"* or *"Create a 15% coupon SAVE15"*`;

export function AdminAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await adminFetch<{
        reply: string;
        actions: Array<{ tool: string; success: boolean; summary: string }>;
      }>("/api/admin/assistant", {
        method: "POST",
        body: JSON.stringify({ message: userMsg, history }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          actions: res.actions,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            (err as AdminApiError).message ||
            "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-forest pl-5 pr-6 text-cream shadow-[0_8px_32px_rgba(45,62,47,0.25)] hover:bg-forest-light transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        aria-label={open ? "Close admin assistant" : "Open admin assistant"}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI Agent</span>
          </>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-1.5rem,440px)] flex-col rounded-2xl bg-white shadow-[0_24px_64px_rgba(45,62,47,0.18)] border border-forest/10 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-forest/5 bg-gradient-to-r from-cream to-sage/5 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-forest">Admin Agent</p>
              <p className="text-xs text-muted">Products · Orders · Discounts</p>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 max-h-[min(70vh,32rem)] overflow-y-auto px-5 py-5 space-y-5"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/8 text-forest">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`min-w-0 flex-1 ${msg.role === "user" ? "flex justify-end" : ""}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[88%] rounded-2xl rounded-tr-md bg-forest px-4 py-2.5 text-[13.5px] leading-relaxed text-cream">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded-2xl rounded-tl-md bg-cream/70 px-4 py-3 border border-forest/5">
                        <ChatMarkdown content={msg.content} />
                      </div>
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="space-y-1.5">
                          {msg.actions.map((a, j) => (
                            <div
                              key={j}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                                a.success
                                  ? "bg-green-50 text-green-800 border border-green-100"
                                  : "bg-amber-50 text-amber-900 border border-amber-100"
                              }`}
                            >
                              {a.success ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <AlertCircle size={14} />
                              )}
                              <span className="font-medium">{a.tool}</span>
                              <span className="text-current/80">{a.summary}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-1 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Working on it…</span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 border-t border-forest/5 bg-white p-4"
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
              placeholder="Ask me to add products, check orders, create coupons…"
              className="max-h-24 min-h-[44px] flex-1 resize-none rounded-xl border border-forest/10 bg-cream/50 px-4 py-2.5 text-sm text-forest placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest/15"
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              className="h-[44px] w-[44px] shrink-0 rounded-xl p-0"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
