import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/admin-auth";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/utils/supabase/config";
import { resolveServiceKey } from "@/lib/admin-server/env";

export type AdminContext = { user: User; userId: string };

export async function verifyAdminRequest(
  request: Request
): Promise<AdminContext | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7).trim();
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user || !isAdminUser(user, null)) return null;
  return { user, userId: user.id };
}

export function getServiceSupabase(): SupabaseClient | null {
  const key = resolveServiceKey();
  if (!key || !SUPABASE_URL) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function unauthorized() {
  return Response.json({ detail: "Admin access required" }, { status: 403 });
}

export function notFound(message = "Not found") {
  return Response.json({ detail: message }, { status: 404 });
}

export function badRequest(message: string) {
  return Response.json({ detail: message }, { status: 400 });
}

export const LOW_STOCK_THRESHOLD = 10;

export const EMPTY_DASHBOARD = {
  orders_today: 0,
  orders_this_week: 0,
  revenue_this_week: 0,
  revenue_this_month: 0,
  low_stock_threshold: LOW_STOCK_THRESHOLD,
  low_stock_count: 0,
  low_stock_products: [] as Array<{
    id: string;
    slug: string;
    name: string;
    stock_quantity: number;
    image: string;
    category: string;
  }>,
  recent_orders: [] as Array<{
    order_id: string;
    customer_name: string;
    customer_email: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string | null;
  }>,
  data_source: "fallback" as const,
  backend_online: false,
};
