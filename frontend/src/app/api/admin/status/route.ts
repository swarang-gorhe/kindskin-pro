import {
  verifyAdminRequest,
  unauthorized,
  getServiceSupabase,
} from "@/lib/admin-server/auth";
import { isServiceKeyConfigured } from "@/lib/admin-server/env";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const keyConfigured = isServiceKeyConfigured();
  const service = getServiceSupabase();

  if (!service) {
    return Response.json({
      ok: false,
      service_key_configured: keyConfigured,
      database_connected: false,
      product_count: 0,
      discount_count: 0,
      data_source: "live_catalog",
      vercel_env: process.env.VERCEL_ENV ?? "unknown",
      hint: keyConfigured
        ? "Key is set but Supabase rejected it. Use Service role key from Supabase → Settings → API (starts with sb_secret_ or eyJ…). Not the publishable/anon key."
        : "SUPABASE_SERVICE_KEY not visible to this deployment. In Vercel: Settings → Environment Variables → add for Production → Deployments → Redeploy (not just Save).",
    });
  }

  const [productsRes, discountsRes] = await Promise.all([
    service.from("products").select("id", { count: "exact", head: true }),
    service.from("discounts").select("id", { count: "exact", head: true }),
  ]);

  const productsOk = !productsRes.error;
  const discountsOk = !discountsRes.error;

  return Response.json({
    ok: productsOk,
    service_key_configured: true,
    database_connected: productsOk,
    product_count: productsRes.count ?? 0,
    discount_count: discountsRes.count ?? 0,
    data_source: productsOk && (productsRes.count ?? 0) > 0 ? "database" : "live_catalog",
    products_error: productsRes.error?.message ?? null,
    discounts_error: discountsRes.error?.message ?? null,
    hint: productsOk
      ? "Database connected. Admin should show synced products."
      : `Database error: ${productsRes.error?.message ?? "unknown"}. Check SUPABASE_SERVICE_KEY is the Service role key.`,
  });
}
