# Supabase — KindSkin Co.

Linked project: **gcaaupopzmxxwkkjwzij**  
Dashboard: https://supabase.com/dashboard/project/gcaaupopzmxxwkkjwzij

## Migrations (canonical location)

SQL migrations live in `supabase/migrations/` (managed by Supabase CLI).

| File | Purpose |
|------|---------|
| `001_kb_entries.sql` | pgvector + RAG knowledge base |
| `002_orders.sql` | Orders, items, status events |
| `003_profiles.sql` | User profiles + admin roles |
| `004_products_admin.sql` | Products catalog, stock, audit log |

Legacy copies remain in `backend/supabase/migrations/` for reference; use the root `supabase/` folder for CLI operations.

## One-command setup

From the repo root (requires browser login + database password):

```bash
chmod +x scripts/supabase-setup.sh
./scripts/supabase-setup.sh
```

This runs:

1. `supabase login`
2. `supabase link --project-ref gcaaupopzmxxwkkjwzij`
3. `supabase db push --linked`
4. Syncs `SUPABASE_URL` + service key into `backend/.env` and publishable key into `frontend/.env.local`

## Manual CLI steps

```bash
supabase login
supabase link --project-ref gcaaupopzmxxwkkjwzij
supabase db push --linked --include-all
```

## Environment variables

### Frontend (Vercel — public only)

```env
NEXT_PUBLIC_SUPABASE_URL=https://gcaaupopzmxxwkkjwzij.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_WZxpaeor9O3_vDY-b6LnmQ_kz2MWMfg
```

### Backend (Railway — server secrets)

```env
SUPABASE_URL=https://gcaaupopzmxxwkkjwzij.supabase.co
SUPABASE_SERVICE_KEY=<service_role key from dashboard or CLI>
SUPABASE_JWT_SECRET=<JWT secret from API settings>
DATABASE_URL=<Postgres connection string (pooler, port 6543)>
```

Get keys: `supabase projects api-keys --project-ref gcaaupopzmxxwkkjwzij --reveal`

## After migrations

```bash
cd backend
python scripts/ingest_kb.py
ADMIN_EMAIL=you@example.com CREATE_IF_MISSING=1 ADMIN_PASSWORD='...' python scripts/create_admin.py
```

Admin panel: `/admin/login` on the frontend.
