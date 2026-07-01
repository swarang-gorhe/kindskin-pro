"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <FadeIn>
          <h1 className="font-serif text-4xl text-forest">Your Cart</h1>
          <p className="mt-4 text-muted">Your cart is empty.</p>
          <Link href="/products" className="inline-block mt-8">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <FadeIn>
          <h1 className="font-serif text-4xl text-forest mb-10">Your Cart</h1>
        </FadeIn>

        <div className="space-y-6">
          {items.map((item) => (
            <FadeIn key={item.product.id}>
              <div className="flex gap-6 p-6 bg-white rounded-2xl shadow-sm">
                <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-cream-dark shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-serif text-lg text-forest hover:text-terracotta transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted mt-1">
                    {formatPrice(item.product.price)}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded-full border border-forest/10 hover:bg-cream-dark"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 rounded-full border border-forest/10 hover:bg-cream-dark"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto p-1 text-muted hover:text-terracotta transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="font-medium text-forest">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-10 p-6 bg-cream-dark rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg text-forest">Subtotal</span>
            <span className="text-2xl font-medium text-forest">
              {formatPrice(total())}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/checkout" className="flex-1">
              <Button size="lg" className="w-full">Proceed to Checkout</Button>
            </Link>
            <Button variant="ghost" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
