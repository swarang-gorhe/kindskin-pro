import {
  verifyAdminRequest,
  unauthorized,
  getServiceSupabase,
} from "@/lib/admin-server/auth";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const keyConfigured = Boolean(process.env.SUPABASE_SERVICE_KEY?.trim());
  const service = getServiceSupabase();

  if (!service) {
    return Response.json({
      ok: false,
      service_key_configured: keyConfigured,
      database_connected: false,
      product_count: 0,
      discount_count: 0,
      data_source: "live_catalog",
      hint: keyConfigured
        ? "SUPABASE_SERVICE_KEY is set but invalid. Use the Service role key (not publishable/anon). Redeploy after fixing."
        : "SUPABASE_SERVICE_KEY missing on this deployment. Add it in Vercel → redeploy (env vars do not apply until redeploy).",
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
