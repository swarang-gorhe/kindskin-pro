#!/usr/bin/env bash
# Run all Supabase migrations (001–005) against the remote KindSkin project.
#
# Option A — Supabase CLI (recommended):
#   supabase login
#   SUPABASE_DB_PASSWORD='your-db-password' ./scripts/run-migrations.sh
#
# Option B — connection string:
#   DATABASE_URL='postgresql://postgres.xxx:password@...pooler.supabase.com:6543/postgres' ./scripts/run-migrations.sh
#
# Option C — no CLI: paste supabase/all_migrations.sql in Supabase SQL Editor and click Run.
#
# DB password: Supabase Dashboard → Project Settings → Database → Database password

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="gcaaupopzmxxwkkjwzij"

echo "==> KindSkin — run migrations"
echo "    Project: https://${PROJECT_REF}.supabase.co"
echo ""

if ! command -v supabase >/dev/null 2>&1; then
  echo "Error: Supabase CLI not found. Install: brew install supabase/tap/supabase"
  echo "Or use SQL Editor: supabase/all_migrations.sql"
  exit 1
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "==> Pushing migrations via DATABASE_URL…"
  supabase db push --db-url "$DATABASE_URL" --include-all --yes
elif [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "==> Linking project and pushing migrations…"
  supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" --yes 2>/dev/null || \
    supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
  supabase db push --linked --include-all --yes
else
  echo "Error: Set SUPABASE_DB_PASSWORD or DATABASE_URL"
  echo ""
  echo "  1. Open https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
  echo "  2. Copy your Database password (or reset it)"
  echo "  3. Run:"
  echo "       SUPABASE_DB_PASSWORD='your-password' ./scripts/run-migrations.sh"
  echo ""
  echo "  Or paste supabase/all_migrations.sql in SQL Editor:"
  echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
  exit 1
fi

echo ""
echo "==> Migrations applied successfully."
echo "    Next: set SUPABASE_SERVICE_KEY on Vercel and redeploy."
