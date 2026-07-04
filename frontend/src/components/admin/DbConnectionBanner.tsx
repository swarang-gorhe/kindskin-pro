"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";

type DbStatus = {
  ok: boolean;
  service_key_configured: boolean;
  database_connected: boolean;
  product_count: number;
  data_source: string;
  hint: string;
};

export function DbConnectionBanner() {
  const [status, setStatus] = useState<DbStatus | null>(null);

  useEffect(() => {
    adminFetch<DbStatus>("/api/admin/status")
      .then(setStatus)
      .catch(() => null);
  }, []);

  if (!status || status.ok) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-terracotta/20 bg-terracotta/8 px-4 py-3.5 text-[13px] text-forest shadow-soft">
      <AlertCircle size={18} className="shrink-0 text-terracotta mt-0.5" />
      <div className="space-y-1.5">
        <p className="font-medium text-forest">Database not connected on this deployment</p>
        <p className="text-muted leading-relaxed">{status.hint}</p>
        <p className="text-muted text-xs flex items-center gap-1.5">
          <RefreshCw size={12} />
          After adding env vars in Vercel, you must <strong>Redeploy</strong> (Deployments → ⋮ → Redeploy).
          Saving variables alone does not update the live site.
        </p>
      </div>
    </div>
  );
}

export function DbConnectionOk({ status }: { status?: DbStatus | null }) {
  if (!status?.ok) return null;
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-sage">
      <CheckCircle2 size={14} />
      Database connected · {status.product_count} products synced
    </div>
  );
}
