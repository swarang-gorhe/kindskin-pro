const DEFAULT_BACKEND = "https://ftw9rcd4.up.railway.app";

/** Resolve API path — browser uses same-origin proxy to avoid CORS and localhost baked at build. */
export function resolveApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const subPath = normalized.replace(/^\/api\//, "");

  if (typeof window !== "undefined") {
    return `/backend-api/${subPath}`;
  }

  const backend =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND;
  return `${backend.replace(/\/$/, "")}/api/${subPath}`;
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BACKEND;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(resolveApiPath(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export type ChatStreamEvent =
  | { type: "status"; phase: "retrieving" | "generating" }
  | { type: "token"; content: string }
  | { type: "product"; slug: string; name: string }
  | { type: "done"; sources?: unknown[]; cached?: boolean; model?: string | null };

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "kindskin-chat-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export async function* streamChat(
  path: string,
  body: { message: string; history?: unknown[] }
): AsyncGenerator<ChatStreamEvent> {
  const res = await fetch(resolveApiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: body.message,
      sessionId: getSessionId(),
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream error: ${res.status}`);
  }

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
        // skip malformed lines
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
}
