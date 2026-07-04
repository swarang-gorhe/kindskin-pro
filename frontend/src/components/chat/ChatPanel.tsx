"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { ChatMarkdown } from "@/components/assistant/ChatMarkdown";
import { cn } from "@/lib/utils";

export type ChatPanelMessage = {
  role: "user" | "assistant";
  content: string;
  products?: Array<{ slug: string; name: string }>;
  actions?: Array<{ tool: string; success: boolean; summary: string }>;
};

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  avatar: ReactNode;
  messages: ChatPanelMessage[];
  loading?: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestion?: (text: string) => void;
  productLinkPrefix?: string;
  footer?: ReactNode;
};

export function ChatPanel({
  open,
  onClose,
  title,
  subtitle,
  avatar,
  messages,
  loading,
  input,
  onInputChange,
  onSubmit,
  placeholder = "Message…",
  suggestions,
  onSuggestion,
  productLinkPrefix = "/products",
  footer,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
        aria-hidden
      />

      <div className="chat-panel pointer-events-auto relative flex w-full max-w-[440px] flex-col sm:max-h-[min(85vh,640px)] max-h-[92vh] animate-chat-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-forest-light text-cream shadow-sm">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-forest tracking-tight">{title}</p>
            {subtitle && (
              <p className="text-[12px] text-muted truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-muted hover:bg-black/[0.08] hover:text-forest transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-4 overscroll-contain"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2.5",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              {msg.role === "assistant" && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-forest">
                  {avatar}
                </div>
              )}

              <div
                className={cn(
                  "min-w-0 flex-1",
                  msg.role === "user" && "flex justify-end"
                )}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-[20px] rounded-br-md bg-forest px-4 py-2.5 text-[14px] leading-[1.45] text-cream">
                    {msg.content}
                  </div>
                ) : msg.content ? (
                  <div className="space-y-2">
                    <div className="rounded-[20px] rounded-bl-md bg-black/[0.04] px-4 py-3 text-[14px] leading-[1.5]">
                      <ChatMarkdown content={msg.content} />
                    </div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="space-y-1">
                        {msg.actions.map((a, j) => (
                          <div
                            key={j}
                            className={cn(
                              "flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]",
                              a.success
                                ? "bg-green-500/8 text-green-800"
                                : "bg-amber-500/8 text-amber-900"
                            )}
                          >
                            <span className="font-semibold">{a.tool}</span>
                            <span className="opacity-80">{a.summary}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : loading && i === messages.length - 1 ? (
                  <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex gap-1">
                      <span className="chat-dot" />
                      <span className="chat-dot animation-delay-150" />
                      <span className="chat-dot animation-delay-300" />
                    </div>
                  </div>
                ) : null}

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.products.map((p) => (
                      <a
                        key={p.slug}
                        href={`${productLinkPrefix}/${p.slug}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-black/[0.08] px-3 py-1.5 text-[12px] font-medium text-forest shadow-sm hover:bg-forest hover:text-cream transition-all duration-200"
                      >
                        {p.name}
                        <span aria-hidden className="opacity-50">→</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 px-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />
              <span className="text-[12px] text-muted">Thinking…</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && !loading && (
          <div className="px-5 pb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestion?.(s)}
                className="rounded-full border border-black/[0.08] bg-white/80 px-3 py-1.5 text-[11px] font-medium text-forest hover:bg-forest hover:text-cream transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 border-t border-black/[0.06] px-4 py-3.5"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            placeholder={placeholder}
            className="chat-input max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl px-4 py-3 text-[14px] text-forest placeholder:text-muted/70"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest text-cream shadow-sm hover:bg-forest-light disabled:opacity-40 transition-all duration-200 active:scale-95"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>

        {footer && (
          <div className="px-5 pb-3 text-center">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ChatFab({
  open,
  onClick,
  label,
  icon,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full shadow-apple-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]",
        open
          ? "h-12 w-12 justify-center bg-white text-forest border border-black/[0.08]"
          : "h-12 pl-4 pr-5 bg-forest text-cream"
      )}
      aria-label={open ? "Close chat" : `Open ${label}`}
    >
      {open ? <X size={18} /> : (
        <>
          {icon}
          <span className="text-[13px] font-semibold tracking-tight">{label}</span>
        </>
      )}
    </button>
  );
}
