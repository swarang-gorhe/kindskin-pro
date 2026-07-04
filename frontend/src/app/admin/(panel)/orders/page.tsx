"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminFetch,
  type AdminOrderSummary,
  AdminApiError,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { AdminStatusBanner } from "@/components/admin/AdminStatusBanner";

const STATUSES = [
  "",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

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

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    try {
      const res = await adminFetch<{
        orders: AdminOrderSummary[];
        total: number;
      }>(`/api/admin/orders?${params.toString()}`);
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    } finally {
      setLoading(false);
    }
  }, [status, search, dateFrom, dateTo, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-6">
      <AdminStatusBanner
        id="orders"
        message="Orders appear here once Supabase migrations are applied. Admin API runs on Vercel — no Railway needed."
      />
      <div>
        <h2 className="font-serif text-3xl text-forest">Orders</h2>
        <p className="text-sm text-muted mt-1">
          {total} order{total === 1 ? "" : "s"} total
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All statuses"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-muted mb-1">Search</label>
          <input
            type="search"
            placeholder="Order ID, name, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="rounded-lg bg-forest text-cream px-4 py-2 text-sm"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted">No orders match your filters.</p>
      ) : (
        <div className="rounded-xl border border-cream-dark bg-cream overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-dark/50 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.order_id}
                  className="border-t border-cream-dark hover:bg-cream-dark/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.order_id}`}
                      className="text-sage hover:text-forest font-medium"
                    >
                      {o.order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-forest">{o.customer_name}</div>
                    <div className="text-xs text-muted">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {o.payment_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
