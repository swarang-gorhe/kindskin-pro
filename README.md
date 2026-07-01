# KindSkin Co. — The Kind Way To Glow.

Premium, product-first ecommerce website for KindSkin Co., a natural/Ayurvedic skincare brand.

## Architecture

| Service | Stack | Deploy |
|---------|-------|--------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Framer Motion | [Vercel](https://vercel.com) |
| Backend | FastAPI, Python 3.11+ | [Railway](https://railway.app) or Render |
| Database | Supabase (Postgres) | Supabase Cloud |

## Getting Started

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

## Pages

- `/` — Homepage with hero, product showcase, ingredient story, testimonials
- `/products` — Product listing
- `/products/[slug]` — Product detail (Apple Store pattern)
- `/quiz` — Skincare consultation quiz
- `/quiz/results` — Personalized recommendations
- `/learn` — Skincare Knowledge Hub
- `/learn/[slug]` — Article pages with SEO schema
- `/about` — Brand story
- `/cart`, `/checkout` — Commerce flow
- `/contact` — Contact form

## AI Features

- **Quiz recommendations**: Rule-based product matching + optional Claude AI rationale
- **Chat assistant**: Grounded skincare Q&A with product deep-links
- **Tip of the Day**: Personalized tips based on quiz results
- **Article drafts**: Admin endpoint for AI-assisted content creation

Set `ANTHROPIC_API_KEY` in the backend `.env` to enable AI features. Without it, the app degrades gracefully with rule-based fallbacks.

## Deployment

Split deployment: **Vercel** hosts `/frontend` (Next.js), **Railway** hosts `/backend` (FastAPI). They communicate over HTTPS via `NEXT_PUBLIC_API_URL`.

### Deploy order

1. Deploy backend to Railway (staging, then production) and note the public URL.
2. Set `NEXT_PUBLIC_API_URL` on Vercel (Production → Railway prod URL; Preview → Railway staging URL).
3. Deploy frontend to Vercel.
4. Update Railway `CORS_ORIGINS` and `FRONTEND_URL` with the real Vercel production domain, then redeploy backend.

### Railway (Backend)

1. New Project → Deploy from GitHub → set **Root Directory** to `backend`
2. Create `staging` and `production` environments; map `main` → production, `develop` → staging (optional)
3. Set environment variables from `backend/.env.example` (secrets stay on Railway only)
4. Railway uses `railway.json` + `Procfile`; health check: `GET /health` → `{"status":"ok"}`
5. Optional custom domain: `api.kindskinco.com`

### Vercel (Frontend)

1. New Project → import GitHub repo
2. **Root Directory:** set to `frontend` (Settings → General → Root Directory → `frontend`) — **required**
3. **Framework Preset:** Next.js (not Create React App)
4. **Build Command:** leave default (`next build`) — turn **Override OFF**
5. **Install Command:** leave default (`npm install`) — turn **Override OFF** — do **not** use `cd frontend && npm install`
6. **Output Directory:** leave default (empty) — turn **Override OFF**
7. Set environment variables from `frontend/.env.example` per environment (Production / Preview / Development)
8. Production deploys on push to `main`; PRs get Preview deployments automatically

There is no `vercel.json` at the repo root — config lives in `frontend/vercel.json` and only applies when Root Directory is `frontend`.

### Verification checklist

- [ ] `GET https://<railway-url>/health` returns `{"status":"ok"}`
- [ ] Chat, quiz, checkout, and order tracking work from the Vercel frontend (no CORS errors in Network tab)
- [ ] Built frontend JS contains no `OPENAI_API_KEY` or `SUPABASE_SERVICE_KEY`
- [ ] Custom domains resolve with valid HTTPS on both services

## Environment Variables

| Variable | Set on | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | Vercel | Railway backend URL (prod vs staging per Vercel env) |
| `NEXT_PUBLIC_SITE_URL` | Vercel | Canonical frontend URL for metadata |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel | Supabase anon/publishable key only |
| `OPENAI_API_KEY` | Railway | OpenAI key for RAG chatbot — never on Vercel |
| `ANTHROPIC_API_KEY` | Railway | Claude key for quiz/article AI |
| `SUPABASE_URL` | Railway | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Railway | Service role key — server-side only |
| `DATABASE_URL` | Railway | Supabase Postgres connection string |
| `CORS_ORIGINS` | Railway | Comma-separated allowed frontend origins |
| `FRONTEND_URL` | Railway | Primary frontend URL for CORS/redirects |
| `KB_SIMILARITY_THRESHOLD` | Railway | RAG retrieval threshold |
| `KB_HIGH_CONFIDENCE_THRESHOLD` | Railway | RAG direct-answer threshold |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Railway | Payment credentials (when enabled) |

## License

Private — KindSkin Co.
