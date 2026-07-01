"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  size = "md",
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button onClick={handleAdd} size={size} className="w-full md:w-auto">
      {added ? "Added ✓" : "Add to Cart"}
    </Button>
  );
}
