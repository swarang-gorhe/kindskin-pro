"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminActionButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
};

const variants = {
  default:
    "border-forest/10 bg-white text-forest hover:bg-cream-dark hover:border-forest/20",
  primary:
    "border-forest/15 bg-forest/5 text-forest hover:bg-forest hover:text-cream",
  danger:
    "border-terracotta/20 bg-terracotta/5 text-terracotta hover:bg-terracotta hover:text-white",
};

export function AdminActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled,
}: AdminActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "group flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 min-w-[4.5rem] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none",
        variants[variant]
      )}
    >
      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      <span className="text-[10px] font-medium uppercase tracking-wider leading-none">
        {label}
      </span>
    </button>
  );
}

export function AdminActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-forest/8 bg-cream/60 p-2">
      {children}
    </div>
  );
}
