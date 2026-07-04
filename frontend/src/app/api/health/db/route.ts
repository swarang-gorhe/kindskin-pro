import { getServiceSupabase } from "@/lib/admin-server/auth";
import { isServiceKeyConfigured } from "@/lib/admin-server/env";

/** Public health check — does not expose secrets. */
export async function GET() {
  const configured = isServiceKeyConfigured();
  const service = getServiceSupabase();

  let connected = false;
  let productCount = 0;
  let error: string | null = null;

  if (service) {
    const { count, error: qErr } = await service
      .from("products")
      .select("id", { count: "exact", head: true });
    connected = !qErr;
    productCount = count ?? 0;
    error = qErr?.message ?? null;
  }

  return Response.json({
    service_key_configured: configured,
    database_connected: connected,
    product_count: productCount,
    error,
    vercel_env: process.env.VERCEL_ENV ?? "unknown",
    git_sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  });
}
