import { verifyAdminRequest, unauthorized } from "@/lib/admin-server/auth";
import { fetchDashboardSummary } from "@/lib/admin-server/data";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const summary = await fetchDashboardSummary();
  return Response.json(summary);
}
