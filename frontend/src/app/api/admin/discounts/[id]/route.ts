import {
  verifyAdminRequest,
  unauthorized,
  badRequest,
} from "@/lib/admin-server/auth";
import {
  deleteDiscount,
  updateDiscount,
} from "@/lib/admin-server/discounts";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const { id } = await params;
  try {
    const body = await request.json();
    const discount = await updateDiscount(id, body);
    return Response.json({ status: "ok", discount });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Update failed");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const { id } = await params;
  try {
    await deleteDiscount(id);
    return Response.json({ status: "ok" });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Delete failed");
  }
}
