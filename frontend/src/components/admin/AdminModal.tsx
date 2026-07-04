"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  footer?: ReactNode;
};

const sizes = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "lg",
  footer,
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "card-soft w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in",
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-forest/5 px-6 py-5">
          <div>
            <p className="section-label mb-1">KindSkin Admin</p>
            <h3 className="font-serif text-2xl text-forest">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/10 text-muted hover:bg-cream-dark hover:text-forest transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-t border-forest/5 bg-cream/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
