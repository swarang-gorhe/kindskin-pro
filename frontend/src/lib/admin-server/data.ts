import { getLiveCatalogProducts } from "@/lib/catalog-fallback";
import { getServiceSupabase } from "@/lib/admin-server/auth";
import type { AdminProduct } from "@/lib/admin-api";

function mapDbRow(row: Record<string, unknown>): AdminProduct {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: String(row.tagline ?? ""),
    description: String(row.description ?? ""),
    short_description: String(row.short_description ?? ""),
    price: Number(row.price),
    category: String(row.category ?? "General"),
    image: String(row.image ?? ""),
    images: (row.images as string[]) ?? [],
    benefits: (row.benefits as string[]) ?? [],
    stock_quantity: Number(row.stock_quantity ?? 0),
    is_active: Boolean(row.is_active ?? true),
    rating: Number(row.rating ?? 4.5),
    review_count: Number(row.review_count ?? 0),
  };
}

export async function fetchAdminProducts(): Promise<{
  products: AdminProduct[];
  source: "database" | "live_catalog";
}> {
  const service = getServiceSupabase();
  if (!service) {
    return { products: getLiveCatalogProducts(), source: "live_catalog" };
  }

  const { data, error } = await service
    .from("products")
    .select(
      "id, slug, name, tagline, description, short_description, price, category, image, images, benefits, stock_quantity, is_active, rating, review_count"
    )
    .order("name");

  if (error?.code === "PGRST205" || !data?.length) {
    return { products: getLiveCatalogProducts(), source: "live_catalog" };
  }

  if (error) {
    return { products: getLiveCatalogProducts(), source: "live_catalog" };
  }

  return {
    products: data.map((row) => mapDbRow(row as Record<string, unknown>)),
    source: "database",
  };
}

export async function fetchDashboardSummary() {
  const { products, source } = await fetchAdminProducts();
  const service = getServiceSupabase();

  const lowStock = products.filter(
    (p) => p.is_active && p.stock_quantity < 10
  );

  const base = {
    orders_today: 0,
    orders_this_week: 0,
    revenue_this_week: 0,
    revenue_this_month: 0,
    low_stock_threshold: 10,
    low_stock_count: lowStock.length,
    low_stock_products: lowStock.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      stock_quantity: p.stock_quantity,
      image: p.image,
      category: p.category,
    })),
    recent_orders: [] as Array<{
      order_id: string;
      customer_name: string;
      customer_email: string;
      total: number;
      status: string;
      payment_status: string;
      created_at: string | null;
    }>,
    data_source: source,
    backend_online: true,
    live_product_count: products.filter((p) => p.is_active).length,
  };

  if (!service) return base;

  const { data: orders, error } = await service
    .from("orders")
    .select(
      "id, customer_name, customer_email, total_amount, status, payment_status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error?.code === "PGRST205" || error) {
    return base;
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const parsed = (orders ?? []).map((o) => ({
    order_id: String(o.id),
    customer_name: String(o.customer_name),
    customer_email: String(o.customer_email),
    total: Number(o.total_amount),
    status: String(o.status),
    payment_status: String(o.payment_status ?? "unpaid"),
    created_at: o.created_at as string | null,
    created: o.created_at ? new Date(o.created_at as string) : null,
  }));

  return {
    ...base,
    orders_today: parsed.filter(
      (o) => o.created && o.created >= startOfDay
    ).length,
    orders_this_week: parsed.filter(
      (o) => o.created && o.created >= weekAgo
    ).length,
    revenue_this_week: parsed
      .filter(
        (o) =>
          o.created &&
          o.created >= weekAgo &&
          o.status !== "cancelled"
      )
      .reduce((s, o) => s + o.total, 0),
    revenue_this_month: parsed
      .filter(
        (o) =>
          o.created &&
          o.created >= monthAgo &&
          o.status !== "cancelled"
      )
      .reduce((s, o) => s + o.total, 0),
    recent_orders: parsed.slice(0, 10).map(({ created: _, ...rest }) => rest),
    data_source: source,
  };
}

export async function fetchAdminOrders(filters: {
  status?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}) {
  const service = getServiceSupabase();
  if (!service) {
    return { orders: [], total: 0, source: "live_catalog" as const };
  }

  let query = service
    .from("orders")
    .select(
      "id, customer_name, customer_email, total_amount, status, payment_status, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(
      filters.offset ?? 0,
      (filters.offset ?? 0) + (filters.limit ?? 50) - 1
    );

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search?.trim()) {
    const s = `%${filters.search.trim()}%`;
    query = query.or(
      `id.ilike.${s},customer_name.ilike.${s},customer_email.ilike.${s}`
    );
  }

  const { data, error, count } = await query;
  if (error?.code === "PGRST205" || error) {
    return { orders: [], total: 0, source: "live_catalog" as const };
  }

  return {
    orders: (data ?? []).map((o) => ({
      order_id: String(o.id),
      customer_name: String(o.customer_name),
      customer_email: String(o.customer_email),
      total: Number(o.total_amount),
      status: String(o.status),
      payment_status: String(o.payment_status ?? "unpaid"),
      created_at: o.created_at as string | null,
    })),
    total: count ?? 0,
    source: "database" as const,
  };
}
