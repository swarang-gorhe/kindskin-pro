import { streamChatReply } from "@/lib/chat-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message ?? "").trim();
    if (!message) {
      return Response.json({ error: "Message required" }, { status: 400 });
    }

    const history = Array.isArray(body.history) ? body.history : [];

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of streamChatReply(message, history)) {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          }
        } catch {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "token",
                content: "I'm having trouble right now. Please try again or visit our [products](/products) page.",
              }) + "\n"
            )
          );
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "done", sources: [], cached: true }) + "\n")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}
