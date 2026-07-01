import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, products } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { SignatureInteraction } from "@/components/products/SignatureInteraction";
import { StickyAddToCart } from "@/components/products/StickyAddToCart";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { formatPrice } from "@/lib/utils";
import { Star } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== slug);

  return (
    <>
      {/* Hero */}
      <section id="product-hero" className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="card-soft p-6 flex items-center justify-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={327}
                  height={205}
                  quality={95}
                  priority
                  className="w-full h-auto max-h-80 object-contain"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="section-label mb-2">{product.category}</p>
              <h1 className="font-serif text-4xl md:text-5xl text-forest">
                {product.name}
              </h1>
              <p className="mt-3 text-lg text-forest/80 font-medium">{product.tagline}</p>
              <p className="mt-4 text-muted leading-relaxed">{product.shortDescription}</p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-terracotta text-terracotta"
                          : "text-forest/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-forest">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="mt-8">
                <AddToCartButton product={product} size="lg" />
              </div>

              <p className="mt-8 text-muted leading-relaxed">{product.description}</p>

              {product.flavors && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-forest mb-2">Available Flavours</p>
                  <div className="flex flex-wrap gap-2">
                    {product.flavors.map((f) => (
                      <span key={f} className="rounded-full bg-cream-dark px-3 py-1 text-xs text-forest/80">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <ul className="mt-8 space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    {b}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Feature Reveals */}
      {product.features.map((feature, i) => (
        <section
          key={feature.title}
          className={`py-16 md:py-24 ${i % 2 === 1 ? "bg-cream-dark" : ""}`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div
              className={`grid md:grid-cols-2 gap-12 items-center ${
                i % 2 === 1 ? "md:[direction:rtl]" : ""
              }`}
            >
              <FadeIn className={i % 2 === 1 ? "md:[direction:ltr]" : ""}>
                {i === 0 ? (
                  <SignatureInteraction product={product} />
                ) : (
                  <div className="card-soft p-4">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={327}
                      height={205}
                      quality={95}
                      className="w-full h-auto"
                      sizes="(max-width: 768px) 100vw, 480px"
                    />
                  </div>
                )}
              </FadeIn>
              <FadeIn delay={0.1} className={i % 2 === 1 ? "md:[direction:ltr]" : ""}>
                <h2 className="font-serif text-3xl md:text-4xl text-forest">
                  {feature.title}
                </h2>
                <p className="mt-4 text-muted leading-relaxed">{feature.description}</p>
              </FadeIn>
            </div>
          </div>
        </section>
      ))}

      {/* How to Use */}
      <section className="py-12 md:py-16 bg-cream-dark/50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-2xl text-forest mb-4">How to Use</h2>
            <p className="text-muted leading-relaxed">{product.howToUse}</p>
          </FadeIn>
        </div>
      </section>

      {/* Ingredients Table */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <h2 className="font-serif text-3xl text-forest mb-8 text-center">
              Ingredients & Benefits
            </h2>
            <div className="rounded-2xl border border-forest/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-dark">
                    <th className="text-left px-6 py-4 font-medium text-forest">Ingredient</th>
                    <th className="text-left px-6 py-4 font-medium text-forest">Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {product.ingredients.map((ing, i) => (
                    <tr key={ing.name} className={i % 2 === 0 ? "bg-white" : "bg-cream/50"}>
                      <td className="px-6 py-4 text-forest font-medium">{ing.name}</td>
                      <td className="px-6 py-4 text-muted">{ing.benefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 md:py-24 bg-cream-dark">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mb-12 text-center">
            <h2 className="font-serif text-3xl text-forest">You May Also Like</h2>
          </FadeIn>
          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            {related.map((p) => (
              <FadeIn key={p.id}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <StickyAddToCart product={product} />
    </>
  );
}
