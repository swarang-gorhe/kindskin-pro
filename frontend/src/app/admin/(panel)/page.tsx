"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminFetch,
  type DashboardSummary,
  AdminApiError,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { AdminStatusBanner } from "@/components/admin/AdminStatusBanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DbConnectionBanner } from "@/components/admin/DbConnectionBanner";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "bg-sage/20 text-forest",
    processing: "bg-amber-100 text-amber-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        colors[status] || "bg-cream-dark text-muted"
      }`}
    >
      {status}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<DashboardSummary>("/api/admin/dashboard/summary")
      .then(setData)
      .catch((err: AdminApiError) => {
        setError(err.message);
        showToast(err.message, "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) {
    return <p className="text-muted">Loading dashboard…</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-terracotta">Unable to load dashboard: {error}</p>
        <p className="text-sm text-muted">
          Ensure you are signed in as admin. If this persists, add{" "}
          <code>SUPABASE_SERVICE_KEY</code> to Vercel environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DbConnectionBanner />
      <AdminStatusBanner dataSource={data.data_source} />

      <AdminPageHeader
        title="Dashboard"
        subtitle={`${data.live_product_count ?? 0} live products · ${
          data.data_source === "live_catalog"
            ? "storefront catalog"
            : "database"
        }`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Orders today", value: data.orders_today },
          { label: "Orders this week", value: data.orders_this_week },
          {
            label: "Revenue this week",
            value: formatPrice(data.revenue_this_week),
          },
          {
            label: "Low-stock alerts",
            value: data.low_stock_count,
            alert: data.low_stock_count > 0,
          },
        ].map((card) => (
          <div key={card.label} className="card-soft p-5">
            <p className="text-sm text-muted">{card.label}</p>
            <p
              className={`text-2xl font-semibold mt-2 ${
                card.alert ? "text-terracotta" : "text-forest"
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="card-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-dark flex items-center justify-between">
          <h3 className="font-medium text-forest">Low stock</h3>
          <span className="text-xs text-muted">
            Below {data.low_stock_threshold} units
          </span>
        </div>
        {data.low_stock_products.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">All products are well stocked.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-dark/50 text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.low_stock_products.map((p) => (
                <tr key={p.id} className="border-t border-cream-dark">
                  <td className="px-5 py-3 text-forest">{p.name}</td>
                  <td className="px-5 py-3 text-terracotta font-medium">
                    {p.stock_quantity}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href="/admin/products"
                      className="text-sage hover:text-forest underline"
                    >
                      Restock
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-dark">
          <h3 className="font-medium text-forest">Recent orders</h3>
        </div>
        {data.recent_orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">
            No orders in database yet. Customer orders appear here after
            checkout migrations are applied.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-dark/50 text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.map((o) => (
                <tr key={o.order_id} className="border-t border-cream-dark">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${o.order_id}`}
                      className="text-sage hover:text-forest font-medium"
                    >
                      {o.order_id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-forest">{o.customer_name}</td>
                  <td className="px-5 py-3">{formatPrice(o.total)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
