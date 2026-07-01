import type { Metadata } from "next";
import { products } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse KindSkin's collection of natural, Ayurvedic skincare products.",
};

export default function ProductsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-forest">Shop</h1>
          <p className="mt-4 text-lg text-muted max-w-lg">
            Pure ingredients. Honest formulations. Skincare you can trust.
          </p>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product) => (
            <FadeIn key={product.id}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
