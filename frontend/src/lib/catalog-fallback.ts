import { products } from "@/data/products";
import type { AdminProduct } from "@/lib/admin-api";

/** Live customer-facing catalog — used when DB/API is unavailable. */
export function getLiveCatalogProducts(): AdminProduct[] {
  return products.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    short_description: p.shortDescription,
    price: p.price,
    category: p.category,
    image: p.image,
    images: p.images,
    benefits: p.benefits,
    stock_quantity: 100,
    is_active: true,
    rating: p.rating,
    review_count: p.reviewCount,
  }));
}
