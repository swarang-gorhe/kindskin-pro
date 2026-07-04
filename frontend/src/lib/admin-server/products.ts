import { getServiceSupabase } from "@/lib/admin-server/auth";
import { mapDbRow } from "@/lib/admin-server/data";
import type { AdminProduct } from "@/lib/admin-api";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function findProductRow(
  service: ReturnType<typeof getServiceSupabase>,
  idOrSlug: string
) {
  if (!service) return null;

  if (UUID_RE.test(idOrSlug)) {
    const { data } = await service
      .from("products")
      .select("*")
      .eq("id", idOrSlug)
      .maybeSingle();
    if (data) return data;
  }

  const { data: bySlug } = await service
    .from("products")
    .select("*")
    .eq("slug", idOrSlug)
    .maybeSingle();

  return bySlug;
}

export async function updateProduct(
  idOrSlug: string,
  body: Record<string, unknown>
): Promise<AdminProduct> {
  const service = getServiceSupabase();
  if (!service) {
    throw new Error(
      "SUPABASE_SERVICE_KEY not configured — add it on Vercel to edit products in the database."
    );
  }

  const existing = await findProductRow(service, idOrSlug);

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of [
    "name",
    "tagline",
    "description",
    "short_description",
    "price",
    "category",
    "image",
    "images",
    "benefits",
    "rating",
    "review_count",
    "is_active",
    "stock_quantity",
  ]) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (body.slug !== undefined) updates.slug = slugify(String(body.slug));

  if (!existing) {
    const slug = slugify(String(body.slug ?? idOrSlug));
    const { data, error } = await service
      .from("products")
      .insert({
        slug,
        name: String(body.name ?? slug),
        tagline: String(body.tagline ?? ""),
        description: String(body.description ?? ""),
        short_description: String(
          body.short_description ?? String(body.description ?? "").slice(0, 200)
        ),
        price: Number(body.price ?? 0),
        category: String(body.category ?? "General"),
        image: String(body.image ?? ""),
        images: body.images ?? [],
        benefits: body.benefits ?? [],
        stock_quantity: Number(body.stock_quantity ?? 0),
        rating: Number(body.rating ?? 4.5),
        review_count: Number(body.review_count ?? 0),
        is_active: body.is_active !== false,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapDbRow(data as Record<string, unknown>);
  }

  const { data, error } = await service
    .from("products")
    .update(updates)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapDbRow(data as Record<string, unknown>);
}

export async function adjustProductStock(
  idOrSlug: string,
  changeAmount: number,
  note: string,
  reason = "manual_adjustment"
): Promise<AdminProduct> {
  const service = getServiceSupabase();
  if (!service) {
    throw new Error("SUPABASE_SERVICE_KEY not configured on Vercel");
  }

  const existing = await findProductRow(service, idOrSlug);
  if (!existing) throw new Error("Product not found in database");

  const newQty = Math.max(0, Number(existing.stock_quantity) + changeAmount);

  const { data, error } = await service
    .from("products")
    .update({
      stock_quantity: newQty,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await service.from("stock_movements").insert({
    product_id: existing.id,
    change_amount: changeAmount,
    reason,
    note: note || "Manual stock adjustment",
  });

  return mapDbRow(data as Record<string, unknown>);
}

export async function deactivateProduct(idOrSlug: string): Promise<AdminProduct> {
  return updateProduct(idOrSlug, { is_active: false });
}
