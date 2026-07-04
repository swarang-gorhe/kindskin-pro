"use client";

import { type ReactNode } from "react";

type AdminPageHeaderProps = {
  label?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function AdminPageHeader({
  label = "KindSkin Admin",
  title,
  subtitle,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="section-label mb-2">{label}</p>
        <h2 className="font-serif text-3xl md:text-4xl text-forest tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
