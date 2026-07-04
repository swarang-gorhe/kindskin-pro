"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  PackagePlus,
  SlidersHorizontal,
  Ban,
  Plus,
} from "lucide-react";
import {
  adminFetch,
  type AdminProduct,
  AdminApiError,
} from "@/lib/admin-api";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { AdminStatusBanner } from "@/components/admin/AdminStatusBanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DbConnectionBanner } from "@/components/admin/DbConnectionBanner";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  AdminActionBar,
  AdminActionButton,
} from "@/components/admin/AdminActionButton";
import {
  ProductEditorForm,
  productToEditorValues,
  emptyEditorValues,
  type ProductEditorValues,
} from "@/components/admin/ProductEditorForm";
import { Button } from "@/components/ui/Button";

const LOW_STOCK_THRESHOLD = 10;

function stockClass(qty: number) {
  if (qty === 0) return "text-red-600";
  if (qty < LOW_STOCK_THRESHOLD) return "text-amber-600";
  return "text-forest";
}

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"database" | "live_catalog">(
    "live_catalog"
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editorProduct, setEditorProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductEditorValues>(emptyEditorValues);
  const [saving, setSaving] = useState(false);

  const [stockModal, setStockModal] = useState<AdminProduct | null>(null);
  const [stockChange, setStockChange] = useState({ amount: 0, note: "" });
  const [deactivateTarget, setDeactivateTarget] = useState<AdminProduct | null>(
    null
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{
        products: AdminProduct[];
        source: "database" | "live_catalog";
      }>("/api/admin/products");
      setProducts(res.products);
      setDataSource(res.source);
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openCreate() {
    setEditorMode("create");
    setEditorProduct(null);
    setForm(emptyEditorValues);
    setEditorOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setEditorMode("edit");
    setEditorProduct(product);
    setForm(productToEditorValues(product));
    setEditorOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        short_description:
          form.short_description || form.description.slice(0, 200),
        images: form.images.length ? form.images : form.image ? [form.image] : [],
      };

      if (editorMode === "create") {
        await adminFetch("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast("Product created");
      } else if (editorProduct) {
        await adminFetch(`/api/admin/products/${editorProduct.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        showToast("Product updated");
      }

      setEditorOpen(false);
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
          note: delta > 0 ? "Quick restock (+10)" : "Quick adjustment",
        }),
      });
      showToast(`Stock updated for ${product.name}`);
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
    if (!deactivateTarget) return;
    try {
      await adminFetch(`/api/admin/products/${deactivateTarget.id}`, {
        method: "DELETE",
      });
      showToast("Product deactivated");
      setDeactivateTarget(null);
      await loadProducts();
    } catch (err) {
      showToast((err as AdminApiError).message, "error");
    }
  }

  return (
    <div className="space-y-8">
      <DbConnectionBanner />
      <AdminStatusBanner dataSource={dataSource} />

      <AdminPageHeader
        title="Products"
        subtitle={
          dataSource === "live_catalog"
            ? "Showing your live storefront catalog. Edit any product to sync it to the database."
            : "Manage your full product catalog — names, images, pricing, and stock."
        }
        action={
          <Button type="button" onClick={openCreate} className="gap-2">
            <Plus size={16} />
            Add product
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-soft h-80 animate-pulse bg-cream-dark/50"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card-soft p-12 text-center">
          <p className="text-muted">No products found.</p>
          <Button type="button" onClick={openCreate} className="mt-4">
            Add your first product
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="card-soft group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted text-sm">
                    No image
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-forest shadow-sm">
                    {p.category}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider shadow-sm backdrop-blur-sm",
                      p.is_active
                        ? "bg-green-100/90 text-green-800"
                        : "bg-gray-100/90 text-gray-600"
                    )}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-serif text-xl text-forest">{p.name}</h3>
                  {p.tagline && (
                    <p className="text-xs text-muted mt-1 line-clamp-1">
                      {p.tagline}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-forest">
                    {formatPrice(p.price)}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      stockClass(p.stock_quantity)
                    )}
                  >
                    {p.stock_quantity} in stock
                  </span>
                </div>

                {p.images.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {p.images.slice(0, 4).map((img, i) => (
                      <div
                        key={`${img}-${i}`}
                        className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-forest/10"
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ))}
                    {p.images.length > 4 && (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-dark text-[10px] text-muted">
                        +{p.images.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <AdminActionBar>
                  <AdminActionButton
                    icon={Pencil}
                    label="Edit"
                    variant="primary"
                    onClick={() => openEdit(p)}
                  />
                  <AdminActionButton
                    icon={PackagePlus}
                    label="+10"
                    onClick={() => quickStockAdjust(p, 10)}
                  />
                  <AdminActionButton
                    icon={SlidersHorizontal}
                    label="Stock"
                    onClick={() => setStockModal(p)}
                  />
                  {p.is_active && (
                    <AdminActionButton
                      icon={Ban}
                      label="Hide"
                      variant="danger"
                      onClick={() => setDeactivateTarget(p)}
                    />
                  )}
                </AdminActionBar>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editorMode === "create" ? "Add product" : "Edit product"}
        subtitle={
          editorMode === "edit" && editorProduct
            ? `Editing ${editorProduct.name}`
            : "Create a new product for your storefront"
        }
        size="xl"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-editor-form"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : editorMode === "create"
                  ? "Create product"
                  : "Save changes"}
            </Button>
          </div>
        }
      >
        <form id="product-editor-form" onSubmit={handleSave}>
          <ProductEditorForm
            values={form}
            onChange={setForm}
            mode={editorMode}
          />
        </form>
      </AdminModal>

      <AdminModal
        open={!!stockModal}
        onClose={() => setStockModal(null)}
        title="Adjust stock"
        subtitle={stockModal ? stockModal.name : undefined}
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStockModal(null)}
            >
              Cancel
            </Button>
            <Button type="submit" form="stock-form">
              Save
            </Button>
          </div>
        }
      >
        {stockModal && (
          <form id="stock-form" onSubmit={handleStockSubmit} className="space-y-4">
            <p className="text-sm text-muted">
              Current stock:{" "}
              <span className="font-medium text-forest">
                {stockModal.stock_quantity}
              </span>
            </p>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
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
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
                Note
              </label>
              <input
                required
                value={stockChange.note}
                onChange={(e) =>
                  setStockChange((s) => ({ ...s, note: e.target.value }))
                }
                placeholder="Reason for adjustment"
                className="admin-input"
              />
            </div>
          </form>
        )}
      </AdminModal>

      <AdminModal
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        title="Hide from storefront?"
        subtitle={
          deactivateTarget
            ? `${deactivateTarget.name} will be hidden from customers but kept for order history.`
            : undefined
        }
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeactivateTarget(null)}
            >
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={handleDeactivate}>
              Deactivate
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted leading-relaxed">
          You can re-activate this product later by editing it and checking
          &quot;Product is active on storefront&quot;.
        </p>
      </AdminModal>
    </div>
  );
}
