"use client";

import Image from "next/image";
import { Plus, Trash2, Star } from "lucide-react";
import type { AdminProduct } from "@/lib/admin-api";

export type ProductEditorValues = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  short_description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  benefits: string[];
  stock_quantity: number;
  rating: number;
  review_count: number;
  is_active: boolean;
};

export function productToEditorValues(p: AdminProduct): ProductEditorValues {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    short_description: p.short_description,
    price: p.price,
    category: p.category,
    image: p.image,
    images: p.images?.length ? p.images : p.image ? [p.image] : [],
    benefits: p.benefits ?? [],
    stock_quantity: p.stock_quantity,
    rating: p.rating,
    review_count: p.review_count,
    is_active: p.is_active,
  };
}

export const emptyEditorValues: ProductEditorValues = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  short_description: "",
  price: 0,
  category: "General",
  image: "/images/products/aloe-vera-gel.jpg",
  images: ["/images/products/aloe-vera-gel.jpg"],
  benefits: [],
  stock_quantity: 0,
  rating: 4.5,
  review_count: 0,
  is_active: true,
};

type ProductEditorFormProps = {
  values: ProductEditorValues;
  onChange: (values: ProductEditorValues) => void;
  mode: "create" | "edit";
};

export function ProductEditorForm({
  values,
  onChange,
  mode,
}: ProductEditorFormProps) {
  function set<K extends keyof ProductEditorValues>(
    key: K,
    value: ProductEditorValues[K]
  ) {
    onChange({ ...values, [key]: value });
  }

  function addImage(url: string) {
    if (!url.trim()) return;
    const next = [...values.images, url.trim()];
    set("images", next);
    if (!values.image) set("image", url.trim());
  }

  function removeImage(index: number) {
    const next = values.images.filter((_, i) => i !== index);
    set("images", next);
    if (values.image === values.images[index]) {
      set("image", next[0] ?? "");
    }
  }

  function addBenefit(text: string) {
    if (!text.trim()) return;
    set("benefits", [...values.benefits, text.trim()]);
  }

  return (
    <div className="space-y-6">
      {/* Image gallery */}
      <section>
        <h4 className="text-sm font-medium text-forest mb-3">Product images</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {values.images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                values.image === url
                  ? "border-forest ring-2 ring-forest/20"
                  : "border-forest/10"
              }`}
            >
              <Image
                src={url}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-forest/70 p-1.5">
                <button
                  type="button"
                  onClick={() => set("image", url)}
                  className="flex-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-forest hover:bg-white"
                >
                  {values.image === url ? "Primary" : "Set primary"}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded-md bg-terracotta/90 p-1 text-white hover:bg-terracotta"
                  aria-label="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest/15 bg-cream/50 text-muted hover:border-sage hover:text-forest transition-colors">
            <Plus size={20} />
            <span className="text-xs">Add URL</span>
            <input
              type="text"
              className="sr-only"
              placeholder="Paste image URL"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  addImage(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-muted mb-1">
            Add image URL
          </label>
          <input
            type="url"
            placeholder="https://… or /images/products/…"
            className="admin-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
      </section>

      {/* Core fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name" required>
          <input
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Slug" required>
          <input
            required
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="admin-input"
            disabled={mode === "edit"}
          />
        </Field>
        <Field label="Tagline" className="sm:col-span-2">
          <input
            value={values.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Category">
          <input
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Price (₹)">
          <input
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className="admin-input"
          />
        </Field>
        {mode === "create" && (
          <Field label="Initial stock">
            <input
              type="number"
              min={0}
              value={values.stock_quantity}
              onChange={(e) =>
                set("stock_quantity", Number(e.target.value))
              }
              className="admin-input"
            />
          </Field>
        )}
        <Field label="Rating">
          <div className="relative">
            <Star
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta"
            />
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={values.rating}
              onChange={(e) => set("rating", Number(e.target.value))}
              className="admin-input pl-9"
            />
          </div>
        </Field>
        <Field label="Review count">
          <input
            type="number"
            min={0}
            value={values.review_count}
            onChange={(e) => set("review_count", Number(e.target.value))}
            className="admin-input"
          />
        </Field>
      </div>

      <Field label="Short description">
        <textarea
          rows={2}
          value={values.short_description}
          onChange={(e) => set("short_description", e.target.value)}
          className="admin-input resize-none"
        />
      </Field>

      <Field label="Full description">
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className="admin-input resize-none"
        />
      </Field>

      {/* Benefits */}
      <section>
        <h4 className="text-sm font-medium text-forest mb-2">Benefits</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {values.benefits.map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1 text-xs text-forest"
            >
              {b}
              <button
                type="button"
                onClick={() =>
                  set(
                    "benefits",
                    values.benefits.filter((_, j) => j !== i)
                  )
                }
                className="text-muted hover:text-terracotta"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add benefit and press Enter"
          className="admin-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addBenefit((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </section>

      {mode === "edit" && (
        <label className="flex items-center gap-3 rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
            className="h-4 w-4 rounded border-forest/20 text-forest focus:ring-forest/30"
          />
          <span className="text-sm text-forest">Product is active on storefront</span>
        </label>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-terracotta ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
