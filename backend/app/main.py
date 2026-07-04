from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.api.routes.api import router

limiter = Limiter(key_func=get_remote_address)


def _build_cors_origins() -> list[str]:
    origins: set[str] = set()
    for origin in settings.cors_origins.split(","):
        origin = origin.strip().rstrip("/")
        if origin:
            origins.add(origin)
    if settings.frontend_url:
        origins.add(settings.frontend_url.strip().rstrip("/"))
    return sorted(origins)


app = FastAPI(title=settings.app_name, version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
