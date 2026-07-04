"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  adminFetch,
  type AdminProduct,
  AdminApiError,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";

const LOW_STOCK_THRESHOLD = 10;

function stockClass(qty: number) {
  if (qty === 0) return "text-red-600 font-semibold";
  if (qty < LOW_STOCK_THRESHOLD) return "text-amber-600 font-medium";
  return "text-forest";
}

type ProductForm = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock_quantity: number;
};

const emptyForm: ProductForm = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price: 0,
  category: "General",
  image: "/images/products/aloe-vera-gel.jpg",
  stock_quantity: 0,
};

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [stockModal, setStockModal] = useState<AdminProduct | null>(null);
  const [stockChange, setStockChange] = useState({ amount: 0, note: "" });
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{ products: AdminProduct[] }>(
        "/api/admin/products"
      );
      setProducts(res.products);
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          short_description: form.description.slice(0, 200),
          images: form.image ? [form.image] : [],
          benefits: [],
        }),
      });
      showToast("Product created");
      setShowForm(false);
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function quickStockAdjust(product: AdminProduct, delta: number) {
    try {
      await adminFetch(`/api/admin/products/${product.id}/stock`, {
        method: "POST",
        body: JSON.stringify({
          change_amount: delta,
          reason: delta > 0 ? "restock" : "manual_adjustment",
          note: delta > 0 ? "Quick restock" : "Quick adjustment",
        }),
      });
      showToast("Stock updated");
      await loadProducts();
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    }
  }

  async function handleStockSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stockModal) return;
    try {
      await adminFetch(`/api/admin/products/${stockModal.id}/stock`, {
        method: "POST",
        body: JSON.stringify({
          change_amount: stockChange.amount,
          reason: "manual_adjustment",
          note: stockChange.note || "Manual stock adjustment",
        }),
      });
      showToast("Stock adjusted");
      setStockModal(null);
      setStockChange({ amount: 0, note: "" });
      await loadProducts();
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    }
  }

  async function handleDeactivate() {
    if (!deactivateId) return;
    try {
      await adminFetch(`/api/admin/products/${deactivateId}`, {
        method: "DELETE",
      });
      showToast("Product deactivated");
      setDeactivateId(null);
      await loadProducts();
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-forest">Products</h2>
          <p className="text-sm text-muted mt-1">
            Manage catalog, stock, and availability.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-forest text-cream px-4 py-2 text-sm font-medium hover:bg-forest-light"
        >
          Add product
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-muted">No products found.</p>
      ) : (
        <div className="rounded-xl border border-cream-dark bg-cream overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-dark/50 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-cream-dark">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      )}
                      <span className="font-medium text-forest">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className={`px-4 py-3 ${stockClass(p.stock_quantity)}`}>
                    {p.stock_quantity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${
                        p.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => quickStockAdjust(p, 10)}
                        className="text-xs text-sage hover:text-forest"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockModal(p)}
                        className="text-xs text-sage hover:text-forest underline"
                      >
                        Adjust
                      </button>
                      {p.is_active && (
                        <button
                          type="button"
                          onClick={() => setDeactivateId(p.id)}
                          className="text-xs text-terracotta hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
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
            <h3 className="font-serif text-xl text-forest">Add product</h3>
            {(
              [
                ["name", "Name", "text"],
                ["slug", "Slug", "text"],
                ["tagline", "Tagline", "text"],
                ["category", "Category", "text"],
                ["image", "Image URL", "text"],
                ["price", "Price (₹)", "number"],
                ["stock_quantity", "Initial stock", "number"],
              ] as const
            ).map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-forest mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  required={key === "name" || key === "slug"}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [key]:
                        type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-cream-dark px-3 py-2"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-forest mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full rounded-lg border border-cream-dark px-3 py-2"
              />
            </div>
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

      {stockModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleStockSubmit}
            className="w-full max-w-md rounded-xl bg-cream p-6 space-y-4"
          >
            <h3 className="font-serif text-xl text-forest">
              Adjust stock — {stockModal.name}
            </h3>
            <p className="text-sm text-muted">
              Current stock: {stockModal.stock_quantity}
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">
                Change amount (+/−)
              </label>
              <input
                type="number"
                required
                value={stockChange.amount}
                onChange={(e) =>
                  setStockChange((s) => ({
                    ...s,
                    amount: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-cream-dark px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Note (required)
              </label>
              <input
                required
                value={stockChange.note}
                onChange={(e) =>
                  setStockChange((s) => ({ ...s, note: e.target.value }))
                }
                className="w-full rounded-lg border border-cream-dark px-3 py-2"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setStockModal(null)}
                className="px-4 py-2 text-sm text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-forest text-cream px-4 py-2 text-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {deactivateId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-cream p-6 space-y-4">
            <h3 className="font-serif text-xl text-forest">Deactivate product?</h3>
            <p className="text-sm text-muted">
              The product will be hidden from customers but preserved for order history.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeactivateId(null)}
                className="px-4 py-2 text-sm text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                className="rounded-lg bg-terracotta text-white px-4 py-2 text-sm"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
