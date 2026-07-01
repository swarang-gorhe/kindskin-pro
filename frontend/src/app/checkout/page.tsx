"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { formatPrice } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import type { CheckoutResponse } from "@/lib/types";

const ORDER_STORAGE_KEY = "kindskin-last-order";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await apiFetch<CheckoutResponse>("/api/checkout/create", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
          customer: form,
          total: total(),
        }),
      });
      sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
      clearCart();
      router.push(`/checkout/success?orderId=${order.order_id}`);
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6">
        <FadeIn>
          <h1 className="font-serif text-4xl text-forest mb-10">Checkout</h1>
        </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(["name", "email", "phone", "address", "city", "pincode"] as const).map(
            (field) => (
              <FadeIn key={field}>
                <label className="block text-sm font-medium text-forest mb-2 capitalize">
                  {field === "pincode" ? "PIN Code" : field}
                </label>
                <input
                  type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                  required
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </FadeIn>
            )
          )}

          <FadeIn>
            <div className="p-6 bg-cream-dark rounded-2xl">
              <div className="flex justify-between mb-4">
                <span className="text-forest">Order Total</span>
                <span className="text-xl font-medium text-forest">
                  {formatPrice(total())}
                </span>
              </div>
              <p className="text-xs text-muted mb-4">
                Payment will be processed securely via Razorpay/Stripe. We never store card details.
              </p>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Processing..." : `Pay ${formatPrice(total())}`}
              </Button>
            </div>
          </FadeIn>
        </form>
      </div>
    </div>
  );
}
