import {
  verifyAdminRequest,
  unauthorized,
  badRequest,
} from "@/lib/admin-server/auth";
import {
  createDiscount,
  listDiscounts,
} from "@/lib/admin-server/discounts";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  try {
    const result = await listDiscounts();
    return Response.json(result);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Failed to load discounts");
  }
}

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const discount = await createDiscount(body);
    return Response.json({ status: "ok", discount });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Failed to create discount");
  }
}
