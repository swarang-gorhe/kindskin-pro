import type { ChatStreamEvent } from "@/lib/api";
import { localChatStream } from "@/lib/chat-fallback";

type HistoryMessage = { role: "user" | "assistant"; content: string };

export async function* customerChatStream(
  message: string,
  history: HistoryMessage[] = []
): AsyncGenerator<ChatStreamEvent> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok || !res.body) throw new Error("chat api unavailable");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          yield JSON.parse(line) as ChatStreamEvent;
        } catch {
          // skip
        }
      }
    }

    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer) as ChatStreamEvent;
      } catch {
        // ignore
      }
    }
  } catch {
    yield* localChatStream(message);
  }
}
