#!/usr/bin/env bash
# KindSkin — link Supabase project, push migrations, and sync backend env.
#
# Prerequisites: Supabase CLI installed (`brew install supabase/tap/supabase`)
#
# Usage:
#   ./scripts/supabase-setup.sh
#
# You will be prompted to:
#   1. Log in via browser (supabase login)
#   2. Enter your database password (Supabase Dashboard → Project Settings → Database)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="gcaaupopzmxxwkkjwzij"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
BACKEND_ENV="$ROOT/backend/.env"
FRONTEND_ENV="$ROOT/frontend/.env.local"

echo "==> KindSkin Supabase setup"
echo "    Project: $SUPABASE_URL"
echo ""

if ! command -v supabase >/dev/null 2>&1; then
  echo "Error: Supabase CLI not found. Install with: brew install supabase/tap/supabase"
  exit 1
fi

echo "==> 1/4 Login to Supabase (browser will open)..."
supabase login

echo ""
echo "==> 2/4 Link local project to remote..."
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "==> 3/4 Push database migrations..."
supabase db push --linked --include-all

echo ""
echo "==> 4/4 Fetch API keys and update env files..."

KEYS_JSON="$(supabase projects api-keys --project-ref "$PROJECT_REF" --reveal --output json)"

python3 <<'PY' "$KEYS_JSON" "$SUPABASE_URL" "$BACKEND_ENV" "$FRONTEND_ENV"
import json, sys, re
from pathlib import Path

keys_json, supabase_url, backend_env, frontend_env = sys.argv[1:5]
keys = json.loads(keys_json)

service_key = ""
publishable_key = ""
for item in keys:
    name = (item.get("name") or "").lower()
    key = item.get("api_key") or item.get("key") or ""
    if "service" in name or name == "service_role":
        service_key = key
    if "publishable" in name or name == "anon":
        publishable_key = key or publishable_key

def upsert_env(path: Path, updates: dict):
    text = path.read_text() if path.exists() else ""
    for k, v in updates.items():
        line = f"{k}={v}"
        pattern = re.compile(rf"^{re.escape(k)}=.*$", re.M)
        if pattern.search(text):
            text = pattern.sub(line, text)
        else:
            text = text.rstrip() + ("\n" if text and not text.endswith("\n") else "") + line + "\n"
    path.write_text(text)

backend = Path(backend_env)
upsert_env(backend, {
    "SUPABASE_URL": supabase_url,
    "SUPABASE_SERVICE_KEY": service_key,
})

frontend = Path(frontend_env)
upsert_env(frontend, {
    "NEXT_PUBLIC_SUPABASE_URL": supabase_url,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": publishable_key or "sb_publishable_WZxpaeor9O3_vDY-b6LnmQ_kz2MWMfg",
})

print("Updated backend/.env: SUPABASE_URL, SUPABASE_SERVICE_KEY")
print("Updated frontend/.env.local: NEXT_PUBLIC_SUPABASE_*")
PY

echo ""
echo "==> Manual step: add these to backend/.env and Railway (Dashboard → Project Settings → API):"
echo "    SUPABASE_JWT_SECRET=<JWT Secret from Supabase API settings>"
echo "    DATABASE_URL=<Connection string from Supabase Database settings>"
echo ""
echo "    Tip: DATABASE_URL format (pooler, port 6543):"
echo "    postgresql://postgres.${PROJECT_REF}:<DB_PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres"
echo ""
echo "==> Next steps:"
echo "    cd backend && python scripts/ingest_kb.py"
echo "    ADMIN_EMAIL=you@example.com CREATE_IF_MISSING=1 ADMIN_PASSWORD='...' python scripts/create_admin.py"
echo ""
echo "Done. Migrations applied to $SUPABASE_URL"
