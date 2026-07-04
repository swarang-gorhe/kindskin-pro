"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminFetch,
  type Discount,
  AdminApiError,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { AdminStatusBanner } from "@/components/admin/AdminStatusBanner";
import { products as liveProducts } from "@/data/products";

type DiscountForm = {
  code: string;
  name: string;
  description: string;
  discount_type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_uses: string;
  applies_to: "all" | "product" | "category";
  product_slugs: string[];
  category: string;
  is_active: boolean;
};

const emptyForm: DiscountForm = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  value: 10,
  min_order_amount: 0,
  max_uses: "",
  applies_to: "all",
  product_slugs: [],
  category: "",
  is_active: true,
};

export default function AdminDiscountsPage() {
  const { showToast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [tableReady, setTableReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DiscountForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{
        discounts: Discount[];
        table_ready: boolean;
      }>("/api/admin/discounts");
      setDiscounts(res.discounts);
      setTableReady(res.table_ready);
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFetch("/api/admin/discounts", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
        }),
      });
      showToast("Discount created");
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d: Discount) {
    try {
      await adminFetch(`/api/admin/discounts/${d.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !d.is_active }),
      });
      showToast(d.is_active ? "Discount deactivated" : "Discount activated");
      await load();
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    }
  }

  function formatDiscountValue(d: Discount) {
    if (d.discount_type === "percentage") return `${d.value}%`;
    return formatPrice(d.value);
  }

  return (
    <div className="space-y-6">
      {!tableReady && (
        <AdminStatusBanner
          message="Discounts table not found. Run supabase/migrations/005_discounts.sql in Supabase SQL Editor, then add SUPABASE_SERVICE_KEY on Vercel."
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-forest">Discounts</h2>
          <p className="text-sm text-muted mt-1">
            Promo codes for checkout — percentage or fixed amount off.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-forest text-cream px-4 py-2 text-sm font-medium hover:bg-forest-light"
        >
          Add discount
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading discounts…</p>
      ) : discounts.length === 0 ? (
        <p className="text-muted">
          No discounts yet. Create a code like KIND10 for 10% off.
        </p>
      ) : (
        <div className="rounded-xl border border-cream-dark bg-cream overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-dark/50 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Min order</th>
                <th className="px-4 py-3 font-medium">Applies to</th>
                <th className="px-4 py-3 font-medium">Uses</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-t border-cream-dark">
                  <td className="px-4 py-3 font-mono font-medium text-forest">
                    {d.code}
                  </td>
                  <td className="px-4 py-3">{d.name}</td>
                  <td className="px-4 py-3">{formatDiscountValue(d)}</td>
                  <td className="px-4 py-3">
                    {d.min_order_amount > 0
                      ? formatPrice(d.min_order_amount)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{d.applies_to}</td>
                  <td className="px-4 py-3">
                    {d.uses_count}
                    {d.max_uses != null ? ` / ${d.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${
                        d.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(d)}
                      className="text-xs text-sage hover:text-forest underline"
                    >
                      {d.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-xl bg-cream p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif text-xl text-forest">New discount</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full rounded-lg border border-cream-dark px-3 py-2 font-mono"
                  placeholder="KIND10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-cream-dark px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full rounded-lg border border-cream-dark px-3 py-2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={form.discount_type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discount_type: e.target.value as "percentage" | "fixed",
                    }))
                  }
                  className="w-full rounded-lg border border-cream-dark px-3 py-2"
                >
                  <option value="percentage">Percentage %</option>
                  <option value="fixed">Fixed ₹</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-cream-dark px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Min order ₹
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.min_order_amount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      min_order_amount: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-cream-dark px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Applies to
              </label>
              <select
                value={form.applies_to}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    applies_to: e.target.value as DiscountForm["applies_to"],
                  }))
                }
                className="w-full rounded-lg border border-cream-dark px-3 py-2"
              >
                <option value="all">Entire order</option>
                <option value="product">Specific products</option>
                <option value="category">Product category</option>
              </select>
            </div>
            {form.applies_to === "product" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Products
                </label>
                <div className="space-y-2">
                  {liveProducts.map((p) => (
                    <label key={p.slug} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.product_slugs.includes(p.slug)}
                        onChange={(e) => {
                          setForm((f) => ({
                            ...f,
                            product_slugs: e.target.checked
                              ? [...f.product_slugs, p.slug]
                              : f.product_slugs.filter((s) => s !== p.slug),
                          }));
                        }}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {form.applies_to === "category" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full rounded-lg border border-cream-dark px-3 py-2"
                  placeholder="Face & Body"
                />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-forest text-cream px-4 py-2 text-sm disabled:opacity-60"
              >
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
