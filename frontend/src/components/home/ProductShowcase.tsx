import { products } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { FeatureBar } from "@/components/home/FeatureBar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";

export function ProductShowcase() {
  return (
    <section className="py-10 md:py-14">
      <FadeIn className="mb-8">
        <h2 className="section-label">Shop</h2>
        <p className="font-serif text-2xl md:text-3xl text-forest mt-1">Our Products</p>
      </FadeIn>

      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <StaggerItem key={product.id}>
            <ProductCard product={product} compact />
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2} className="mt-8">
        <FeatureBar />
      </FadeIn>
    </section>
  );
}
