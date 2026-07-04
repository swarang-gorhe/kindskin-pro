"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  adminFetch,
  type AdminOrderDetail,
  AdminApiError,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = String(params.id || "");
  const { showToast } = useToast();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    adminFetch<{ order: AdminOrderDetail }>(`/api/admin/orders/${orderId}`)
      .then((res) => {
        setOrder(res.order);
        setStatus(res.order.status);
        setInternalNotes(res.order.internal_notes);
        setTrackingNumber(res.order.tracking_number || "");
      })
      .catch((err: AdminApiError) => showToast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [orderId, showToast]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setSaving(true);
    try {
      const res = await adminFetch<{ order: AdminOrderDetail }>(
        `/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            internal_notes: internalNotes,
            tracking_number: trackingNumber || null,
          }),
        }
      );
      setOrder(res.order);
      showToast(
        status === "cancelled" && order.status !== "cancelled"
          ? "Order cancelled — stock restored"
          : "Order updated"
      );
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted">Loading order…</p>;
  }

  if (!order) {
    return (
      <div>
        <p className="text-muted">Order not found.</p>
        <Link href="/admin/orders" className="text-sage underline text-sm mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-sage hover:text-forest"
        >
          ← Back to orders
        </Link>
        <h2 className="font-serif text-3xl text-forest mt-2">{order.order_id}</h2>
        <p className="text-sm text-muted">
          Placed{" "}
          {order.created_at
            ? new Date(order.created_at).toLocaleString("en-IN")
            : "—"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-cream-dark bg-cream p-5 space-y-3">
          <h3 className="font-medium text-forest">Customer</h3>
          <p className="text-sm">
            <span className="text-muted">Name:</span> {order.customer.name}
          </p>
          <p className="text-sm">
            <span className="text-muted">Email:</span> {order.customer.email}
          </p>
          <p className="text-sm">
            <span className="text-muted">Phone:</span> {order.customer.phone}
          </p>
          <p className="text-sm">
            <span className="text-muted">Address:</span>{" "}
            {order.customer.address}, {order.customer.city} —{" "}
            {order.customer.pincode}
          </p>
        </section>

        <section className="rounded-xl border border-cream-dark bg-cream p-5 space-y-3">
          <h3 className="font-medium text-forest">Items</h3>
          <ul className="space-y-2 text-sm">
            {order.items.map((item) => (
              <li
                key={`${item.product_id}-${item.quantity}`}
                className="flex justify-between"
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>{formatPrice(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="font-medium text-forest pt-2 border-t border-cream-dark">
            Total: {formatPrice(order.total)}
          </p>
          <p className="text-sm text-muted capitalize">
            Payment: {order.payment_status}
          </p>
        </section>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-cream-dark bg-cream p-5 space-y-4"
      >
        <h3 className="font-medium text-forest">Update order</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            {status === "cancelled" && order.status !== "cancelled" && (
              <p className="text-xs text-terracotta mt-1">
                Cancelling will automatically restock all items.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tracking number
            </label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Internal notes
          </label>
          <textarea
            rows={3}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm"
            placeholder="Notes visible only to admins"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-forest text-cream px-4 py-2 text-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <section className="rounded-xl border border-cream-dark bg-cream p-5">
        <h3 className="font-medium text-forest mb-4">Status history</h3>
        {order.timeline.length === 0 ? (
          <p className="text-sm text-muted">No status events yet.</p>
        ) : (
          <ol className="space-y-3">
            {order.timeline.map((event, i) => (
              <li key={`${event.status}-${i}`} className="text-sm">
                <span className="font-medium capitalize text-forest">
                  {event.status}
                </span>
                <span className="text-muted ml-2">
                  {new Date(event.created_at).toLocaleString("en-IN")}
                </span>
                <p className="text-muted mt-0.5">{event.message}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
