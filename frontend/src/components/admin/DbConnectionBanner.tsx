"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, ExternalLink } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";

type DbStatus = {
  ok: boolean;
  service_key_configured: boolean;
  database_connected: boolean;
  product_count: number;
  data_source: string;
  hint: string;
  vercel_env?: string;
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
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-terracotta/20 bg-terracotta/8 px-4 py-4 text-[13px] text-forest shadow-soft">
      <AlertCircle size={18} className="shrink-0 text-terracotta mt-0.5" />
      <div className="space-y-2 flex-1">
        <p className="font-medium text-forest">Database not connected on this deployment</p>
        <p className="text-muted leading-relaxed">{status.hint}</p>

        <ol className="text-muted text-xs space-y-1 list-decimal list-inside">
          <li>
            Vercel → <strong>Settings → Environment Variables</strong>
          </li>
          <li>
            Name exactly: <code className="bg-cream-dark px-1 rounded">SUPABASE_SERVICE_KEY</code>
          </li>
          <li>
            Value: Supabase → Settings → API → <strong>service_role</strong> (secret)
          </li>
          <li>Environment: <strong>Production</strong> (and Preview if you use preview URLs)</li>
          <li>
            <strong>Deployments → ⋮ → Redeploy</strong> — required after saving
          </li>
        </ol>

        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-cream px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest hover:text-cream transition-colors"
          >
            Open Vercel
            <ExternalLink size={12} />
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-cream px-3 py-1.5 text-xs font-medium text-forest hover:bg-cream-dark transition-colors"
          >
            <RefreshCw size={12} />
            Refresh after redeploy
          </button>
        </div>

        {status.vercel_env && (
          <p className="text-[10px] text-muted">
            Current deployment env: {status.vercel_env}
            {status.service_key_configured
              ? " · key detected but DB unreachable"
              : " · key not detected"}
          </p>
        )}
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
