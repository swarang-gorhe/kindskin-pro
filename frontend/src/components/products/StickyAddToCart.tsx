"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/types";

export function StickyAddToCart({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const hero = document.getElementById("product-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-forest/10 px-6 py-4 shadow-lg">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div>
          <p className="font-serif text-lg text-forest">{product.name}</p>
          <p className="text-sm text-muted">{formatPrice(product.price)}</p>
        </div>
        <Button onClick={() => addItem(product)} size="lg">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
