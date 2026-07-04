"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";
import {
  adminFetch,
  type Discount,
  AdminApiError,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { AdminStatusBanner } from "@/components/admin/AdminStatusBanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminActionBar, AdminActionButton } from "@/components/admin/AdminActionButton";
import { Button } from "@/components/ui/Button";
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
          id="discounts"
          message="Discounts table not found. Run supabase/migrations/005_discounts.sql in Supabase SQL Editor, then set SUPABASE_SERVICE_KEY on Vercel."
        />
      )}

      <AdminPageHeader
        title="Discounts"
        subtitle="Promo codes for checkout — percentage or fixed amount off."
        action={
          <Button type="button" onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={16} />
            Add discount
          </Button>
        }
      />

      {loading ? (
        <div className="card-soft p-12 text-center text-muted">Loading discounts…</div>
      ) : discounts.length === 0 ? (
        <div className="card-soft p-12 text-center">
          <p className="text-muted">
            No discounts yet. Create a code like KIND10 for 10% off.
          </p>
          <Button type="button" onClick={() => setShowForm(true)} className="mt-4">
            Create first coupon
          </Button>
        </div>
      ) : (
        <div className="card-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-dark/40 text-left text-muted border-b border-forest/5">
              <tr>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Code</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Value</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Min order</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Applies to</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Uses</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-t border-forest/5 hover:bg-cream/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-semibold text-forest">
                    {d.code}
                  </td>
                  <td className="px-5 py-4 text-forest">{d.name}</td>
                  <td className="px-5 py-4 font-medium">{formatDiscountValue(d)}</td>
                  <td className="px-5 py-4 text-muted">
                    {d.min_order_amount > 0
                      ? formatPrice(d.min_order_amount)
                      : "—"}
                  </td>
                  <td className="px-5 py-4 capitalize text-muted">{d.applies_to}</td>
                  <td className="px-5 py-4 text-muted">
                    {d.uses_count}
                    {d.max_uses != null ? ` / ${d.max_uses}` : ""}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs rounded-full px-2.5 py-1 font-medium ${
                        d.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <AdminActionBar>
                      <AdminActionButton
                        icon={d.is_active ? ToggleLeft : ToggleRight}
                        label={d.is_active ? "Pause" : "Activate"}
                        variant={d.is_active ? "danger" : "primary"}
                        onClick={() => toggleActive(d)}
                      />
                    </AdminActionBar>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New discount"
        subtitle="Create a coupon code for your customers"
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" form="discount-form" disabled={saving}>
              {saving ? "Saving…" : "Create discount"}
            </Button>
          </div>
        }
      >
        <form id="discount-form" onSubmit={handleCreate} className="space-y-4">
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
                  className="admin-input font-mono"
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
                  className="admin-input"
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
                  className="admin-input"
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
                  className="admin-input"
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
                  className="admin-input"
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
                  className="admin-input"
                  placeholder="Face & Body"
                />
              </div>
            )}
        </form>
      </AdminModal>
    </div>
  );
}
