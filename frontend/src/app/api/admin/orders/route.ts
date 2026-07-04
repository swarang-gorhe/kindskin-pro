import { verifyAdminRequest, unauthorized } from "@/lib/admin-server/auth";
import { fetchAdminOrders } from "@/lib/admin-server/data";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const { searchParams } = new URL(request.url);
  const result = await fetchAdminOrders({
    status: searchParams.get("status"),
    search: searchParams.get("search"),
    limit: Number(searchParams.get("limit") ?? 50),
    offset: Number(searchParams.get("offset") ?? 0),
  });

  return Response.json(result);
}
