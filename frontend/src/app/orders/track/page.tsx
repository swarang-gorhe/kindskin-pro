"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Search, Truck, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { formatPrice } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import type { OrderDetails } from "@/lib/types";

const statusIcons: Record<string, typeof CheckCircle2> = {
  confirmed: CheckCircle2,
  processing: Clock,
  shipped: Truck,
  delivered: Package,
  cancelled: Clock,
};

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderDetails | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await apiFetch<{ status: string; order?: OrderDetails; message?: string }>(
        "/api/orders/track",
        {
          method: "POST",
          body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
        }
      );

      if (res.status === "ok" && res.order) {
        setOrder(res.order);
      } else {
        setError(res.message || "Order not found. Check your order ID and email.");
      }
    } catch {
      setError("Unable to look up your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium text-forest mb-2">Order ID</label>
          <input
            type="text"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            placeholder="KS-20260702-A3F9B2"
            className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-forest/20 uppercase"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-forest mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Looking up..." : "Track Order"}
        </Button>
      </form>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600">{error}</p>
      )}

      {order && (
        <FadeIn className="mt-12 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white shadow-sm border border-forest/5 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-forest/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-sage">Order</p>
                  <p className="font-mono text-lg text-forest mt-1">{order.order_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-sage">Status</p>
                  <p className="text-lg font-medium text-forest mt-1 capitalize">{order.status}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="p-6 md:p-8 border-b border-forest/5">
              <h2 className="font-serif text-xl text-forest mb-4">Items</h2>
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-forest">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="text-muted">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-4 pt-4 border-t border-forest/5 font-medium">
                <span className="text-forest">Total</span>
                <span className="text-forest">{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 border-b border-forest/5">
              <h2 className="font-serif text-xl text-forest mb-4">Delivery Address</h2>
              <p className="text-sm text-muted leading-relaxed">
                {order.customer.name}
                <br />
                {order.customer.address}
                <br />
                {order.customer.city} — {order.customer.pincode}
                <br />
                {order.customer.phone}
              </p>
            </div>

            {order.tracking_number && (
              <div className="p-6 md:p-8 border-b border-forest/5">
                <h2 className="font-serif text-xl text-forest mb-2">Tracking</h2>
                <p className="text-sm text-muted">
                  {order.carrier}: <span className="font-mono text-forest">{order.tracking_number}</span>
                </p>
              </div>
            )}

            <div className="p-6 md:p-8">
              <h2 className="font-serif text-xl text-forest mb-6">Order Timeline</h2>
              <ol className="space-y-4">
                {order.timeline.map((event, i) => {
                  const Icon = statusIcons[event.status] || CheckCircle2;
                  return (
                    <li key={i} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/10">
                        <Icon className="h-4 w-4 text-forest" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-forest capitalize">{event.status}</p>
                        <p className="text-sm text-muted">{event.message}</p>
                        <p className="text-xs text-muted mt-1">
                          {new Date(event.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </FadeIn>
      )}
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 mb-4">
            <Search className="h-5 w-5 text-forest" />
          </div>
          <h1 className="font-serif text-4xl text-forest">Track Your Order</h1>
          <p className="mt-3 text-muted max-w-md mx-auto">
            Enter your order ID and email to see status, items, and delivery details.
          </p>
        </FadeIn>

        <Suspense fallback={<p className="text-center text-muted">Loading...</p>}>
          <TrackOrderForm />
        </Suspense>

        <p className="mt-10 text-center text-sm text-muted">
          Need help?{" "}
          <Link href="/contact" className="text-forest underline underline-offset-2">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
