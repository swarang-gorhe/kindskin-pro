#!/usr/bin/env bash
# Push Supabase + OpenAI keys from backend/.env to Vercel and redeploy.
#
# Prerequisites (one-time):
#   npx vercel login
#   npx vercel link   # select kindskin-pro, root directory = frontend
#
# Usage:
#   ./scripts/vercel-env-setup.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/backend/.env"
FRONTEND_DIR="$ROOT/frontend"

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx required"
  exit 1
fi

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Not logged in to Vercel. Run: npx vercel login"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

get_env() {
  local key="$1"
  grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | sed 's/^["'\'']//;s/["'\'']$//'
}

add_vercel_env() {
  local name="$1"
  local value="$2"
  local target="${3:-production}"

  if [[ -z "$value" ]]; then
    echo "  skip $name (empty in backend/.env)"
    return
  fi

  echo "  → $name ($target)"
  npx vercel env rm "$name" "$target" --yes 2>/dev/null || true
  printf '%s' "$value" | npx vercel env add "$name" "$target" --yes
}

echo "==> Vercel env setup for KindSkin"
echo ""

# Link from frontend directory (project root on Vercel should be 'frontend')
if [[ ! -f "$FRONTEND_DIR/.vercel/project.json" ]]; then
  echo "==> Linking Vercel project (select kindskin-pro if prompted)..."
  cd "$FRONTEND_DIR"
  npx vercel link --yes 2>/dev/null || npx vercel link
  cd "$ROOT"
fi

cd "$FRONTEND_DIR"

SERVICE_KEY="$(get_env SUPABASE_SERVICE_KEY)"
OPENAI_KEY="$(get_env OPENAI_API_KEY)"
SUPABASE_URL="$(get_env SUPABASE_URL)"

echo "==> Adding environment variables..."

for TARGET in production preview; do
  echo "  --- $TARGET ---"
  add_vercel_env "SUPABASE_SERVICE_KEY" "$SERVICE_KEY" "$TARGET"
  add_vercel_env "OPENAI_API_KEY" "$OPENAI_KEY" "$TARGET"
  if [[ -n "$SUPABASE_URL" ]]; then
    add_vercel_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "$TARGET"
  fi
done

echo ""
echo "==> Deploying to production..."
npx vercel deploy --prod --yes

echo ""
echo "==> Done. Verify: https://kindskin-pro.vercel.app/api/health/db"
echo "    Expect: service_key_configured=true, database_connected=true, product_count=3"
