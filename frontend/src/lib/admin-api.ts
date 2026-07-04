import { createClient } from "@/utils/supabase/client";
import { resolveApiPath } from "./api";

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

export async function adminFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(resolveApiPath(path), {
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
