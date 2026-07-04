import {
  verifyAdminRequest,
  unauthorized,
  badRequest,
} from "@/lib/admin-server/auth";
import { runAdminAssistant } from "@/lib/admin-server/assistant";

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const message = String(body.message ?? "").trim();
    if (!message) return badRequest("Message is required");

    const history = Array.isArray(body.history) ? body.history : [];
    const result = await runAdminAssistant(message, history);

    return Response.json(result);
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Assistant request failed"
    );
  }
}
