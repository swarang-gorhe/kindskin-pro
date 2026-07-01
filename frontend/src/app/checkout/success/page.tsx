"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { formatPrice } from "@/lib/utils";
import type { OrderDetails } from "@/lib/types";

const STORAGE_KEY = "kindskin-last-order";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as OrderDetails;
        if (!orderId || parsed.order_id === orderId) {
          setOrder(parsed);
        }
      } catch {
        // ignore invalid storage
      }
    }
  }, [searchParams]);

  return (
    <FadeIn>
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 mb-6">
        <CheckCircle2 className="h-8 w-8 text-forest" />
      </div>
      <h1 className="font-serif text-4xl text-forest">Thank You!</h1>
      <p className="mt-4 text-muted max-w-md mx-auto">
        Your order has been placed successfully. We&apos;ll send a confirmation to your email shortly.
      </p>

      {order && (
        <div className="mt-8 mx-auto max-w-md rounded-2xl bg-white border border-forest/5 p-6 text-left shadow-sm">
          <p className="text-xs uppercase tracking-widest text-sage">Order ID</p>
          <p className="font-mono text-lg text-forest mt-1">{order.order_id}</p>
          <p className="mt-4 text-sm text-muted">
            Total: <span className="font-medium text-forest">{formatPrice(order.total)}</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""} · Status:{" "}
            <span className="capitalize text-forest">{order.status}</span>
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {order && (
          <Link href={`/orders/track?orderId=${order.order_id}`}>
            <Button size="lg" variant="outline">
              Track Order
            </Button>
          </Link>
        )}
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    </FadeIn>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="py-24 text-center px-6">
      <Suspense fallback={<p className="text-muted">Loading...</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
