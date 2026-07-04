import {
  verifyAdminRequest,
  unauthorized,
  getServiceSupabase,
  badRequest,
} from "@/lib/admin-server/auth";
import { fetchAdminProducts } from "@/lib/admin-server/data";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const result = await fetchAdminProducts();
  return Response.json(result);
}

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) return unauthorized();

  const service = getServiceSupabase();
  if (!service) {
    return badRequest(
      "Add SUPABASE_SERVICE_KEY on Vercel and run DB migrations to create products in database."
    );
  }

  const body = await request.json();
  const slug = String(body.slug ?? body.name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data, error } = await service
    .from("products")
    .insert({
      slug,
      name: body.name,
      tagline: body.tagline ?? "",
      description: body.description ?? "",
      short_description: body.short_description ?? body.description?.slice(0, 200) ?? "",
      price: body.price,
      category: body.category ?? "General",
      image: body.image ?? "",
      images: body.images ?? [],
      benefits: body.benefits ?? [],
      stock_quantity: body.stock_quantity ?? 0,
      rating: body.rating ?? 4.5,
      review_count: body.review_count ?? 0,
    })
    .select("*")
    .single();

  if (error) return badRequest(error.message);
  return Response.json({ status: "ok", product: data });
}
