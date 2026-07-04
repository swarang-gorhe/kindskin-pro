import { createClient } from "@/utils/supabase/client";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new AdminApiError("Not authenticated", 401);
  }
  return session.access_token;
}

/** Admin API runs on Vercel (same origin) — not the Railway backend proxy. */
function resolveAdminPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/api/admin")) return normalized;
  return normalized.replace(/^\/api\//, "/api/admin/");
}

export async function adminFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(resolveAdminPath(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.detail || body.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new AdminApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  short_description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  benefits: string[];
  stock_quantity: number;
  is_active: boolean;
  rating: number;
  review_count: number;
};

export type AdminOrderSummary = {
  order_id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string | null;
};

export type DashboardSummary = {
  orders_today: number;
  orders_this_week: number;
  revenue_this_week: number;
  revenue_this_month: number;
  low_stock_threshold: number;
  low_stock_count: number;
  low_stock_products: Array<{
    id: string;
    slug: string;
    name: string;
    stock_quantity: number;
    image: string;
    category: string;
  }>;
  recent_orders: AdminOrderSummary[];
  data_source?: "database" | "live_catalog";
  backend_online?: boolean;
  live_product_count?: number;
};

export type Discount = {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  uses_count: number;
  applies_to: "all" | "product" | "category";
  product_slugs: string[];
  category: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string | null;
};

export type AdminOrderDetail = {
  order_id: string;
  status: string;
  payment_status: string;
  total: number;
  tracking_number: string | null;
  carrier: string;
  internal_notes: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  timeline: Array<{
    status: string;
    message: string;
    created_at: string;
  }>;
  created_at: string | null;
  updated_at: string | null;
};
