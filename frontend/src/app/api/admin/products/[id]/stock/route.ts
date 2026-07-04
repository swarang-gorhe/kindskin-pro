import {
  verifyAdminRequest,
  unauthorized,
  badRequest,
} from "@/lib/admin-server/auth";
import { adjustProductStock } from "@/lib/admin-server/products";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const { id } = await context.params;
  try {
    const body = await request.json();
    const product = await adjustProductStock(
      id,
      Number(body.change_amount ?? 0),
      String(body.note ?? "Stock adjustment"),
      String(body.reason ?? "manual_adjustment")
    );
    return Response.json({ status: "ok", product });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Stock update failed");
  }
}
