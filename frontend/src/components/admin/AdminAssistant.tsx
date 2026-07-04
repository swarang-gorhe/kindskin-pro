"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { adminFetch, AdminApiError } from "@/lib/admin-api";
import { ChatPanel, ChatFab, type ChatPanelMessage } from "@/components/chat/ChatPanel";

const WELCOME = `Hello! I'm **Jarvis**, your KindSkin admin assistant.

I can handle products, orders, discounts, and dashboard insights — just ask naturally.

Try: *"List all products"* or *"Create a 15% coupon SAVE15"*`;

const SUGGESTIONS = [
  "List all products",
  "Show dashboard",
  "Recent orders",
  "Create 10% coupon",
];

export function AdminAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatPanelMessage[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  return (
    <>
      <ChatFab
        open={open}
        onClick={() => setOpen(!open)}
        label="Jarvis"
        icon={<Bot size={16} />}
      />

      <ChatPanel
        open={open}
        onClose={() => setOpen(false)}
        title="Jarvis"
        subtitle="Admin · Products · Orders · Discounts"
        avatar={<Bot size={14} />}
        messages={messages}
        loading={loading}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSend}
        placeholder="Ask Jarvis to manage your store…"
        suggestions={messages.length <= 2 ? SUGGESTIONS : undefined}
        onSuggestion={(s) => sendMessage(s)}
      />
    </>
  );
}
