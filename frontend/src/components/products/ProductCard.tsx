"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col card-soft overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-apple-lg"
    >
      <div className={`relative bg-white flex items-center justify-center ${compact ? "p-4" : "p-6"}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={327}
          height={205}
          quality={95}
          className="w-full h-auto max-h-48 object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 320px"
        />
      </div>
      <div className={`flex flex-col flex-1 text-center border-t border-forest/5 ${compact ? "p-4" : "p-6"}`}>
        <h3 className="font-serif text-lg md:text-xl text-forest">{product.name}</h3>
        <p className="mt-1 text-xs md:text-sm text-muted line-clamp-2 leading-relaxed">
          {product.tagline}
        </p>
        <p className="mt-3 text-xl font-semibold text-forest">{formatPrice(product.price)}</p>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full uppercase tracking-wider text-xs pointer-events-none group-hover:bg-forest group-hover:text-cream group-hover:border-forest transition-colors"
            tabIndex={-1}
          >
            View Product
          </Button>
        </div>
      </div>
    </Link>
  );
}
