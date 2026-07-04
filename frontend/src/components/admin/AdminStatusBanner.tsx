"use client";

export function AdminStatusBanner({
  dataSource,
  message,
}: {
  dataSource?: "database" | "live_catalog";
  message?: string;
}) {
  if (!message && dataSource !== "live_catalog") return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {message ?? (
        <>
          Showing <strong>live customer catalog</strong> (3 products from the
          storefront). Railway backend is offline — run Supabase migrations and
          set <code className="text-xs">SUPABASE_SERVICE_KEY</code> on Vercel for
          full DB sync.
        </>
      )}
    </div>
  );
}
