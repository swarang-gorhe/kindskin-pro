import {
  verifyAdminRequest,
  unauthorized,
  badRequest,
} from "@/lib/admin-server/auth";
import { updateProduct, deactivateProduct } from "@/lib/admin-server/products";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const { id } = await context.params;
  try {
    const body = await request.json();
    const product = await updateProduct(id, body);
    return Response.json({ status: "ok", product });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Update failed");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const { id } = await context.params;
  try {
    const product = await deactivateProduct(id);
    return Response.json({ status: "ok", product });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Deactivate failed");
  }
}
