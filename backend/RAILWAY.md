# Railway backend deploy — step by step

Deploy **only** the `backend/` folder. Do not deploy the Next.js frontend to Railway.

## 1. Create the Railway project

1. Open [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select **`swarang-gorhe/kindskin-pro`**.
4. Railway may create a service — if it fails immediately, continue to step 2.

## 2. Root directory OR root Dockerfile (pick one)

Railway must build the **backend**, not the whole monorepo.

### Option A — Root Dockerfile (easiest, no dashboard setting)

This repo includes a **root `Dockerfile`** that builds `backend/` automatically.
Railway detects it and uses Docker instead of Railpack — **no Root Directory setting needed**.

Just connect the GitHub repo and deploy. After push, click **Redeploy** on Railway.

### Option B — Root Directory in dashboard

1. Click your **service** (not the project name).
2. Go to **Settings** tab.
3. Find **Root Directory** → **Add root directory** (or Edit).
4. Enter exactly:
   ```
   backend
   ```
5. Save. Railway will redeploy automatically.

Without Option A or B, Railpack scans the repo root, finds no Python app, and fails with
`Railpack could not determine how to build the app`.

## 3. Generate a public URL

1. Open the service → **Settings** → **Networking**.
2. Click **Generate Domain**.
3. Copy the URL, e.g. `https://kindskin-pro-production.up.railway.app`.
4. Use this as **`NEXT_PUBLIC_API_URL`** on Vercel.

Test: open `https://YOUR-RAILWAY-URL/health` — should return `{"status":"ok"}`.

## 4. Environment variables

Service → **Variables** tab → **Raw Editor** → paste (replace placeholders):

```env
CORS_ORIGINS=https://kindskin-pro.vercel.app,https://YOUR-VERCEL-URL.vercel.app
FRONTEND_URL=https://kindskin-pro.vercel.app
SUPABASE_URL=https://gcaaupopzmxxwkkjwzij.supabase.co
OPENAI_API_KEY=your-openai-key
DATABASE_URL=your-supabase-postgres-connection-string
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
KB_SIMILARITY_THRESHOLD=0.72
KB_HIGH_CONFIDENCE_THRESHOLD=0.92
```

**Minimum to start** (chatbot uses local keyword fallback without OpenAI/DB):

```env
CORS_ORIGINS=https://kindskin-pro.vercel.app
FRONTEND_URL=https://kindskin-pro.vercel.app
```

## 5. Build settings (if deploy still fails)

**Settings → Build:**

| Setting | Value |
|---------|--------|
| Builder | Dockerfile **or** Nixpacks (both work) |
| Root Directory | `backend` |

**Settings → Deploy:**

| Setting | Value |
|---------|--------|
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Healthcheck path | `/health` |

## 6. Connect Vercel to Railway

On Vercel → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

Redeploy Vercel after saving.

## Common errors

| Error | Fix |
|-------|-----|
| `Railpack could not determine how to build` | Redeploy latest `main` — root `Dockerfile` fixes this. Or set Root Directory = `backend` |
| `requirements.txt not found` | Root Directory must be `backend`, or use root Dockerfile on latest commit |
| `ModuleNotFoundError: app` | Same — deploy from `backend/`, not repo root |
| Health check failed | Check **Deploy Logs**; ensure `/health` returns 200 |
| CORS errors in browser | Add your Vercel URL to `CORS_ORIGINS` on Railway |
| Chatbot fallback only | Add `OPENAI_API_KEY` + `DATABASE_URL`, run `python scripts/ingest_kb.py` locally |

## Optional: full RAG chatbot

1. Run `backend/supabase/migrations/001_kb_entries.sql` in Supabase SQL editor.
2. Set `OPENAI_API_KEY` and `DATABASE_URL` on Railway.
3. Locally: `cd backend && python scripts/ingest_kb.py`
4. Redeploy Railway (not required after ingest — data is in Supabase).
