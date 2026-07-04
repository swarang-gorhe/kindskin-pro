#!/usr/bin/env bash
# Create KindSkin admin user in Supabase Auth + profiles table.
# Password is passed at runtime only — never stored in this repo.
#
# Prerequisites in backend/.env:
#   SUPABASE_URL, SUPABASE_SERVICE_KEY
# Migration 003_profiles.sql must be applied.
#
# Usage:
#   ./scripts/bootstrap-admin.sh 'YourPassword'

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ADMIN_EMAIL="swanand.pushkaraj.akolkar@dpsnashik.in"
ADMIN_PASSWORD="${1:-}"

if [[ -z "$ADMIN_PASSWORD" ]]; then
  echo "Usage: ./scripts/bootstrap-admin.sh 'YourPassword'"
  exit 1
fi

cd "$ROOT/backend"

export ADMIN_EMAIL
export ADMIN_PASSWORD
export CREATE_IF_MISSING=1

python3 scripts/create_admin.py

echo ""
echo "Admin ready. Sign in at: https://kindskin-pro.vercel.app/admin/login"
echo "Email: $ADMIN_EMAIL"
