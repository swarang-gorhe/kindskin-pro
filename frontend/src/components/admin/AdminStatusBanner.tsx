"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";

const DISMISS_KEY = "kindskin-admin-banner-dismissed";

function getDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function dismiss(id: string) {
  const set = getDismissed();
  set.add(id);
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...set]));
}

export function AdminStatusBanner({
  dataSource,
  message,
  id,
}: {
  dataSource?: "database" | "live_catalog";
  message?: string;
  id?: string;
}) {
  const bannerId =
    id ?? (message ? "custom" : dataSource === "live_catalog" ? "catalog" : "");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (bannerId && getDismissed().has(bannerId)) setVisible(false);
  }, [bannerId]);

  if (!visible) return null;
  if (!message && dataSource !== "live_catalog") return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/80 backdrop-blur-xl px-4 py-3.5 text-[13px] text-forest shadow-apple">
      <Info size={16} className="shrink-0 text-sage mt-0.5" strokeWidth={1.75} />
      <div className="flex-1 leading-relaxed text-muted">
        {message ?? (
          <>
            Viewing <span className="font-medium text-forest">live storefront catalog</span> (3 products).
            For full database sync, run Supabase migrations and set{" "}
            <code className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[11px] font-mono text-forest">
              SUPABASE_SERVICE_KEY
            </code>{" "}
            on Vercel.
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          dismiss(bannerId);
          setVisible(false);
        }}
        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-black/[0.05] hover:text-forest transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
