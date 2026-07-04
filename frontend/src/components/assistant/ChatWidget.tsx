"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { customerChatStream } from "@/lib/customer-chat";
import type { ChatStreamEvent } from "@/lib/api";
import { ChatPanel, ChatFab, type ChatPanelMessage } from "@/components/chat/ChatPanel";

const WELCOME =
  "Hi! I'm your **KindSkin** skincare guide. Ask about products, ingredients, routines, or shipping.";

const SUGGESTIONS = [
  "What products do you sell?",
  "Aloe vera gel price",
  "Lip balm flavours",
  "Shipping policy",
];

export function ChatWidget() {
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

    let assistantContent = "";
    let products: ChatPanelMessage["products"] = [];

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", products: [] },
    ]);

    function handleEvent(event: ChatStreamEvent) {
      if (event.type === "product") {
        products = [...(products ?? []), { slug: event.slug, name: event.name }];
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
            products: [...(products ?? [])],
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
            products: [...(products ?? [])],
          };
          return updated;
        });
      }
    }

    try {
      for await (const event of customerChatStream(userMsg, history)) {
        handleEvent(event);
      }
      if (!assistantContent.trim()) throw new Error("empty");
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "I can help with **Aloe Vera Gel** (₹100), **Lip Balm** (₹50), and **Abhyang Tel** (₹120). What would you like to know?",
          products: [
            { slug: "aloe-vera-gel", name: "Aloe Vera Gel" },
            { slug: "lip-balm", name: "Lip Balm" },
            { slug: "abhyang-tel", name: "Abhyang Tel" },
          ],
        };
        return updated;
      });
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
        label="Ask KindSkin"
        icon={<Sparkles size={16} />}
      />

      <ChatPanel
        open={open}
        onClose={() => setOpen(false)}
        title="KindSkin Guide"
        subtitle="Skincare · Products · Tips"
        avatar={<Sparkles size={14} />}
        messages={messages}
        loading={loading}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSend}
        placeholder="Ask about products, ingredients, shipping…"
        suggestions={messages.length <= 2 ? SUGGESTIONS : undefined}
        onSuggestion={(s) => sendMessage(s)}
      />
    </>
  );
}
