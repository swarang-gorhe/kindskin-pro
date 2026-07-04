import { getServiceSupabase } from "@/lib/admin-server/auth";

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

function mapDiscount(row: Record<string, unknown>): Discount {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    description: String(row.description ?? ""),
    discount_type: row.discount_type as Discount["discount_type"],
    value: Number(row.value),
    min_order_amount: Number(row.min_order_amount ?? 0),
    max_uses: row.max_uses != null ? Number(row.max_uses) : null,
    uses_count: Number(row.uses_count ?? 0),
    applies_to: (row.applies_to as Discount["applies_to"]) ?? "all",
    product_slugs: (row.product_slugs as string[]) ?? [],
    category: row.category ? String(row.category) : null,
    is_active: Boolean(row.is_active ?? true),
    starts_at: (row.starts_at as string) ?? null,
    ends_at: (row.ends_at as string) ?? null,
    created_at: (row.created_at as string) ?? null,
  };
}

export async function listDiscounts(): Promise<{
  discounts: Discount[];
  table_ready: boolean;
}> {
  const service = getServiceSupabase();
  if (!service) return { discounts: [], table_ready: false };

  const { data, error } = await service
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error?.code === "PGRST205") {
    return { discounts: [], table_ready: false };
  }
  if (error) throw new Error(error.message);

  return {
    discounts: (data ?? []).map((r) => mapDiscount(r as Record<string, unknown>)),
    table_ready: true,
  };
}

export async function createDiscount(
  body: Record<string, unknown>
): Promise<Discount> {
  const service = getServiceSupabase();
  if (!service) throw new Error("SUPABASE_SERVICE_KEY not configured on Vercel");

  const payload = {
    code: String(body.code ?? "")
      .trim()
      .toUpperCase(),
    name: String(body.name ?? "").trim(),
    description: String(body.description ?? ""),
    discount_type: body.discount_type === "fixed" ? "fixed" : "percentage",
    value: Number(body.value ?? 0),
    min_order_amount: Number(body.min_order_amount ?? 0),
    max_uses: body.max_uses != null ? Number(body.max_uses) : null,
    applies_to: ["all", "product", "category"].includes(
      String(body.applies_to)
    )
      ? body.applies_to
      : "all",
    product_slugs: body.product_slugs ?? [],
    category: body.category ? String(body.category) : null,
    is_active: body.is_active !== false,
    starts_at: body.starts_at || null,
    ends_at: body.ends_at || null,
  };

  const { data, error } = await service
    .from("discounts")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapDiscount(data as Record<string, unknown>);
}

export async function updateDiscount(
  id: string,
  body: Record<string, unknown>
): Promise<Discount> {
  const service = getServiceSupabase();
  if (!service) throw new Error("SUPABASE_SERVICE_KEY not configured");

  const updates: Record<string, unknown> = {};
  for (const key of [
    "name",
    "description",
    "discount_type",
    "value",
    "min_order_amount",
    "max_uses",
    "applies_to",
    "product_slugs",
    "category",
    "is_active",
    "starts_at",
    "ends_at",
  ]) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (body.code !== undefined) {
    updates.code = String(body.code).trim().toUpperCase();
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await service
    .from("discounts")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapDiscount(data as Record<string, unknown>);
}

export async function deleteDiscount(id: string): Promise<void> {
  const service = getServiceSupabase();
  if (!service) throw new Error("SUPABASE_SERVICE_KEY not configured");

  const { error } = await service
    .from("discounts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
